import {EditorContent, useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';

import {useEffect, useState, useRef} from 'react';
import './MarkdownEditor.css';

interface Props {
    content: string;
    onChange: (content: string) => void;
}

// Stats : lignes, mots, caractères
interface Stats {
    lines: number;
    words: number;
    chars: number;
}

// Menu contextuel position
interface ContextMenu {
    visible: boolean;
    x: number;
    y: number;
}

// Éditeur WYSIWYG : **gras**, *italique*, # titre, - liste
function MarkdownEditor({content, onChange}: Props) {

    const [stats, setStats] = useState<Stats>({lines: 0, words: 0, chars: 0});
    const [locked, setLocked] = useState(false);
    const [contextMenu, setContextMenu] = useState<ContextMenu>({visible: false, x: 0, y: 0});
    const editorRef = useRef<HTMLDivElement>(null);

    // Calcule les stats à partir du texte
    function updateStats(text: string) {
        const lines = text.split('\n').filter(line => line.trim()).length;
        const words = text.split(/\s+/).filter(w => w.trim()).length;
        const chars = text.replace(/\s/g, '').length;
        setStats({lines, words, chars});
    }

    const editor = useEditor({

        editable: !locked,

        extensions: [
            StarterKit.configure({
                heading: {levels: [1, 2, 3]},
                bulletList: {},
                orderedList: {},
                blockquote: {},
                codeBlock: {},
                code: {},
                bold: {},
                italic: {},
                strike: {},
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            Link.configure({
                autolink: true,
                openOnClick: false,
            }),

            Placeholder.configure({
                placeholder: 'Écrivez ici... (**gras**, *italique*, # titre)',
            }),
        ],
        content: content,
        onUpdate: ({editor}) => {
            const html = editor.getHTML();
            const text = editor.getText();
            onChange(html);
            updateStats(text);
        },

    });


    // Synchronise le contenu quand on change de note
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
            updateStats(editor.getText());
        }
    }, [content, editor]);

    const toggleLocked = () => {

        if (!editor) return;

        setLocked(prev => {
            const newState = !prev;
            editor.setEditable(!newState);
            return newState;
        })
    }

    // Gère le clic droit pour afficher le menu contextuel
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        if (locked) return;

        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
        });
    };

    // Ferme le menu contextuel
    const closeContextMenu = () => {
        setContextMenu({...contextMenu, visible: false});
    };

    // Ferme le menu si on clique ailleurs
    useEffect(() => {
        const handleClick = () => closeContextMenu();
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    // Actions du menu contextuel
    const insertTable = () => {
        editor?.chain().focus().insertTable({rows: 3, cols: 3, withHeaderRow: true}).run();
        closeContextMenu();
    };
    const addRowAfter = () => { editor?.chain().focus().addRowAfter().run(); closeContextMenu(); };
    const deleteRow = () => { editor?.chain().focus().deleteRow().run(); closeContextMenu(); };
    const addColAfter = () => { editor?.chain().focus().addColumnAfter().run(); closeContextMenu(); };
    const deleteCol = () => { editor?.chain().focus().deleteColumn().run(); closeContextMenu(); };
    const deleteTable = () => { editor?.chain().focus().deleteTable().run(); closeContextMenu(); };

    return (

        <div className="markdown-editor">

            <button className="lock-button" onClick={toggleLocked}>
                {locked ? "🔓 Débloquer" : "🔒 Bloquer l’édition"}
            </button>


            <div
                className={locked ? "editor-wrapper locked" : "editor-wrapper"}
                onContextMenu={handleContextMenu}
                ref={editorRef}
            >
                <EditorContent editor={editor}/>
            </div>

            {/* Menu contextuel (clic droit) */}
            {contextMenu.visible && (
                <div
                    className="context-menu"
                    style={{top: contextMenu.y, left: contextMenu.x}}
                >
                    <div className="context-menu-title">🎃 Tableau</div>
                    <button onClick={insertTable}>Insérer tableau</button>
                    <button onClick={addRowAfter}>Ajouter ligne</button>
                    <button onClick={addColAfter}>Ajouter colonne</button>
                    <hr />
                    <button onClick={deleteRow}>Supprimer ligne</button>
                    <button onClick={deleteCol}>Supprimer colonne</button>
                    <button onClick={deleteTable} className="danger">Supprimer tableau</button>
                </div>
            )}




            {/* Barre de statistiques */}
            <div className="stats-bar">
                <span className="stat-item">
                    📄 <strong>{stats.lines}</strong> ligne{stats.lines > 1 ? 's' : ''}
                </span>
                <span className="stat-item">
                    📝 <strong>{stats.words}</strong> mot{stats.words > 1 ? 's' : ''}
                </span>
                <span className="stat-item">
                    🔤 <strong>{stats.chars}</strong> caractère{stats.chars > 1 ? 's' : ''}
                </span>
            </div>
        </div>
    );


}

export default MarkdownEditor

import {EditorContent, useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Mention from '@tiptap/extension-mention';

import {useEffect, useState, useRef, useMemo} from 'react';
import './MarkdownEditor.css';
import { createMentionSuggestion } from './mentionSuggestion';
import type { MentionItem } from './MentionList';

interface Props {
    content: string;
    onChange: (content: string) => void;
    notes?: MentionItem[];           // Liste des notes pour les @mentions
    onMentionClick?: (noteId: number) => void;  // Callback quand on clique sur une mention
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
function MarkdownEditor({content, onChange, notes = [], onMentionClick}: Props) {

    const [stats, setStats] = useState<Stats>({lines: 0, words: 0, chars: 0});
    const [locked, setLocked] = useState(false);
    const [contextMenu, setContextMenu] = useState<ContextMenu>({visible: false, x: 0, y: 0});
    const editorRef = useRef<HTMLDivElement>(null);

    // Calcule les stats en temps réel
    function updateStats(text: string) {
        const lines = text.split('\n').filter(line => line.trim()).length;
        const words = text.split(/\s+/).filter(w => w.trim()).length;
        const chars = text.replace(/\s/g, '').length;
        setStats({lines, words, chars});
    }

    // Config des @mentions (mémorisée pour éviter les re-renders)
    const mentionSuggestion = useMemo(() => createMentionSuggestion(notes), [notes]);

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
            Underline,
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
            // Extension @mention pour lier des notes
            Mention.configure({
                HTMLAttributes: {
                    class: 'note-mention',
                },
                suggestion: mentionSuggestion,
                renderHTML({ options, node }) {
                    return [
                        'span',
                        {
                            ...options.HTMLAttributes,
                            'data-note-id': node.attrs.id,
                        },
                        `@${node.attrs.label ?? node.attrs.id}`,
                    ];
                },
            }),
            Placeholder.configure({
                placeholder: 'Écrivez ici... Tapez @ pour lier une note',
            }),
        ],
        content: content,
        onUpdate: ({editor}) => {
            const html = editor.getHTML();
            const text = editor.getText();
            onChange(html);
            updateStats(text);
        },

    }, [mentionSuggestion]);


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

    // Gère le clic sur une @mention
    const handleEditorClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('note-mention') && onMentionClick) {
            const noteId = target.getAttribute('data-note-id');
            if (noteId) {
                onMentionClick(parseInt(noteId, 10));
            }
        }
    };

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

    // === ACTIONS TOOLBAR ===
    // Chaque fonction applique un format au texte sélectionné via TipTap
    const toggleBold = () => editor?.chain().focus().toggleBold().run();
    const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
    const toggleUnderline = () => editor?.chain().focus().toggleUnderline().run();
    const toggleStrike = () => editor?.chain().focus().toggleStrike().run();
    const toggleCode = () => editor?.chain().focus().toggleCode().run();
    const toggleCodeBlock = () => editor?.chain().focus().toggleCodeBlock().run();
    const toggleBlockquote = () => editor?.chain().focus().toggleBlockquote().run();
    const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run();
    const toggleOrderedList = () => editor?.chain().focus().toggleOrderedList().run();
    const setHeading1 = () => editor?.chain().focus().toggleHeading({level: 1}).run();
    const setHeading2 = () => editor?.chain().focus().toggleHeading({level: 2}).run();
    const setHeading3 = () => editor?.chain().focus().toggleHeading({level: 3}).run();
    const addHorizontalRule = () => editor?.chain().focus().setHorizontalRule().run();
    const undo = () => editor?.chain().focus().undo().run();
    const redo = () => editor?.chain().focus().redo().run();

    // Vérifie si un format est actif (pour highlight le bouton)
    const isActive = (format: string, options?: any) => {
        return editor?.isActive(format, options) ?? false;
    };

    return (

        <div className="markdown-editor">

            {/* === BARRE D'OUTILS === Boutons de mise en forme du texte */}
            <div className="editor-toolbar">
                {/* Groupe 1 : Style de texte (gras, italique, souligné, barré) */}
                <div className="toolbar-group">
                    <button
                        type="button"
                        className={`toolbar-btn ${isActive('bold') ? 'active' : ''}`}
                        onClick={toggleBold}
                        data-tooltip="Gras (Ctrl+B)"
                        disabled={locked}
                    >
                        <strong>B</strong>
                    </button>
                    <button
                        type="button"
                        className={`toolbar-btn ${isActive('italic') ? 'active' : ''}`}
                        onClick={toggleItalic}
                        data-tooltip="Italique (Ctrl+I)"
                        disabled={locked}
                    >
                        <em>I</em>
                    </button>
                    <button
                        type="button"
                        className={`toolbar-btn ${isActive('underline') ? 'active' : ''}`}
                        onClick={toggleUnderline}
                        data-tooltip="Souligné (Ctrl+U)"
                        disabled={locked}
                    >
                        <u>U</u>
                    </button>
                    <button
                        type="button"
                        className={`toolbar-btn ${isActive('strike') ? 'active' : ''}`}
                        onClick={toggleStrike}
                        data-tooltip="Barré"
                        disabled={locked}
                    >
                        <s>S</s>
                    </button>
                </div>

                <div className="toolbar-divider"></div>

                {/* Groupe 2 : Titres (H1, H2, H3) */}
                <div className="toolbar-group">
                    <button
                        type="button"
                        className={`toolbar-btn ${isActive('heading', {level: 1}) ? 'active' : ''}`}
                        onClick={setHeading1}
                        data-tooltip="Titre 1"
                        disabled={locked}
                    >
                        H1
                    </button>
                    <button
                        type="button"
                        className={`toolbar-btn ${isActive('heading', {level: 2}) ? 'active' : ''}`}
                        onClick={setHeading2}
                        data-tooltip="Titre 2"
                        disabled={locked}
                    >
                        H2
                    </button>
                    <button
                        type="button"
                        className={`toolbar-btn ${isActive('heading', {level: 3}) ? 'active' : ''}`}
                        onClick={setHeading3}
                        data-tooltip="Titre 3"
                        disabled={locked}
                    >
                        H3
                    </button>
                </div>

                <div className="toolbar-divider"></div>

                {/* Groupe 3 : Listes et citations */}
                <div className="toolbar-group">
                    <button
                        type="button"
                        className={`toolbar-btn ${isActive('bulletList') ? 'active' : ''}`}
                        onClick={toggleBulletList}
                        data-tooltip="Liste à puces"
                        disabled={locked}
                    >
                        •
                    </button>
                    <button
                        type="button"
                        className={`toolbar-btn ${isActive('orderedList') ? 'active' : ''}`}
                        onClick={toggleOrderedList}
                        data-tooltip="Liste numérotée"
                        disabled={locked}
                    >
                        1.
                    </button>
                    <button
                        type="button"
                        className={`toolbar-btn ${isActive('blockquote') ? 'active' : ''}`}
                        onClick={toggleBlockquote}
                        data-tooltip="Citation"
                        disabled={locked}
                    >
                        ❝
                    </button>
                </div>

                <div className="toolbar-divider"></div>

                {/* Groupe 4 : Code et séparateurs */}
                <div className="toolbar-group">
                    <button
                        type="button"
                        className={`toolbar-btn ${isActive('code') ? 'active' : ''}`}
                        onClick={toggleCode}
                        data-tooltip="Code inline"
                        disabled={locked}
                    >
                        {'</>'}
                    </button>
                    <button
                        type="button"
                        className={`toolbar-btn ${isActive('codeBlock') ? 'active' : ''}`}
                        onClick={toggleCodeBlock}
                        data-tooltip="Bloc de code"
                        disabled={locked}
                    >
                        {'{ }'}
                    </button>
                    <button
                        type="button"
                        className="toolbar-btn"
                        onClick={addHorizontalRule}
                        data-tooltip="Ligne horizontale"
                        disabled={locked}
                    >
                        —
                    </button>
                </div>

                <div className="toolbar-divider"></div>

                {/* Groupe 5 : Insertion de tableau */}
                <div className="toolbar-group">
                    <button
                        type="button"
                        className="toolbar-btn"
                        onClick={insertTable}
                        data-tooltip="Insérer tableau"
                        disabled={locked}
                    >
                        ⊞
                    </button>
                </div>

                {/* Espace flexible pour pousser les boutons suivants à droite */}
                <div className="toolbar-spacer"></div>

                {/* Groupe 6 : Annuler / Rétablir */}
                <div className="toolbar-group">
                    <button
                        type="button"
                        className="toolbar-btn"
                        onClick={undo}
                        data-tooltip="Annuler (Ctrl+Z)"
                        disabled={locked}
                    >
                        ↶
                    </button>
                    <button
                        type="button"
                        className="toolbar-btn"
                        onClick={redo}
                        data-tooltip="Rétablir (Ctrl+Y)"
                        disabled={locked}
                    >
                        ↷
                    </button>
                </div>

                <div className="toolbar-divider"></div>

                {/* Bouton verrouillage : empêche les modifications accidentelles */}
                <button
                    type="button"
                    className={`toolbar-btn lock-btn ${locked ? 'locked' : ''}`}
                    onClick={toggleLocked}
                    data-tooltip={locked ? "Débloquer l'édition" : "Bloquer l'édition"}
                >
                    {locked ? "🔒" : "🔓"}
                </button>
            </div>

            {/* Zone d'édition TipTap - clic droit pour menu contextuel tableau */}
            <div
                className={locked ? "editor-wrapper locked" : "editor-wrapper"}
                onContextMenu={handleContextMenu}
                onClick={handleEditorClick}
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

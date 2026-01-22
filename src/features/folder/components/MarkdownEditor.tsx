import {EditorContent, useEditor, Extension} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Mention from '@tiptap/extension-mention';

// Custom extension to exit table with Ctrl+Enter
const ExitTable = Extension.create({
    name: 'exitTable',
    addKeyboardShortcuts() {
        return {
            'Mod-Enter': ({ editor }) => {
                // Check if we're in a table
                if (editor.isActive('table')) {
                    const { $to } = editor.state.selection;
                    const after = $to.after(1);
                    editor.chain().insertContentAt(after, { type: 'paragraph' }).focus(after + 1).run();
                    return true;
                }
                return false;
            },
        };
    },
});

import {useEffect, useState, useRef, useMemo} from 'react';
import './MarkdownEditor.css';
import { createMentionSuggestion } from './mentionSuggestion';
import type { MentionItem } from './MentionList';

interface Props {
    content: string;
    onChange: (content: string) => void;
    notes?: MentionItem[];
    onMentionClick?: (noteId: number) => void;
    locked?: boolean;
    onToggleLock?: () => void;
}

interface Stats {
    lines: number;
    words: number;
    chars: number;
}

interface ContextMenu {
    visible: boolean;
    x: number;
    y: number;
}

function MarkdownEditor({content, onChange, notes = [], onMentionClick, locked = false, onToggleLock}: Props) {

    const [stats, setStats] = useState<Stats>({lines: 0, words: 0, chars: 0});
    const [contextMenu, setContextMenu] = useState<ContextMenu>({visible: false, x: 0, y: 0});
    const editorRef = useRef<HTMLDivElement>(null);

    // Ref prevents editor recreation when notes change
    const notesRef = useRef<MentionItem[]>(notes);
    useEffect(() => {
        notesRef.current = notes;
    }, [notes]);

    function updateStats(text: string) {
        const lines = text.split('\n').filter(line => line.trim()).length;
        const words = text.split(/\s+/).filter(w => w.trim()).length;
        const chars = text.replace(/\s/g, '').length;
        setStats({lines, words, chars});
    }

    const mentionSuggestion = useMemo(() => createMentionSuggestion(() => notesRef.current), []);

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
            ExitTable,
        ],
        content: content,
        onUpdate: ({editor}) => {
            const html = editor.getHTML();
            const text = editor.getText();
            onChange(html);
            updateStats(text);
        },

    }, []);

    // Sync content when switching notes (emitUpdate: false prevents save loop)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content, false);
            updateStats(editor.getText());
        }
    }, [content, editor]);

    useEffect(() => {
        if (editor) {
            editor.setEditable(!locked);
        }
    }, [editor, locked]);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        if (locked) return;
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
        });
    };

    const closeContextMenu = () => {
        setContextMenu({...contextMenu, visible: false});
    };

    useEffect(() => {
        const handleClick = () => closeContextMenu();
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    const handleEditorClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('note-mention') && onMentionClick) {
            const noteId = target.getAttribute('data-note-id');
            if (noteId) {
                onMentionClick(parseInt(noteId, 10));
            }
        }
    };

    const insertTable = () => {
        editor?.chain().focus().insertTable({rows: 3, cols: 3, withHeaderRow: true}).run();
        closeContextMenu();
    };
    const addRowAfter = () => { editor?.chain().focus().addRowAfter().run(); closeContextMenu(); };
    const deleteRow = () => { editor?.chain().focus().deleteRow().run(); closeContextMenu(); };
    const addColAfter = () => { editor?.chain().focus().addColumnAfter().run(); closeContextMenu(); };
    const deleteCol = () => { editor?.chain().focus().deleteColumn().run(); closeContextMenu(); };
    const deleteTable = () => { editor?.chain().focus().deleteTable().run(); closeContextMenu(); };

    // Exit table - add paragraph after table and move cursor there
    const exitTable = () => {
        editor?.chain().focus().insertContentAt(editor.state.selection.$to.after(1), { type: 'paragraph' }).run();
        closeContextMenu();
    };

    // Toolbar formatting actions
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

    const isActive = (format: string, options?: any) => {
        return editor?.isActive(format, options) ?? false;
    };

    return (
        <div className="markdown-editor">
            <div className="editor-toolbar">
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

                <div className="toolbar-spacer"></div>

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

                <button
                    type="button"
                    className={`toolbar-btn lock-btn ${locked ? 'locked' : ''}`}
                    onClick={onToggleLock}
                    data-tooltip={locked ? "Débloquer l'édition (Ctrl+L)" : "Bloquer l'édition (Ctrl+L)"}
                >
                    {locked ? "🔒" : "🔓"}
                </button>
            </div>

            <div
                className={locked ? "editor-wrapper locked" : "editor-wrapper"}
                onContextMenu={handleContextMenu}
                onClick={handleEditorClick}
                ref={editorRef}
            >
                <EditorContent editor={editor}/>
            </div>

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
                    <hr />
                    <button onClick={exitTable}>↓ Sortir du tableau</button>
                </div>
            )}

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

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useState } from 'react';
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

// Éditeur WYSIWYG : **gras**, *italique*, # titre, - liste
export function MarkdownEditor({ content, onChange }: Props) {
    const [stats, setStats] = useState<Stats>({ lines: 0, words: 0, chars: 0 });

    // Calcule les stats à partir du texte
    function updateStats(text: string) {
        const lines = text.split('\n').filter(line => line.trim()).length;
        const words = text.split(/\s+/).filter(w => w.trim()).length;
        const chars = text.replace(/\s/g, '').length;
        setStats({ lines, words, chars });
    }

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
                bulletList: {},
                orderedList: {},
                blockquote: {},
                codeBlock: {},
                code: {},
                bold: {},
                italic: {},
                strike: {},
            }),
            Placeholder.configure({
                placeholder: 'Écrivez ici... (**gras**, *italique*, # titre)',
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
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

    return (
        <div className="markdown-editor">
            <EditorContent editor={editor} />

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

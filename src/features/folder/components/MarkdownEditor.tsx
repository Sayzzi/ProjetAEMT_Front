import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import './MarkdownEditor.css';

// Props du composant
interface Props {
    content: string;
    onChange: (content: string) => void;
}

// Éditeur WYSIWYG : **gras**, *italique*, # titre, - liste
export function MarkdownEditor({ content, onChange }: Props) {

    // Création de l'éditeur tiptap
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
            onChange(editor.getHTML());
        },
    });

    // Synchronise le contenu quand on change de note
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    return (
        <div className="markdown-editor">
            <EditorContent editor={editor} />
        </div>
    );
}

// Import des hooks et composants de tiptap
import { useEditor, EditorContent } from '@tiptap/react';
// StarterKit contient les extensions de base (gras, italique, listes, etc.)
import StarterKit from '@tiptap/starter-kit';
// Extension pour afficher un placeholder quand l'éditeur est vide
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import './MarkdownEditor.css';

// ==============================================
// COMPOSANT ÉDITEUR MARKDOWN WYSIWYG
// ==============================================
// Cet éditeur permet d'écrire avec la syntaxe Markdown
// et de voir le résultat en temps réel :
// - Tape **texte** → devient gras (les ** disparaissent)
// - Tape *texte* → devient italique
// - Tape # au début → devient titre
// - Tape - au début → devient liste
// ==============================================

// Interface pour les props du composant
interface Props {
    content: string;              // Contenu HTML de la note
    onChange: (content: string) => void;  // Fonction appelée quand le contenu change
}

export function MarkdownEditor({ content, onChange }: Props) {

    // ==============================================
    // CRÉATION DE L'ÉDITEUR TIPTAP
    // ==============================================
    // useEditor est un hook qui crée et configure l'éditeur
    const editor = useEditor({

        // Liste des extensions (fonctionnalités) de l'éditeur
        extensions: [
            // StarterKit inclut les fonctionnalités de base
            StarterKit.configure({
                // Configuration des titres (H1, H2, H3)
                heading: { levels: [1, 2, 3] },
                // Listes à puces (- item)
                bulletList: {},
                // Listes numérotées (1. item)
                orderedList: {},
                // Citations (> texte)
                blockquote: {},
                // Blocs de code (```)
                codeBlock: {},
                // Code inline (`code`)
                code: {},
                // Gras (**texte**)
                bold: {},
                // Italique (*texte*)
                italic: {},
                // Texte barré (~~texte~~)
                strike: {},
            }),
            // Extension placeholder : texte affiché quand l'éditeur est vide
            Placeholder.configure({
                placeholder: 'Écrivez ici... (utilisez **gras**, *italique*, # titre, - liste)',
            }),
        ],

        // Contenu initial de l'éditeur (HTML)
        content: content,

        // Callback appelé à chaque modification du contenu
        onUpdate: ({ editor }) => {
            // On récupère le HTML généré et on le passe au parent
            onChange(editor.getHTML());
        },
    });

    // ==============================================
    // SYNCHRONISATION DU CONTENU
    // ==============================================
    // useEffect se déclenche quand 'content' change (ex: nouvelle note sélectionnée)
    useEffect(() => {
        // Si l'éditeur existe et que le contenu est différent
        if (editor && content !== editor.getHTML()) {
            // On met à jour le contenu de l'éditeur
            editor.commands.setContent(content);
        }
    }, [content, editor]); // Dépendances : se déclenche si content ou editor change

    // ==============================================
    // RENDU DU COMPOSANT
    // ==============================================
    return (
        // Container de l'éditeur (stylé dans MarkdownEditor.css)
        <div className="markdown-editor">
            {/* EditorContent affiche la zone d'édition de tiptap */}
            <EditorContent editor={editor} />
        </div>
    );
}

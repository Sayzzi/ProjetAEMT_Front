import type Note from "../../types/note.ts";
import { useState, useRef, useCallback } from "react";

export default function AddNote() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [title, setTitle] = useState('');
    const editorRef = useRef<HTMLDivElement>(null);

    // Sauvegarder la position du curseur
    const saveCaretPosition = () => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return null;
        const range = sel.getRangeAt(0);
        return {
            startContainer: range.startContainer,
            startOffset: range.startOffset,
            endContainer: range.endContainer,
            endOffset: range.endOffset
        };
    };

    // Restaurer la position du curseur
    const restoreCaretPosition = (position: ReturnType<typeof saveCaretPosition>) => {
        if (!position) return;
        const sel = window.getSelection();
        const range = document.createRange();
        try {
            range.setStart(position.startContainer, position.startOffset);
            range.setEnd(position.endContainer, position.endOffset);
            sel?.removeAllRanges();
            sel?.addRange(range);
        } catch (e) {
            // Si le noeud n'existe plus, on place le curseur à la fin
            if (editorRef.current) {
                range.selectNodeContents(editorRef.current);
                range.collapse(false);
                sel?.removeAllRanges();
                sel?.addRange(range);
            }
        }
    };

    // Placer le curseur à la fin d'un élément
    const placeCaretAtEnd = (element: HTMLElement) => {
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(element);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
    };

    // Placer le curseur au début d'un élément
    const placeCaretAtStart = (element: HTMLElement) => {
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(element);
        range.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(range);
    };

    // Obtenir le bloc courant (ligne/paragraphe)
    const getCurrentBlock = (): HTMLElement | null => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return null;

        let node = sel.anchorNode;

        // Remonter jusqu'au bloc parent direct de l'éditeur
        while (node && node.parentElement !== editorRef.current) {
            node = node.parentElement;
        }

        return node as HTMLElement;
    };

    // Obtenir le texte brut du bloc courant
    const getCurrentBlockText = (): string => {
        const block = getCurrentBlock();
        if (!block) {
            // Si pas de bloc, on est peut-être directement dans l'éditeur
            const sel = window.getSelection();
            if (sel && sel.anchorNode) {
                return sel.anchorNode.textContent || '';
            }
            return '';
        }
        return block.textContent || '';
    };

    // Convertir le bloc courant selon le pattern Markdown détecté
    const convertCurrentBlock = useCallback(() => {
        const editor = editorRef.current;
        if (!editor) return;

        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;

        let currentNode = sel.anchorNode;

        // Trouver le bloc parent
        while (currentNode && currentNode !== editor && currentNode.parentElement !== editor) {
            currentNode = currentNode.parentElement;
        }

        if (!currentNode || currentNode === editor) {
            // On est directement dans l'éditeur, chercher le texte node
            currentNode = sel.anchorNode;
        }

        const text = currentNode?.textContent || '';

        // Patterns de début de ligne (block-level)
        const blockPatterns = [
            { regex: /^######\s(.*)$/, tag: 'h6' },
            { regex: /^#####\s(.*)$/, tag: 'h5' },
            { regex: /^####\s(.*)$/, tag: 'h4' },
            { regex: /^###\s(.*)$/, tag: 'h3' },
            { regex: /^##\s(.*)$/, tag: 'h2' },
            { regex: /^#\s(.*)$/, tag: 'h1' },
            { regex: /^>\s(.*)$/, tag: 'blockquote' },
            { regex: /^-\s(.*)$/, tag: 'li', wrapper: 'ul' },
            { regex: /^\*\s(.*)$/, tag: 'li', wrapper: 'ul' },
            { regex: /^\d+\.\s(.*)$/, tag: 'li', wrapper: 'ol' },
            { regex: /^```$/, tag: 'pre', special: 'codeblock' },
            { regex: /^---$/, tag: 'hr', special: 'hr' },
        ];

        for (const pattern of blockPatterns) {
            const match = text.match(pattern.regex);
            if (match) {
                // Créer le nouvel élément
                let newElement: HTMLElement;

                if (pattern.special === 'hr') {
                    newElement = document.createElement('hr');
                    newElement.className = 'md-hr';
                } else if (pattern.special === 'codeblock') {
                    newElement = document.createElement('pre');
                    newElement.className = 'md-codeblock';
                    newElement.innerHTML = '<code><br></code>';
                } else if (pattern.wrapper) {
                    // Pour les listes
                    const wrapper = document.createElement(pattern.wrapper);
                    wrapper.className = `md-${pattern.wrapper}`;
                    newElement = document.createElement(pattern.tag);
                    newElement.className = `md-${pattern.tag}`;
                    newElement.textContent = match[1] || '';
                    wrapper.appendChild(newElement);

                    // Remplacer le noeud courant
                    if (currentNode && currentNode.parentElement) {
                        currentNode.parentElement.replaceChild(wrapper, currentNode);
                    }

                    placeCaretAtEnd(newElement);
                    return;
                } else {
                    newElement = document.createElement(pattern.tag);
                    newElement.className = `md-${pattern.tag}`;
                    newElement.textContent = match[1] || '';
                }

                // Remplacer le noeud courant
                if (currentNode && currentNode.parentElement) {
                    currentNode.parentElement.replaceChild(newElement, currentNode);

                    if (pattern.special === 'hr') {
                        // Ajouter un nouveau paragraphe après le hr
                        const newP = document.createElement('div');
                        newP.innerHTML = '<br>';
                        newElement.after(newP);
                        placeCaretAtStart(newP);
                    } else if (pattern.special === 'codeblock') {
                        const codeElement = newElement.querySelector('code');
                        if (codeElement) {
                            placeCaretAtStart(codeElement);
                        }
                    } else {
                        placeCaretAtEnd(newElement);
                    }
                }
                return;
            }
        }
    }, []);

    // Appliquer le formatage inline (gras, italique, etc.)
    const applyInlineFormatting = useCallback((format: 'bold' | 'italic' | 'strikethrough' | 'code') => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;

        const range = sel.getRangeAt(0);
        const selectedText = range.toString();

        if (!selectedText) return;

        let wrapper: HTMLElement;
        switch (format) {
            case 'bold':
                wrapper = document.createElement('strong');
                break;
            case 'italic':
                wrapper = document.createElement('em');
                break;
            case 'strikethrough':
                wrapper = document.createElement('s');
                break;
            case 'code':
                wrapper = document.createElement('code');
                wrapper.className = 'md-inline-code';
                break;
            default:
                return;
        }

        range.surroundContents(wrapper);
        sel.removeAllRanges();
    }, []);

    // Gérer les raccourcis clavier
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const editor = editorRef.current;
        if (!editor) return;

        // Raccourcis avec Ctrl/Cmd
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    applyInlineFormatting('bold');
                    return;
                case 'i':
                    e.preventDefault();
                    applyInlineFormatting('italic');
                    return;
                case 'u':
                    e.preventDefault();
                    applyInlineFormatting('strikethrough');
                    return;
                case 'e':
                    e.preventDefault();
                    applyInlineFormatting('code');
                    return;
            }
        }

        // Entrée : convertir le bloc et créer une nouvelle ligne
        if (e.key === 'Enter' && !e.shiftKey) {
            const text = getCurrentBlockText();

            // Vérifier si on est dans un bloc de code
            const sel = window.getSelection();
            let inCodeBlock = false;
            if (sel && sel.anchorNode) {
                let node: Node | null = sel.anchorNode;
                while (node && node !== editor) {
                    if (node.nodeName === 'PRE') {
                        inCodeBlock = true;
                        break;
                    }
                    node = node.parentNode;
                }
            }

            // Si on est dans un bloc de code, laisser le comportement par défaut
            if (inCodeBlock) {
                // Sortir du bloc de code avec triple Entrée (ligne vide)
                if (text.trim() === '') {
                    e.preventDefault();
                    const pre = sel?.anchorNode?.parentElement?.closest('pre');
                    if (pre) {
                        const newDiv = document.createElement('div');
                        newDiv.innerHTML = '<br>';
                        pre.after(newDiv);
                        placeCaretAtStart(newDiv);
                    }
                }
                return;
            }

            // Vérifier les patterns Markdown
            const hasMarkdownPattern = /^(#{1,6}\s|>\s|-\s|\*\s|\d+\.\s|```|---)/.test(text);

            if (hasMarkdownPattern) {
                e.preventDefault();
                convertCurrentBlock();

                // Créer une nouvelle ligne après
                setTimeout(() => {
                    const newDiv = document.createElement('div');
                    newDiv.innerHTML = '<br>';

                    const currentBlock = getCurrentBlock();
                    if (currentBlock) {
                        currentBlock.after(newDiv);
                    } else {
                        editor.appendChild(newDiv);
                    }
                    placeCaretAtStart(newDiv);
                }, 0);
                return;
            }

            // Pour les listes, continuer la liste
            const currentBlock = getCurrentBlock();
            if (currentBlock) {
                const li = currentBlock.closest('li');
                if (li) {
                    e.preventDefault();
                    const list = li.parentElement;

                    // Si la ligne est vide, sortir de la liste
                    if (!li.textContent?.trim()) {
                        const newDiv = document.createElement('div');
                        newDiv.innerHTML = '<br>';
                        list?.after(newDiv);
                        li.remove();
                        if (list && list.children.length === 0) {
                            list.remove();
                        }
                        placeCaretAtStart(newDiv);
                        return;
                    }

                    // Sinon, ajouter un nouvel élément de liste
                    const newLi = document.createElement('li');
                    newLi.className = 'md-li';
                    newLi.innerHTML = '<br>';
                    li.after(newLi);
                    placeCaretAtStart(newLi);
                    return;
                }
            }
        }

        // Backspace : gérer la suppression des blocs spéciaux
        if (e.key === 'Backspace') {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return;

            const range = sel.getRangeAt(0);

            // Si le curseur est au début d'un bloc spécial
            if (range.collapsed && range.startOffset === 0) {
                const currentBlock = getCurrentBlock();
                if (currentBlock) {
                    const tagName = currentBlock.tagName.toLowerCase();
                    const specialTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'li', 'pre'];

                    if (specialTags.includes(tagName)) {
                        e.preventDefault();
                        const text = currentBlock.textContent || '';

                        // Convertir en div normal
                        const newDiv = document.createElement('div');
                        newDiv.textContent = text || '';

                        if (tagName === 'li') {
                            const list = currentBlock.parentElement;
                            if (list) {
                                list.before(newDiv);
                                currentBlock.remove();
                                if (list.children.length === 0) {
                                    list.remove();
                                }
                            }
                        } else {
                            currentBlock.replaceWith(newDiv);
                        }

                        placeCaretAtStart(newDiv);
                        return;
                    }
                }
            }
        }

        // Tab dans une liste pour indenter
        if (e.key === 'Tab') {
            const currentBlock = getCurrentBlock();
            if (currentBlock) {
                const li = currentBlock.closest('li');
                if (li) {
                    e.preventDefault();
                    // Pour simplifier, on ajoute juste du padding
                    const currentPadding = parseInt(li.style.paddingLeft || '0');
                    if (e.shiftKey) {
                        li.style.paddingLeft = Math.max(0, currentPadding - 24) + 'px';
                    } else {
                        li.style.paddingLeft = (currentPadding + 24) + 'px';
                    }
                    return;
                }
            }
        }
    };

    // Gérer l'input pour le formatage inline en temps réel
    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        const editor = editorRef.current;
        if (!editor) return;

        // Détecter les patterns inline après la saisie
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;

        const range = sel.getRangeAt(0);
        const textNode = range.startContainer;

        if (textNode.nodeType !== Node.TEXT_NODE) return;

        const text = textNode.textContent || '';
        const cursorPos = range.startOffset;

        // Patterns inline à détecter
        const inlinePatterns = [
            { regex: /\*\*([^*]+)\*\*/, tag: 'strong' },
            { regex: /__([^_]+)__/, tag: 'strong' },
            { regex: /(?<!\*)\*([^*]+)\*(?!\*)/, tag: 'em' },
            { regex: /(?<!_)_([^_]+)_(?!_)/, tag: 'em' },
            { regex: /~~([^~]+)~~/, tag: 's' },
            { regex: /`([^`]+)`/, tag: 'code', className: 'md-inline-code' },
        ];

        for (const pattern of inlinePatterns) {
            const match = text.match(pattern.regex);
            if (match && match.index !== undefined) {
                const fullMatch = match[0];
                const content = match[1];
                const matchEnd = match.index + fullMatch.length;

                // Vérifier que le curseur est juste après le pattern
                if (cursorPos === matchEnd) {
                    // Créer l'élément
                    const element = document.createElement(pattern.tag);
                    if (pattern.className) {
                        element.className = pattern.className;
                    }
                    element.textContent = content;

                    // Remplacer le texte
                    const beforeText = text.substring(0, match.index);
                    const afterText = text.substring(matchEnd);

                    const parent = textNode.parentNode;
                    if (!parent) return;

                    // Créer les nouveaux noeuds
                    const beforeNode = document.createTextNode(beforeText);
                    const afterNode = document.createTextNode(afterText + '\u00A0'); // Ajouter un espace insécable

                    parent.insertBefore(beforeNode, textNode);
                    parent.insertBefore(element, textNode);
                    parent.insertBefore(afterNode, textNode);
                    parent.removeChild(textNode);

                    // Placer le curseur après l'élément
                    const newRange = document.createRange();
                    newRange.setStart(afterNode, 1);
                    newRange.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(newRange);

                    return;
                }
            }
        }
    };

    const saveNote = () => {
        const editor = editorRef.current;
        if (!editor) return;

        const content = editor.innerHTML;

        const newNote: Note = {
            id: Date.now(),
            id_user: 1,
            id_folder: 1,
            title: title || 'Sans titre',
            content: content,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            size_bytes: content.length,
            line_count: content.split(/<br>|<\/div>|<\/p>/).length,
            word_count: (editor.textContent || '').split(/\s+/).filter(w => w).length,
            char_count: (editor.textContent || '').length,
        };

        setNotes([...notes, newNote]);
        setTitle('');
        editor.innerHTML = '';
    };

    return (
        <>
            <style>{`
                .md-editor {
                    width: 100%;
                    min-height: 300px;
                    padding: 16px;
                    font-size: 15px;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    outline: none;
                    box-sizing: border-box;
                    line-height: 1.6;
                    background: #fff;
                }
                
                .md-editor:focus {
                    border-color: #0078d4;
                    box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.1);
                }
                
                .md-editor:empty:before {
                    content: 'Commence à écrire... (# titre, - liste, > citation, **gras**, *italique*)';
                    color: #aaa;
                    pointer-events: none;
                }
                
                .md-editor h1 { font-size: 2em; font-weight: 700; margin: 0.5em 0 0.25em; color: #1a1a1a; }
                .md-editor h2 { font-size: 1.5em; font-weight: 600; margin: 0.5em 0 0.25em; color: #1a1a1a; }
                .md-editor h3 { font-size: 1.25em; font-weight: 600; margin: 0.5em 0 0.25em; color: #1a1a1a; }
                .md-editor h4 { font-size: 1.1em; font-weight: 600; margin: 0.5em 0 0.25em; color: #333; }
                .md-editor h5 { font-size: 1em; font-weight: 600; margin: 0.5em 0 0.25em; color: #333; }
                .md-editor h6 { font-size: 0.9em; font-weight: 600; margin: 0.5em 0 0.25em; color: #666; }
                
                .md-editor blockquote {
                    border-left: 3px solid #0078d4;
                    padding-left: 16px;
                    margin: 8px 0;
                    color: #555;
                    background: #f8f9fa;
                    padding: 8px 16px;
                    border-radius: 0 4px 4px 0;
                }
                
                .md-editor ul, .md-editor ol {
                    margin: 8px 0;
                    padding-left: 24px;
                }
                
                .md-editor li {
                    margin: 4px 0;
                }
                
                .md-editor .md-inline-code {
                    background: #f0f0f0;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: 'SF Mono', 'Fira Code', monospace;
                    font-size: 0.9em;
                    color: #e83e8c;
                }
                
                .md-editor pre {
                    background: #1e1e1e;
                    color: #d4d4d4;
                    padding: 16px;
                    border-radius: 8px;
                    overflow-x: auto;
                    font-family: 'SF Mono', 'Fira Code', monospace;
                    font-size: 14px;
                    margin: 12px 0;
                }
                
                .md-editor pre code {
                    background: none;
                    padding: 0;
                    color: inherit;
                }
                
                .md-editor hr {
                    border: none;
                    border-top: 2px solid #e0e0e0;
                    margin: 16px 0;
                }
                
                .md-editor strong { font-weight: 700; }
                .md-editor em { font-style: italic; }
                .md-editor s { text-decoration: line-through; color: #888; }
                
                .note-card {
                    background: white;
                    padding: 20px;
                    margin-bottom: 16px;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    border: 1px solid #e8e8e8;
                    transition: box-shadow 0.2s;
                }
                
                .note-card:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
                }
                
                .note-card h1, .note-card h2, .note-card h3,
                .note-card h4, .note-card h5, .note-card h6 {
                    margin-top: 0.5em;
                }
                
                .note-card blockquote {
                    border-left: 3px solid #0078d4;
                    padding-left: 16px;
                    margin: 8px 0;
                    color: #555;
                    background: #f8f9fa;
                    padding: 8px 16px;
                    border-radius: 0 4px 4px 0;
                }
                
                .note-card ul, .note-card ol {
                    margin: 8px 0;
                    padding-left: 24px;
                }
                
                .note-card .md-inline-code {
                    background: #f0f0f0;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: 'SF Mono', 'Fira Code', monospace;
                    font-size: 0.9em;
                    color: #e83e8c;
                }
                
                .note-card pre {
                    background: #1e1e1e;
                    color: #d4d4d4;
                    padding: 16px;
                    border-radius: 8px;
                    overflow-x: auto;
                    font-family: 'SF Mono', 'Fira Code', monospace;
                    font-size: 14px;
                }
                
                .note-card hr {
                    border: none;
                    border-top: 2px solid #e0e0e0;
                    margin: 16px 0;
                }
            `}</style>

            <div style={{ display: 'flex', gap: '24px', minHeight: '100vh', padding: '20px', background: '#f5f7fa' }}>
                {/* Colonne gauche : éditeur */}
                <div style={{ flex: 1, maxWidth: '600px' }}>
                    <h2 style={{ marginBottom: '8px', color: '#1a1a1a' }}>✏️ Éditeur</h2>
                    <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
                        <strong>Raccourcis :</strong> Ctrl+B (gras), Ctrl+I (italique), Ctrl+U (barré), Ctrl+E (code)
                    </p>

                    <div style={{ marginBottom: '16px' }}>
                        <input
                            type="text"
                            placeholder="Titre de la note"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                fontSize: '20px',
                                fontWeight: '600',
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                boxSizing: 'border-box',
                                outline: 'none',
                            }}
                        />
                    </div>

                    <div
                        ref={editorRef}
                        className="md-editor"
                        contentEditable
                        onKeyDown={handleKeyDown}
                        onInput={handleInput}
                        suppressContentEditableWarning
                    />

                    <button
                        onClick={saveNote}
                        style={{
                            marginTop: '16px',
                            padding: '12px 24px',
                            backgroundColor: '#0078d4',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: '500',
                            transition: 'background 0.2s',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#106ebe'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0078d4'}
                    >
                        💾 Sauvegarder
                    </button>
                </div>

                {/* Colonne droite : notes sauvegardées */}
                <div style={{ flex: 1, maxWidth: '600px' }}>
                    <h2 style={{ marginBottom: '16px', color: '#1a1a1a' }}>📝 Notes sauvegardées</h2>

                    {notes.length === 0 ? (
                        <div style={{
                            padding: '40px',
                            textAlign: 'center',
                            color: '#999',
                            background: '#fff',
                            borderRadius: '8px',
                            border: '2px dashed #e0e0e0'
                        }}>
                            <p style={{ fontSize: '48px', margin: '0 0 16px' }}>📭</p>
                            <p>Aucune note pour le moment</p>
                        </div>
                    ) : (
                        notes.map(note => (
                            <div key={note.id} className="note-card">
                                <h3 style={{ margin: '0 0 12px 0', color: '#1a1a1a' }}>{note.title}</h3>
                                <div
                                    style={{ fontSize: '15px', lineHeight: '1.6' }}
                                    dangerouslySetInnerHTML={{ __html: note.content || '' }}
                                />
                                <div style={{
                                    marginTop: '12px',
                                    paddingTop: '12px',
                                    borderTop: '1px solid #eee',
                                    display: 'flex',
                                    gap: '16px',
                                    fontSize: '12px',
                                    color: '#888'
                                }}>
                                    <span>📅 {new Date(note.created_at).toLocaleDateString('fr-FR')}</span>
                                    <span>📝 {note.word_count} mots</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
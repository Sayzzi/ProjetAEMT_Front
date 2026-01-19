import type Note from "../../types/note.ts";
import { useState, useRef, useCallback } from "react";
import "./AddNote.css";

export default function AddNote() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [title, setTitle] = useState('');
    const [stats, setStats] = useState({ lines: 0, words: 0, chars: 0 });
    const editorRef = useRef<HTMLDivElement>(null);

    const placeCaretAtEnd = (element: HTMLElement) => {
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(element);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
    };

    const placeCaretAtStart = (element: HTMLElement) => {
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(element);
        range.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(range);
    };

    const getCurrentBlock = (): HTMLElement | null => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return null;

        let node = sel.anchorNode;

        while (node && node.parentElement !== editorRef.current) {
            node = node.parentElement;
        }

        return node as HTMLElement;
    };

    const getCurrentBlockText = (): string => {
        const block = getCurrentBlock();
        if (!block) {
            const sel = window.getSelection();
            if (sel && sel.anchorNode) {
                return sel.anchorNode.textContent || '';
            }
            return '';
        }
        return block.textContent || '';
    };

    // Calculer les statistiques de l'éditeur
    const updateStats = useCallback(() => {
        const editor = editorRef.current;
        if (!editor) {
            setStats({ lines: 0, words: 0, chars: 0 });
            return;
        }

        const textContent = editor.innerText || '';

        // Nombre de lignes (lignes non vides)
        const lines = textContent.split('\n').filter(line => line.trim()).length;

        // Nombre de mots
        const words = textContent.split(/\s+/).filter(w => w.trim()).length;

        // Nombre de caractères (sans espaces)
        const chars = textContent.replace(/\s/g, '').length;

        setStats({ lines, words, chars });
    }, []);

    const convertCurrentBlock = useCallback(() => {
        const editor = editorRef.current;
        if (!editor) return;

        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;

        let currentNode = sel.anchorNode;

        while (currentNode && currentNode !== editor && currentNode.parentElement !== editor) {
            currentNode = currentNode.parentElement;
        }

        if (!currentNode || currentNode === editor) {
            currentNode = sel.anchorNode;
        }

        const text = currentNode?.textContent || '';

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
                let newElement: HTMLElement;

                if (pattern.special === 'hr') {
                    newElement = document.createElement('hr');
                    newElement.className = 'md-hr';
                } else if (pattern.special === 'codeblock') {
                    newElement = document.createElement('pre');
                    newElement.className = 'md-codeblock';
                    newElement.innerHTML = '<code><br></code>';
                } else if (pattern.wrapper) {
                    const wrapper = document.createElement(pattern.wrapper);
                    wrapper.className = `md-${pattern.wrapper}`;
                    newElement = document.createElement(pattern.tag);
                    newElement.className = `md-${pattern.tag}`;
                    newElement.textContent = match[1] || '';
                    wrapper.appendChild(newElement);

                    if (currentNode && currentNode.parentElement) {
                        currentNode.parentElement.replaceChild(wrapper, currentNode);
                    }

                    placeCaretAtEnd(newElement);
                    updateStats();
                    return;
                } else {
                    newElement = document.createElement(pattern.tag);
                    newElement.className = `md-${pattern.tag}`;
                    newElement.textContent = match[1] || '';
                }

                if (currentNode && currentNode.parentElement) {
                    currentNode.parentElement.replaceChild(newElement, currentNode);

                    if (pattern.special === 'hr') {
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
                updateStats();
                return;
            }
        }
    }, [updateStats]);

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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const editor = editorRef.current;
        if (!editor) return;

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

        if (e.key === 'Enter' && !e.shiftKey) {
            const text = getCurrentBlockText();

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

            if (inCodeBlock) {
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

            const hasMarkdownPattern = /^(#{1,6}\s|>\s|-\s|\*\s|\d+\.\s|```|---)/.test(text);

            if (hasMarkdownPattern) {
                e.preventDefault();
                convertCurrentBlock();

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
                    updateStats();
                }, 0);
                return;
            }

            const currentBlock = getCurrentBlock();
            if (currentBlock) {
                const li = currentBlock.closest('li');
                if (li) {
                    e.preventDefault();
                    const list = li.parentElement;

                    if (!li.textContent?.trim()) {
                        const newDiv = document.createElement('div');
                        newDiv.innerHTML = '<br>';
                        list?.after(newDiv);
                        li.remove();
                        if (list && list.children.length === 0) {
                            list.remove();
                        }
                        placeCaretAtStart(newDiv);
                        updateStats();
                        return;
                    }

                    const newLi = document.createElement('li');
                    newLi.className = 'md-li';
                    newLi.innerHTML = '<br>';
                    li.after(newLi);
                    placeCaretAtStart(newLi);
                    updateStats();
                    return;
                }
            }
        }

        if (e.key === 'Backspace') {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return;

            const range = sel.getRangeAt(0);

            if (range.collapsed && range.startOffset === 0) {
                const currentBlock = getCurrentBlock();
                if (currentBlock) {
                    const tagName = currentBlock.tagName.toLowerCase();
                    const specialTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'li', 'pre'];

                    if (specialTags.includes(tagName)) {
                        e.preventDefault();
                        const blockText = currentBlock.textContent || '';

                        const newDiv = document.createElement('div');
                        newDiv.textContent = blockText || '';

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
                        updateStats();
                        return;
                    }
                }
            }
        }

        if (e.key === 'Tab') {
            const currentBlock = getCurrentBlock();
            if (currentBlock) {
                const li = currentBlock.closest('li');
                if (li) {
                    e.preventDefault();
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

    const handleInput = () => {
        const editor = editorRef.current;
        if (!editor) return;

        // Mettre à jour les stats à chaque input
        updateStats();

        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;

        const range = sel.getRangeAt(0);
        const textNode = range.startContainer;

        if (textNode.nodeType !== Node.TEXT_NODE) return;

        const text = textNode.textContent || '';
        const cursorPos = range.startOffset;

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

                if (cursorPos === matchEnd) {
                    const element = document.createElement(pattern.tag);
                    if (pattern.className) {
                        element.className = pattern.className;
                    }
                    element.textContent = content;

                    const beforeText = text.substring(0, match.index);
                    const afterText = text.substring(matchEnd);

                    const parent = textNode.parentNode;
                    if (!parent) return;

                    const beforeNode = document.createTextNode(beforeText);
                    const afterNode = document.createTextNode(afterText + '\u00A0');

                    parent.insertBefore(beforeNode, textNode);
                    parent.insertBefore(element, textNode);
                    parent.insertBefore(afterNode, textNode);
                    parent.removeChild(textNode);

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
        const textContent = editor.innerText || '';

        const lines = textContent.split('\n').filter(line => line.trim()).length;
        const words = textContent.split(/\s+/).filter(w => w.trim()).length;
        const chars = textContent.replace(/\s/g, '').length;

        const newNote: Note = {
            id: Date.now(),
            id_user: 1,
            id_folder: 1,
            title: title || 'Sans titre',
            content: content,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            size_bytes: content.length,
            line_count: lines,
            word_count: words,
            char_count: chars,
        };

        setNotes([...notes, newNote]);
        setTitle('');
        editor.innerHTML = '';
        setStats({ lines: 0, words: 0, chars: 0 });
    };

    return (
        <div className="add-note-container">
            <div className="editor-column">
                <h2 className="editor-title">✏️ Éditeur</h2>
                <p className="editor-hint">
                    <strong>Raccourcis :</strong> Ctrl+B (gras), Ctrl+I (italique), Ctrl+U (barré), Ctrl+E (code)
                </p>

                <div className="title-input-wrapper">
                    <input
                        type="text"
                        placeholder="Titre de la note"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="title-input"
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

                {/* Barre de statistiques */}
                <div className="stats-bar">
                    <span className="stat-item">
                        <span className="stat-icon">📄</span>
                        <span className="stat-value">{stats.lines}</span>
                        <span className="stat-label">ligne{stats.lines > 1 ? 's' : ''}</span>
                    </span>
                    <span className="stat-item">
                        <span className="stat-icon">📝</span>
                        <span className="stat-value">{stats.words}</span>
                        <span className="stat-label">mot{stats.words > 1 ? 's' : ''}</span>
                    </span>
                    <span className="stat-item">
                        <span className="stat-icon">🔤</span>
                        <span className="stat-value">{stats.chars}</span>
                        <span className="stat-label">caractère{stats.chars > 1 ? 's' : ''}</span>
                    </span>
                </div>

                <button onClick={saveNote} className="save-button">
                    💾 Sauvegarder
                </button>
            </div>

            <div className="notes-column">
                <h2 className="notes-title">📝 Notes sauvegardées</h2>

                {notes.length === 0 ? (
                    <div className="empty-state">
                        <p className="empty-icon">📭</p>
                        <p>Aucune note pour le moment</p>
                    </div>
                ) : (
                    notes.map(note => (
                        <div key={note.id} className="note-card">
                            <h3 className="note-card-title">{note.title}</h3>
                            <div
                                className="note-card-content"
                                dangerouslySetInnerHTML={{ __html: note.content || '' }}
                            />
                            <div className="note-card-meta">
                                <span>📅 {new Date(note.created_at).toLocaleDateString('fr-FR')}</span>
                                <span>📄 {note.line_count} ligne{note.line_count > 1 ? 's' : ''}</span>
                                <span>📝 {note.word_count} mot{note.word_count > 1 ? 's' : ''}</span>
                                <span>🔤 {note.char_count} car.</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
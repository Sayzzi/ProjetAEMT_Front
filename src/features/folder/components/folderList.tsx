import {useEffect, useState, useRef, useMemo} from "react";
import type {FolderNode} from "../../types/folderNode.ts";
import type Note from "../../types/note.ts";
import type {MentionItem} from "./MentionList.tsx";
import {buildFolderTree} from "../utils/buildFolderTree.tsx";
import {FolderTreeComponent} from "./folderTreeComponent.tsx";
import {FolderHeader} from "./folderHeader.tsx";
import MarkdownEditor from "./MarkdownEditor.tsx";
import ExportPdfButton from "./exportPdfButton.tsx";
import ExportZipButton from "./exportZipButton.tsx";
import {QuickSearch} from "../../search/components/QuickSearch.tsx";
import {NoteItem} from "./NoteItem.tsx";
import "./folderList.css";
import {FolderService} from "../services/folderService.tsx";
import {useAuth} from "../../auth/contexts/AuthContext.tsx";
import type {UpdateFolderCommand} from "../../types/commands/updateFolderCommand.ts";
import {NoteService} from "../../note/service/note-service.tsx";
import type {NoteUpdateCommand} from "../../types/commands/noteUpdateCommand.ts";

const folderService = new FolderService();
const noteService = new NoteService();

export function FolderList() {
    const [tree, setTree] = useState<FolderNode[]>([]);
    const [rootNotes, setRootNotes] = useState<Note[]>([]);
    const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [editingTitle, setEditingTitle] = useState(false);
    const [noteTitleValue, setNoteTitleValue] = useState("");
    const [contentValue, setContentValue] = useState("");
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [rootFolderId, setRootFolderId] = useState<number | null>(null);
    const [lockedNotes, setLockedNotes] = useState<Set<number>>(() => {
        const saved = localStorage.getItem('lockedNotes');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });
    const {user} = useAuth();

    // Debounce timer for auto-save
    const saveTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (user) {
            refreshTree();
        }
    }, [user]);

    // Global keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isEditing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
            const isMod = e.ctrlKey || e.metaKey;

            // Ctrl/Cmd + : or / - Toggle shortcuts help
            if (isMod && (e.key === ':' || e.key === '/')) {
                e.preventDefault();
                setShowShortcuts(prev => !prev);
                return;
            }

            // Escape - Close modal or deselect
            if (e.key === 'Escape') {
                if (showShortcuts) {
                    setShowShortcuts(false);
                    return;
                }
                if (selectedNote) {
                    // Cancel pending debounce to prevent stale closure bug
                    if (saveTimeoutRef.current) {
                        clearTimeout(saveTimeoutRef.current);
                        saveTimeoutRef.current = null;
                    }
                    setSelectedNote(null);
                    setContentValue("");
                    setNoteTitleValue("");
                    return;
                }
                if (currentFolderId) {
                    setCurrentFolderId(null);
                    return;
                }
                return;
            }

            if (isEditing) return;

            // Ctrl/Cmd + S - Manual save
            if (isMod && e.key === 's') {
                e.preventDefault();
                if (selectedNote && contentValue) {
                    saveNoteContent(contentValue);
                }
                return;
            }

            // Ctrl/Cmd + D - New folder
            if (isMod && e.key.toLowerCase() === 'd') {
                e.preventDefault();
                if (user && rootFolderId) {
                    handleCreateFolder({
                        userId: user.id,
                        parentFolderId: currentFolderId ?? rootFolderId,
                        title: 'Nouveau dossier'
                    });
                }
                return;
            }

            // Ctrl/Cmd + E - Toggle sidebar
            if (isMod && e.key === 'e') {
                e.preventDefault();
                setSidebarOpen(prev => !prev);
                return;
            }

            // Ctrl/Cmd + Backspace/Delete - Delete note or folder
            if (isMod && (e.key === "Backspace" || e.key === "Delete")) {
                e.preventDefault();
                const noteId = selectedNote?.id;
                if (noteId != null) {
                    handleDeleteNote(noteId);
                    return;
                }
                const folderId =
                    currentFolderId != null && currentFolderId !== rootFolderId
                        ? currentFolderId
                        : null;
                if (folderId != null) {
                    handleDeleteFolder(folderId);
                    return;
                }
            }

            // Ctrl/Cmd + P - Export PDF
            if (isMod && e.key === 'p') {
                e.preventDefault();
                if (selectedNote?.id) {
                    window.open(`http://localhost:8080/api/notes/${selectedNote.id}/export-pdf`, '_blank');
                }
                return;
            }

            // Ctrl/Cmd + N - New note
            if (isMod && e.key.toLowerCase() === 'n') {
                e.preventDefault();
                const folderId = currentFolderId ?? rootFolderId;
                if (user && folderId) {
                    handleCreateNote({
                        idUser: user.id,
                        idFolder: folderId,
                        title: 'Nouvelle note',
                        content: ''
                    });
                }
                return;
            }

            // Ctrl/Cmd + L - Toggle note lock
            if (isMod && e.key.toLowerCase() === 'l') {
                e.preventDefault();
                if (selectedNote?.id) {
                    toggleNoteLock(selectedNote.id);
                }
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showShortcuts, selectedNote, currentFolderId, rootFolderId, user, contentValue]);

    async function refreshTree() {
        if (!user) return;
        const { folders, notes } = await folderService.getAllFoldersAndNotesByUser(user.id);
        const { tree, rootNotes, rootFolderId } = buildFolderTree(folders, notes);
        setTree(tree);
        setRootNotes(rootNotes);
        setRootFolderId(rootFolderId);
    }

    async function handleCreateFolder(data: any) {
        if (user == null) {
            alert("User non connecté");
            return;
        }
        await folderService.createFolder(data);
        await refreshTree();
    }

    async function handleCreateNote(data: any) {
        const createdNote = await noteService.createNote(data);
        await refreshTree();
        setSelectedNote(createdNote);
        setNoteTitleValue(createdNote.title || "");
        setContentValue(createdNote.content || "");
    }

    async function handleDeleteFolder(id: number) {
        if (user == null) {
            alert("User non connecté");
            return;
        }
        await folderService.deleteFolder(id);
        if (currentFolderId === id) {
            setCurrentFolderId(rootFolderId ?? null);
        }
        await refreshTree();
    }

    async function handleDeleteNote(id: number) {
        await noteService.deleteNote(id);
        if (selectedNote?.id === id) {
            setSelectedNote(null);
            setContentValue("");
            setNoteTitleValue("");
        }
        await refreshTree();
    }

    function handleSelectNote(note: Note | null) {
        // Cancel pending debounce to prevent stale closure bug
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }

        if (note === null) {
            setSelectedNote(null);
            setContentValue("");
            setNoteTitleValue("");
        } else {
            setSelectedNote(note);
            setNoteTitleValue(note.title || "");
            setContentValue(note.content || "");
        }
        setEditingTitle(false);
        setSaveStatus("idle");
    }

    async function saveNoteTitle() {
        if (selectedNote && noteTitleValue.trim()) {
            const command: NoteUpdateCommand = {
                id: selectedNote.id,
                title: noteTitleValue,
                content: contentValue
            };
            await noteService.updateNote(command);
            setSelectedNote({ ...selectedNote, title: noteTitleValue });
            updateNoteInTree(selectedNote.id!, { title: noteTitleValue });
        }
        setEditingTitle(false);
    }

    // Updates note in local state to avoid full tree reload
    function updateNoteInTree(noteId: number, updates: Partial<Note>) {
        setTree(prevTree => {
            const updateInNodes = (nodes: FolderNode[]): FolderNode[] => {
                return nodes.map(folder => ({
                    ...folder,
                    notes: folder.notes?.map(note =>
                        note.id === noteId ? { ...note, ...updates } : note
                    ),
                    children: folder.children ? updateInNodes(folder.children) : []
                }));
            };
            return updateInNodes(prevTree);
        });

        setRootNotes(prevNotes =>
            prevNotes.map(note =>
                note.id === noteId ? { ...note, ...updates } : note
            )
        );
    }

    // Called after 1s debounce
    async function saveNoteContent(content: string) {
        if (!selectedNote) return;
        const command: NoteUpdateCommand = {
            id: selectedNote.id,
            title: selectedNote.title || "",
            content: content
        };
        try {
            setSaveStatus("saving");
            await noteService.updateNote(command);
            const now = new Date().toISOString();
            setSelectedNote({ ...selectedNote, content, updatedAt: now });
            updateNoteInTree(selectedNote.id!, { content, updatedAt: now });
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2000);
        } catch {
            setSaveStatus("idle");
        }
    }

    // Debounced content change handler (1s delay)
    function handleContentChange(newContent: string) {
        setContentValue(newContent);
        setSaveStatus("idle");

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = window.setTimeout(() => {
            saveNoteContent(newContent);
        }, 1000);
    }

    async function handleUpdateFolder(folderId: number, newTitle: string) {
        if (user == null) {
            alert("User non connecté");
            return;
        }
        const command: UpdateFolderCommand = {
            id: folderId,
            userId: user.id,
            title: newTitle,
        };
        await folderService.updateFolder(command);
        await refreshTree();
    }

    function toggleSidebar() {
        setSidebarOpen(!sidebarOpen);
    }

    function toggleNoteLock(noteId: number) {
        setLockedNotes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(noteId)) {
                newSet.delete(noteId);
            } else {
                newSet.add(noteId);
            }
            localStorage.setItem('lockedNotes', JSON.stringify([...newSet]));
            return newSet;
        });
    }

    // Recursively searches for a note by ID in the folder tree
    function findNoteInTree(nodes: FolderNode[], noteId: number): Note | null {
        for (const folder of nodes) {
            const note = folder.notes?.find(n => n.id === noteId);
            if (note) return note;
            if (folder.children?.length) {
                const found = findNoteInTree(folder.children, noteId);
                if (found) return found;
            }
        }
        return null;
    }

    function handleQuickOpenFolder(folderId: number) {
        setCurrentFolderId(folderId);
        setSidebarOpen(true);
    }

    function handleQuickOpenNote(noteId: number, folderId?: number | null) {
        if (folderId) setCurrentFolderId(folderId);
        const note = findNoteInTree(tree, noteId) || rootNotes.find(n => n.id === noteId);
        if (note) {
            handleSelectNote(note);
        }
        setSidebarOpen(true);
    }

    // Collects all notes for @mentions (excluding current note)
    const allNotes = useMemo((): MentionItem[] => {
        const collectNotes = (nodes: FolderNode[]): MentionItem[] => {
            let result: MentionItem[] = [];
            for (const folder of nodes) {
                if (folder.notes) {
                    result = result.concat(
                        folder.notes
                            .filter(n => n.id !== selectedNote?.id)
                            .map(n => ({ id: n.id!, title: n.title || 'Sans titre' }))
                    );
                }
                if (folder.children) {
                    result = result.concat(collectNotes(folder.children));
                }
            }
            return result;
        };

        const treeNotes = collectNotes(tree);
        const rootNotesItems = rootNotes
            .filter(n => n.id !== selectedNote?.id)
            .map(n => ({ id: n.id!, title: n.title || 'Sans titre' }));

        return [...rootNotesItems, ...treeNotes];
    }, [tree, rootNotes, selectedNote?.id]);

    function handleMentionClick(noteId: number) {
        const note = findNoteInTree(tree, noteId) || rootNotes.find(n => n.id === noteId);
        if (note) {
            handleSelectNote(note);
        }
    }

    return (
        <div className={`app-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
            <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h2>
                        <span className="sidebar-icon">📁</span>
                        Mes dossiers
                    </h2>
                    <button
                        className="sidebar-toggle"
                        onClick={toggleSidebar}
                        data-tooltip={sidebarOpen ? "Fermer" : "Ouvrir"}
                    >
                        {sidebarOpen ? '◀' : '▶'}
                    </button>
                </div>

                {sidebarOpen && (
                    <>
                        <FolderHeader
                            onCreateFolder={handleCreateFolder}
                            onCreateNote={handleCreateNote}
                            currentFolderId={currentFolderId}
                            rootFolderId={rootFolderId}
                        />

                        <div className="sidebar-content">
                            {rootNotes.length > 0 && (
                                <ul className="root-notes-section">
                                    {rootNotes.map(note => (
                                        <NoteItem
                                            key={note.id}
                                            note={note}
                                            isSelected={selectedNote?.id === note.id}
                                            onSelect={handleSelectNote}
                                            onDelete={handleDeleteNote}
                                            depth={0}
                                        />
                                    ))}
                                </ul>
                            )}

                            <FolderTreeComponent
                                nodes={tree}
                                onSelectFolder={setCurrentFolderId}
                                currentFolderId={currentFolderId}
                                onDeleteFolder={handleDeleteFolder}
                                onSelectNote={handleSelectNote}
                                selectedNoteId={selectedNote?.id ?? null}
                                onUpdateFolder={handleUpdateFolder}
                                onDeleteNote={handleDeleteNote}
                            />
                        </div>

                        <div className="sidebar-footer">
                            <ExportZipButton
                                folderId={currentFolderId!}
                                disabled={!currentFolderId}
                            />
                        </div>
                    </>
                )}
            </aside>

            {!sidebarOpen && (
                <button
                    className="sidebar-toggle-floating"
                    onClick={toggleSidebar}
                    data-tooltip="Ouvrir le menu"
                >
                    ☰
                </button>
            )}

            <main className="content">
                {selectedNote ? (
                    <>
                        <div className="note-toolbar">
                            <div className="toolbar-left">
                                <ExportPdfButton
                                    noteId={selectedNote.id!}
                                    disabled={saveStatus === "saving"}
                                />
                            </div>
                            <div className="toolbar-right">
                                {saveStatus === "saving" && (
                                    <span className="save-status saving">
                                        <span className="status-dot"></span>
                                        Sauvegarde...
                                    </span>
                                )}
                                {saveStatus === "saved" && (
                                    <span className="save-status saved">
                                        <span className="status-icon">✓</span>
                                        Sauvegardé
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="note-header">
                            {editingTitle ? (
                                <input
                                    className="title-input"
                                    value={noteTitleValue}
                                    onChange={(e) => setNoteTitleValue(e.target.value)}
                                    onBlur={saveNoteTitle}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") saveNoteTitle();
                                        if (e.key === "Escape") setEditingTitle(false);
                                    }}
                                    autoFocus
                                />
                            ) : (
                                <h1
                                    className="note-title"
                                    onDoubleClick={() => setEditingTitle(true)}
                                    title="Double-cliquez pour modifier"
                                >
                                    {selectedNote.title}
                                </h1>
                            )}
                        </div>

                        <div className="note-meta">
                            <span className="meta-item">
                                <span className="meta-icon">📅</span>
                                <span className="meta-label">Créé:</span>
                                <span className="meta-value">
                                    {selectedNote.createdAt
                                        ? new Date(selectedNote.createdAt).toLocaleDateString('fr-FR', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : '-'}
                                </span>
                            </span>
                            <span className="meta-item">
                                <span className="meta-icon">✏️</span>
                                <span className="meta-label">Modifié:</span>
                                <span className="meta-value">
                                    {selectedNote.updatedAt
                                        ? new Date(selectedNote.updatedAt).toLocaleDateString('fr-FR', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : '-'}
                                </span>
                            </span>
                        </div>

                        <MarkdownEditor
                            content={contentValue}
                            onChange={handleContentChange}
                            notes={allNotes}
                            onMentionClick={handleMentionClick}
                            locked={selectedNote?.id ? lockedNotes.has(selectedNote.id) : false}
                            onToggleLock={() => selectedNote?.id && toggleNoteLock(selectedNote.id)}
                        />
                    </>
                ) : (
                    <div className="no-selection">
                        <div className="no-selection-icon">🎃</div>
                        <h2>Aucune note sélectionnée</h2>
                        <p>Sélectionnez une note dans la barre latérale ou créez-en une nouvelle</p>
                    </div>
                )}
            </main>

            <QuickSearch
                userId={user?.id}
                onOpenFolder={handleQuickOpenFolder}
                onOpenNote={handleQuickOpenNote}
            />

            {showShortcuts && (
                <div className="shortcuts-overlay" onClick={() => setShowShortcuts(false)}>
                    <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="shortcuts-header">
                            <h2>Raccourcis clavier</h2>
                            <button className="shortcuts-close" onClick={() => setShowShortcuts(false)}>×</button>
                        </div>
                        <div className="shortcuts-content">
                            <div className="shortcuts-section">
                                <h3>Navigation</h3>
                                <div className="shortcut-item">
                                    <span className="shortcut-keys"><kbd>Shift</kbd> <kbd>Shift</kbd></span>
                                    <span className="shortcut-desc">Recherche rapide</span>
                                </div>
                                <div className="shortcut-item">
                                    <span className="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>E</kbd></span>
                                    <span className="shortcut-desc">Toggle sidebar</span>
                                </div>
                                <div className="shortcut-item">
                                    <span className="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>:</kbd></span>
                                    <span className="shortcut-desc">Aide raccourcis</span>
                                </div>
                                <div className="shortcut-item">
                                    <span className="shortcut-keys"><kbd>Escape</kbd></span>
                                    <span className="shortcut-desc">Désélectionner</span>
                                </div>
                            </div>
                            <div className="shortcuts-section">
                                <h3>Notes & Dossiers</h3>
                                <div className="shortcut-item">
                                    <span className="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>N</kbd></span>
                                    <span className="shortcut-desc">Nouvelle note</span>
                                </div>
                                <div className="shortcut-item">
                                    <span className="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>D</kbd></span>
                                    <span className="shortcut-desc">Nouveau dossier</span>
                                </div>
                                <div className="shortcut-item">
                                    <span className="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>S</kbd></span>
                                    <span className="shortcut-desc">Sauvegarder</span>
                                </div>
                                <div className="shortcut-item">
                                    <span className="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>P</kbd></span>
                                    <span className="shortcut-desc">Exporter en PDF</span>
                                </div>
                                <div className="shortcut-item">
                                    <span className="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>L</kbd></span>
                                    <span className="shortcut-desc">Bloquer/Débloquer</span>
                                </div>
                                <div className="shortcut-item">
                                    <span className="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>Backspace</kbd></span>
                                    <span className="shortcut-desc">Supprimer</span>
                                </div>
                            </div>
                            <div className="shortcuts-section">
                                <h3>Formatage</h3>
                                <div className="shortcut-item">
                                    <span className="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>B</kbd></span>
                                    <span className="shortcut-desc">Gras</span>
                                </div>
                                <div className="shortcut-item">
                                    <span className="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>I</kbd></span>
                                    <span className="shortcut-desc">Italique</span>
                                </div>
                                <div className="shortcut-item">
                                    <span className="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>U</kbd></span>
                                    <span className="shortcut-desc">Souligné</span>
                                </div>
                                <div className="shortcut-item">
                                    <span className="shortcut-keys"><kbd>@</kbd></span>
                                    <span className="shortcut-desc">Lier une note</span>
                                </div>
                            </div>
                            <div className="shortcuts-section">
                                <h3>Historique</h3>
                                <div className="shortcut-item">
                                    <span className="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>Z</kbd></span>
                                    <span className="shortcut-desc">Annuler</span>
                                </div>
                                <div className="shortcut-item">
                                    <span className="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>Y</kbd></span>
                                    <span className="shortcut-desc">Rétablir</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

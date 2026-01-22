// Composant principal : affiche la sidebar + l'éditeur de notes
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

// Services pour communiquer avec le backend
const folderService = new FolderService();
const noteService = new NoteService();

export function FolderList() {
    // États React : quand ça change, le composant se re-render
    const [tree, setTree] = useState<FolderNode[]>([]);              // Arbre des dossiers
    const [rootNotes, setRootNotes] = useState<Note[]>([]);          // Notes du dossier racine
    const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);  // Dossier sélectionné
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);  // Note ouverte
    const [editingTitle, setEditingTitle] = useState(false);         // Mode édition titre
    const [noteTitleValue, setNoteTitleValue] = useState("");        // Valeur du titre
    const [contentValue, setContentValue] = useState("");            // Contenu de la note
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");  // Statut sauvegarde
    const [sidebarOpen, setSidebarOpen] = useState(true);           // Sidebar ouverte/fermée
    const [showShortcuts, setShowShortcuts] = useState(false);     // Modal aide raccourcis
    const [rootFolderId, setRootFolderId] = useState<number | null>(null);  // ID du dossier racine
    const [lockedNotes, setLockedNotes] = useState<Set<number>>(() => {
        // Charge les notes bloquées depuis localStorage
        const saved = localStorage.getItem('lockedNotes');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });
    const {user} = useAuth();  // User connecté (contient id, userName, token JWT)

    // useRef pour le debounce : garde la valeur entre les renders
    const saveTimeoutRef = useRef<number | null>(null);

    // useEffect : s'exécute quand user change (au login)
    useEffect(() => {
        if (user) {
            refreshTree();
        }
    }, [user]);

    // Raccourcis clavier globaux
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore si on tape dans un input/textarea
            const target = e.target as HTMLElement;
            const isEditing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

            // Cmd/Ctrl + : : Aide raccourcis (fonctionne partout)
            const isMod = e.ctrlKey || e.metaKey; // Ctrl sur Windows/Linux, Cmd sur Mac

            if (isMod && (e.key === ':' || e.key === '/')) {
                e.preventDefault();
                setShowShortcuts(prev => !prev);
                return;
            }

            // Escape : Ferme le modal ou désélectionne
            if (e.key === 'Escape') {
                if (showShortcuts) {
                    setShowShortcuts(false);
                    return;
                }
                // Désélectionne la note puis le dossier
                if (selectedNote) {
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

            // Les raccourcis suivants ne fonctionnent pas si on édite du texte
            if (isEditing) return;

            // Cmd/Ctrl + S : Sauvegarde manuelle immédiate
            if (isMod && e.key === 's') {
                e.preventDefault();
                if (selectedNote && contentValue) {
                    saveNoteContent(contentValue);
                }
                return;
            }

            // Cmd/Ctrl + D : Nouveau dossier
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

            // Cmd/Ctrl + E : Toggle sidebar
            if (isMod && e.key === 'e') {
                e.preventDefault();
                setSidebarOpen(prev => !prev);
                return;
            }

// Cmd/Ctrl + Backspace/Delete : suppression note ou dossier
            if (isMod && (e.key === "Backspace" || e.key === "Delete")) {
                e.preventDefault();

                // 1) Si une note est ouverte => supprimer la note
                const noteId = selectedNote?.id;
                if (noteId != null) {
                    handleDeleteNote(noteId);
                    return;
                }

                // 2) Sinon supprimer le dossier sélectionné (pas la racine)
                const folderId =
                    currentFolderId != null && currentFolderId !== rootFolderId
                        ? currentFolderId
                        : null;

                if (folderId != null) {
                    handleDeleteFolder(folderId);
                    return;
                }
            }


            // Cmd/Ctrl + P : Export PDF (si une note est sélectionnée)
            if (isMod && e.key === 'p') {
                e.preventDefault();
                if (selectedNote?.id) {
                    window.open(`http://localhost:8080/api/notes/${selectedNote.id}/export-pdf`, '_blank');
                }
                return;
            }

            // Cmd/Ctrl  + N : Nouvelle note
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

            // Cmd/Ctrl + L : Bloquer/débloquer la note
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

    // Recharge l'arbre depuis le backend
    async function refreshTree() {
        if (!user) return;
        const { folders, notes } = await folderService.getAllFoldersAndNotesByUser(user.id);

        const { tree, rootNotes, rootFolderId } = buildFolderTree(folders, notes);
        setTree(tree);
        setRootNotes(rootNotes);
        setRootFolderId(rootFolderId);
    }

    // Crée un nouveau dossier
    async function handleCreateFolder(data: any) {
        if (user == null) {
            alert("User non connecté");
            return;
        }
        await folderService.createFolder(data);
        await refreshTree();
    }

    // Crée une nouvelle note dans le dossier courant
    async function handleCreateNote(data: any) {
        const createdNote = await noteService.createNote(data);
        await refreshTree();
        // Sélectionne automatiquement la note créée
        setSelectedNote(createdNote);
        setNoteTitleValue(createdNote.title || "");
        setContentValue(createdNote.content || "");
    }

    // Supprime un dossier (clic droit > supprimer)
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

    // Supprime une note (clic droit > supprimer)
    async function handleDeleteNote(id: number) {
        await noteService.deleteNote(id);
        // Si c'était la note ouverte, on la ferme
        if (selectedNote?.id === id) {
            setSelectedNote(null);
            setContentValue("");
            setNoteTitleValue("");
        }
        await refreshTree();
    }

    // Quand on clique sur une note dans la sidebar (null = désélection)
    function handleSelectNote(note: Note | null) {
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

    // Sauvegarde le titre (Enter ou perte de focus)
    async function saveNoteTitle() {
        if (selectedNote && noteTitleValue.trim()) {
            const command: NoteUpdateCommand = {
                id: selectedNote.id,
                title: noteTitleValue,
                content: contentValue
            };
            await noteService.updateNote(command);
            setSelectedNote({ ...selectedNote, title: noteTitleValue });
            // Met à jour le titre dans l'arbre (pour la sidebar)
            updateNoteInTree(selectedNote.id!, { title: noteTitleValue });
        }
        setEditingTitle(false);
    }

    // Met à jour une note dans l'arbre local (évite de recharger tout l'arbre)
    function updateNoteInTree(noteId: number, updates: Partial<Note>) {
        // Met à jour dans l'arbre des dossiers
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

        // Met à jour dans les notes racine
        setRootNotes(prevNotes =>
            prevNotes.map(note =>
                note.id === noteId ? { ...note, ...updates } : note
            )
        );
    }

    // Sauvegarde le contenu (appelé après 1s sans frappe = debounce)
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
            // Met à jour la note sélectionnée
            setSelectedNote({ ...selectedNote, content, updatedAt: now });
            // Met à jour la note dans l'arbre local
            updateNoteInTree(selectedNote.id!, { content, updatedAt: now });
            setSaveStatus("saved");
            // Remet à idle après 2s
            setTimeout(() => setSaveStatus("idle"), 2000);
        } catch {
            setSaveStatus("idle");
        }
    }

    // Appelé à chaque frappe : attend 1s avant de sauvegarder (debounce)
    function handleContentChange(newContent: string) {
        setContentValue(newContent);
        setSaveStatus("idle");

        // Annule le timer précédent si on tape encore
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Lance un nouveau timer de 1s
        saveTimeoutRef.current = window.setTimeout(() => {
            saveNoteContent(newContent);
        }, 1000);
    }

    // Renomme un dossier (double-clic)
    async function handleUpdateFolder(newTitle: string) {
        if (user == null) {
            alert("User non connecté");
            return;
        }
        const command: UpdateFolderCommand = {
            id: currentFolderId,
            userId: user.id,
            title: newTitle,
        };
        await folderService.updateFolder(command);
        await refreshTree();
    }

    // Ouvre/ferme la sidebar (bouton ◀/▶)
    function toggleSidebar() {
        setSidebarOpen(!sidebarOpen);
    }

    // Bloque/débloque une note
    function toggleNoteLock(noteId: number) {
        setLockedNotes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(noteId)) {
                newSet.delete(noteId);
            } else {
                newSet.add(noteId);
            }
            // Sauvegarde dans localStorage
            localStorage.setItem('lockedNotes', JSON.stringify([...newSet]));
            return newSet;
        });
    }

    // Cherche une note par ID dans l'arbre (récursif)
    function findNoteInTree(nodes: FolderNode[], noteId: number): Note | null {
        for (const folder of nodes) {
            // Cherche dans les notes du dossier
            const note = folder.notes?.find(n => n.id === noteId);
            if (note) return note;
            // Cherche dans les sous-dossiers
            if (folder.children?.length) {
                const found = findNoteInTree(folder.children, noteId);
                if (found) return found;
            }
        }
        return null;
    }

    // Callback QuickSearch : ouvre un dossier
    function handleQuickOpenFolder(folderId: number) {
        setCurrentFolderId(folderId);
        setSidebarOpen(true);
    }

    // Callback QuickSearch : ouvre une note
    function handleQuickOpenNote(noteId: number, folderId?: number | null) {
        // Sélectionne le dossier parent si fourni
        if (folderId) setCurrentFolderId(folderId);
        // Cherche la note dans l'arbre ou les notes racine
        const note = findNoteInTree(tree, noteId) || rootNotes.find(n => n.id === noteId);
        if (note) {
            handleSelectNote(note);
        }
        setSidebarOpen(true);
    }

    // Collecte toutes les notes pour les @mentions (excluant la note courante)
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

        // Notes des dossiers + notes racine
        const treeNotes = collectNotes(tree);
        const rootNotesItems = rootNotes
            .filter(n => n.id !== selectedNote?.id)
            .map(n => ({ id: n.id!, title: n.title || 'Sans titre' }));

        return [...rootNotesItems, ...treeNotes];
    }, [tree, rootNotes, selectedNote?.id]);

    // Callback @mention : ouvre la note liée
    function handleMentionClick(noteId: number) {
        const note = findNoteInTree(tree, noteId) || rootNotes.find(n => n.id === noteId);
        if (note) {
            handleSelectNote(note);
        }
    }

    return (
        // Layout principal : sidebar + zone de contenu
        <div className={`app-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
            {/* === SIDEBAR === Navigation des dossiers/notes */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h2>
                        <span className="sidebar-icon">📁</span>
                        Mes dossiers
                    </h2>
                    {/* Bouton toggle : masque/affiche la sidebar */}
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
                        {/* Boutons créer dossier/note */}
                        <FolderHeader
                            onCreateFolder={handleCreateFolder}
                            onCreateNote={handleCreateNote}
                            currentFolderId={currentFolderId}
                            rootFolderId={rootFolderId}
                        />

                        {/* Arbre des dossiers et notes */}
                        <div className="sidebar-content">
                            {/* Notes du dossier racine (sans dossier) */}
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

                        {/* Export ZIP en bas de la sidebar */}
                        <div className="sidebar-footer">
                            <ExportZipButton
                                folderId={currentFolderId!}
                                disabled={!currentFolderId}
                            />
                        </div>
                    </>
                )}
            </aside>

            {/* Bouton flottant ☰ visible uniquement quand sidebar fermée */}
            {!sidebarOpen && (
                <button
                    className="sidebar-toggle-floating"
                    onClick={toggleSidebar}
                    data-tooltip="Ouvrir le menu"
                >
                    ☰
                </button>
            )}

            {/* Zone principale : éditeur de note */}
            <main className="content">
                {selectedNote ? (
                    <>
                        {/* Barre d'outils : export PDF + statut sauvegarde */}
                        <div className="note-toolbar">
                            <div className="toolbar-left">
                                <ExportPdfButton
                                    noteId={selectedNote.id!}
                                    disabled={saveStatus === "saving"}
                                />
                            </div>
                            <div className="toolbar-right">
                                {/* Message de statut */}
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

                        {/* Titre : double-clic pour éditer */}
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

                        {/* Dates : création + dernière modif */}
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

                        {/* Éditeur TipTap - tape @ pour lier une note */}
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

            {/* QuickSearch : double-shift pour ouvrir */}
            <QuickSearch
                userId={user?.id}
                onOpenFolder={handleQuickOpenFolder}
                onOpenNote={handleQuickOpenNote}
            />

            {/* Modal aide raccourcis */}
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

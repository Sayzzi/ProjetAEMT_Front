// Composant principal : affiche la sidebar + l'éditeur de notes
import {useEffect, useState, useRef} from "react";
import type {FolderNode} from "../../types/folderNode.ts";
import type Note from "../../types/note.ts";
import {buildFolderTree} from "../utils/buildFolderTree.tsx";
import {FolderTreeComponent} from "./folderTreeComponent.tsx";
import {FolderHeader} from "./folderHeader.tsx";
import MarkdownEditor from "./MarkdownEditor.tsx";
import ExportPdfButton from "./exportPdfButton.tsx";
import "./folderList.css";
import {FolderService} from "../services/folderService.tsx";
import {useAuth} from "../../auth/contexts/AuthContext.tsx";
import type {UpdateFolderCommand} from "../../types/commands/updateFolderCommand.ts";
import {NoteService} from "../../note/service/note-service.tsx";
import type {NoteUpdateCommand} from "../../types/commands/noteUpdateCommand.ts";
import {QuickSearch} from "../../search/components/QuickSearch.tsx";

// Services pour communiquer avec le backend
const folderService = new FolderService();
const noteService = new NoteService();

export function FolderList() {
    // États React : quand ça change, le composant se re-render
    const [tree, setTree] = useState<FolderNode[]>([]);              // Arbre des dossiers
    const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);  // Dossier sélectionné
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);  // Note ouverte
    const [editingTitle, setEditingTitle] = useState(false);         // Mode édition titre
    const [noteTitleValue, setNoteTitleValue] = useState("");        // Valeur du titre
    const [contentValue, setContentValue] = useState("");            // Contenu de la note
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");  // Statut sauvegarde
    const {user} = useAuth();  // User connecté (JWT)

    // useRef pour le debounce : garde la valeur entre les renders
    const saveTimeoutRef = useRef<number | null>(null);

    // useEffect : s'exécute quand user change (au login)
    useEffect(() => {
        if (user) {
            refreshTree();
        }
    }, [user]);

    // Recharge l'arbre depuis le backend
    async function refreshTree() {
        if (!user) return;
        const { folders, notes } = await folderService.getAllFoldersAndNotesByUser(user.id);
        const tree = buildFolderTree(folders, notes);
        setTree(tree);
    }

    // Crée un nouveau dossier
    async function handleCreateFolder(data: any) {
        if (user == null) {
            alert("User non connecté");
            return;
        }
        const createdFolder = await folderService.createFolder(data);
        console.log("Dossier créé :", createdFolder);
        await refreshTree();
    }

    // Crée une nouvelle note dans le dossier courant
    async function handleCreateNote(data: any) {
        try {
            const createdNote = await noteService.createNote(data);
            console.log("Note créée :", createdNote);
            await refreshTree();
            // Sélectionne automatiquement la note créée
            setSelectedNote(createdNote);
            setNoteTitleValue(createdNote.title || "");
            setContentValue(createdNote.content || "");
        } catch (error) {
            console.error("Erreur lors de la création de la note", error);
        }
    }

    // Supprime un dossier (clic droit > supprimer)
    async function handleDeleteFolder(id: number) {
        if (user == null) {
            alert("User non connecté");
            return;
        }
        await folderService.deleteFolder(id);
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

    // Quand on clique sur une note dans la sidebar
    function handleSelectNote(note: Note) {
        setSelectedNote(note);
        setNoteTitleValue(note.title || "");
        setContentValue(note.content || "");
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
            await refreshTree();
        }
        setEditingTitle(false);
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
            setSaveStatus("saving");  // "En cours de sauvegarde..."
            await noteService.updateNote(command);
            // Met à jour la date de modif dans l'UI sans recharger
            setSelectedNote({ ...selectedNote, updatedAt: new Date().toISOString() });
            setSaveStatus("saved");  // "Note sauvegardée !"
            console.log("Note sauvegardée");
            // Remet à idle après 2s
            setTimeout(() => setSaveStatus("idle"), 2000);
        } catch (error) {
            console.error("Erreur sauvegarde:", error);
            setSaveStatus("idle");
        }
    }

    // Appelé à chaque frappe : attend 1s avant de sauvegarder (debounce)
    function handleContentChange(newContent: string) {
        setContentValue(newContent);
        setSaveStatus("idle");  // Reset pendant la frappe

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

    // Recherche une note dans l'arbre à partir de son ID
    function findNoteInTree(noteId: number): { note: Note, folderId: number } | null {
        const stack: FolderNode[] = [...tree];
        while (stack.length) {
            const node = stack.pop()!;
            if (node.notes) {
                const match = node.notes.find(n => n.id === noteId);
                if (match) {
                    return { note: match, folderId: node.id };
                }
            }
            if (node.children && node.children.length) {
                stack.push(...node.children);
            }
        }
        return null;
    }

    // Ouvre un élément depuis la recherche rapide
    function openFromSearch(noteId: number, folderId?: number | null) {
        if (folderId) {
            setCurrentFolderId(folderId);
        }
        const found = findNoteInTree(noteId);
        if (found) {
            handleSelectNote(found.note);
            return;
        }
        alert("Note introuvable dans l'arborescence");
    }

    return (
        <div className="app-layout">
            <QuickSearch
                userId={user?.id}
                onOpenFolder={setCurrentFolderId}
                onOpenNote={openFromSearch}
            />
            {/* Sidebar gauche : liste des dossiers */}
            <aside className="sidebar">
                <h2>Mes dossiers</h2>

                {/* Boutons créer dossier/note */}
                <FolderHeader
                    onCreateFolder={handleCreateFolder}
                    onCreateNote={handleCreateNote}
                    currentFolderId={currentFolderId}
                />

                {/* Arbre des dossiers et notes */}
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
            </aside>

            {/* Zone principale : éditeur de note */}
            <main className="content">
                {selectedNote ? (
                    <>
                        {/* Barre d'outils : export PDF + statut sauvegarde */}
                        <div className="note-toolbar">
                            <ExportPdfButton
                                noteId={selectedNote.id!}
                                disabled={saveStatus === "saving"}
                            />
                            {/* Message de statut */}
                            {saveStatus === "saved" && (
                                <span className="save-status saved">✅ Note sauvegardée !</span>
                            )}
                        </div>

                        {/* Titre : double-clic pour éditer */}
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
                            <h1 onDoubleClick={() => setEditingTitle(true)}>
                                {selectedNote.title}
                            </h1>
                        )}

                        {/* Dates : création + dernière modif */}
                        <div className="note-dates">
                            <span>📅 Créé: {selectedNote.createdAt ? new Date(selectedNote.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                            <span>✏️ Modifié: {selectedNote.updatedAt ? new Date(selectedNote.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                        </div>

                        {/* Éditeur TipTap */}
                        <MarkdownEditor
                            content={contentValue}
                            onChange={handleContentChange}
                        />
                    </>
                ) : (
                    <p className="no-selection">Sélectionnez une note</p>
                )}
            </main>
        </div>
    );
}

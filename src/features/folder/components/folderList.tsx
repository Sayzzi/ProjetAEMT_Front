import {FakeFolderService} from "../services/fakeFolderService.tsx";
import {useEffect, useState} from "react";
import type {FolderNode} from "../../types/folderNode.ts";
import type Note from "../../types/note.ts";
import {buildFolderTree} from "../utils/buildFolderTree.tsx";
import {FolderTreeComponent} from "./folderTreeComponent.tsx";
import {FolderHeader} from "./folderHeader.tsx";
import MarkdownEditor from "./MarkdownEditor.tsx";
import "./folderList.css";
import {FolderService} from "../services/folderService.tsx";
import {useAuth} from "../../auth/contexts/AuthContext.tsx";
import type {UpdateFolderCommand} from "../../types/commands/updateFolderCommand.ts";
import {NoteService} from "../../note/service/note-service.tsx";
import type {NoteUpdateCommand} from "../../types/commands/noteUpdateCommand.ts";
const fakeFolderService = new FakeFolderService();

const folderService = new FolderService();
const noteService = new NoteService();

export function FolderList() {
    // États
    const [tree, setTree] = useState<FolderNode[]>([]);
    const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [editingTitle, setEditingTitle] = useState(false);
    const [noteTitleValue, setNoteTitleValue] = useState("");
    const [contentValue, setContentValue] = useState("");
    const {user} = useAuth();

    useEffect(() => {
        refreshTree();
    }, []);

    // Rafraîchit l'arbre
    async function refreshTree() {
        const { folders, notes } = await folderService.getAllFoldersAndNotesByUser(3);
        const tree = buildFolderTree(folders, notes);
        setTree(tree);
    }

    // Crée un dossier
    async function handleCreateFolder(data) {
        if (user == null){
            alert("User non connecté");
            return
        }
        const createdHolder= await folderService.createFolder(data);
        console.log("Dossier créée :", createdHolder);
        await refreshTree();
    }

    // Crée une note
    async function handleCreateNote(data) {
        try {
            const createdNote = await noteService.createNote(data);
            console.log("Note créée :", createdNote);

            await refreshTree(); // important : attendre la mise à jour

            setSelectedNote(createdNote);
            setNoteTitleValue(createdNote.title || "");
            setContentValue(createdNote.content || "");
        } catch (error) {
            console.error("Erreur lors de la création de la note", error);
        }
    }



    // Supprime un dossier
    async function handleDeleteFolder(id: number) {
        if (user == null){//On verifie si le user est connecté
            alert("User non connecté");
            return
        }
        await folderService.deleteFolder(id);
        await refreshTree();
    }

    // Sélectionne une note
    function handleSelectNote(note: Note) {
        if (selectedNote && contentValue !== selectedNote.content) {
            fakeFolderService.updateNote(selectedNote.id!, { content: contentValue });
            refreshTree();
        }
        setSelectedNote(note);
        setNoteTitleValue(note.title || "");
        setContentValue(note.content || "");
        setEditingTitle(false);
    }

    // Sauvegarde le titre
    async function saveNoteTitle() {
        if (selectedNote && noteTitleValue.trim()) {


            const command : NoteUpdateCommand = {
                id : selectedNote.id,
                title : noteTitleValue,
                content : contentValue
            }

            await noteService.updateNote(command);

            setSelectedNote({ ...selectedNote, title: noteTitleValue });
            await refreshTree();
        }
        setEditingTitle(false);
    }

    // Met à jour le contenu
    async function handleContentChange(newContent: string) {
        setContentValue(newContent);
        if (selectedNote ==  null) {
            return
        }

        const command : NoteUpdateCommand = {
            id : selectedNote.id,
            title : selectedNote.title || "",
            content : contentValue
        }

        await noteService.updateNote(command);
        await refreshTree();
    }

    //Met à jour un folder
    async function handleUpdateFolder(newTitle: string) {

        if (user == null){
            alert("User non connecté");
            return
        }

        const command : UpdateFolderCommand = {
            id : currentFolderId,
            userId : user.id,
            title : newTitle,
        }

        await folderService.updateFolder(command);
        await refreshTree();
    }

    return (
        <div className="app-layout">
            {/* Sidebar gauche */}
            <aside className="sidebar">
                <h2>Mes dossiers</h2>

                <FolderHeader
                    onCreateFolder={handleCreateFolder}
                    onCreateNote={handleCreateNote}
                    currentFolderId={currentFolderId}
                />

                <FolderTreeComponent
                    nodes={tree}
                    onSelectFolder={setCurrentFolderId}
                    currentFolderId={currentFolderId}
                    onDeleteFolder={handleDeleteFolder}
                    onSelectNote={handleSelectNote}
                    selectedNoteId={selectedNote?.id ?? null}
                    onUpdateFolder={handleUpdateFolder}
                />
            </aside>

            {/* Contenu droite */}
            <main className="content">
                {selectedNote ? (
                    <>
                        {/* Titre (double-clic pour éditer) */}
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

                        {/* Éditeur Markdown */}
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

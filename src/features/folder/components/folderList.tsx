import {FakeFolderService} from "../services/fakeFolderService.tsx";
import {useEffect, useState} from "react";
import type {FolderNode} from "../../types/folderNode.ts";
import type Note from "../../types/note.ts";
import {buildFolderTree} from "../utils/buildFolderTree.tsx";
import {FolderTreeComponent} from "./folderTreeComponent.tsx";
import {FolderHeader} from "./folderHeader.tsx";
import MarkdownEditor from "./MarkdownEditor.tsx";
import "./folderList.css";

const folderService = new FakeFolderService();

export function FolderList() {
    // États
    const [tree, setTree] = useState<FolderNode[]>([]);
    const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [editingTitle, setEditingTitle] = useState(false);
    const [titleValue, setTitleValue] = useState("");
    const [contentValue, setContentValue] = useState("");

    // Charge les dossiers au démarrage
    useEffect(() => {
        const folders = folderService.getFoldersByUser(1);
        const notes = folderService.getNotesByUser(1);
        setTree(buildFolderTree(folders, notes));
    }, []);

    // Rafraîchit l'arbre
    function refreshTree() {
        const folders = folderService.getFoldersByUser(1);
        const notes = folderService.getNotesByUser(1);
        setTree(buildFolderTree(folders, notes));
    }

    // Crée un dossier
    function handleCreateFolder(data) {
        folderService.createFolder(data);
        refreshTree();
    }

    // Crée une note
    function handleCreateNote(data) {
        const newNote = folderService.createNote(data);
        refreshTree();
        setSelectedNote(newNote);
        setTitleValue(newNote.title || "");
        setContentValue(newNote.content || "");
    }

    // Supprime un dossier
    function handleDeleteFolder(id: number) {
        folderService.deleteFolder(id);
        refreshTree();
    }

    // Sélectionne une note
    function handleSelectNote(note: Note) {
        if (selectedNote && contentValue !== selectedNote.content) {
            folderService.updateNote(selectedNote.id!, { content: contentValue });
            refreshTree();
        }
        setSelectedNote(note);
        setTitleValue(note.title || "");
        setContentValue(note.content || "");
        setEditingTitle(false);
    }

    // Sauvegarde le titre
    function saveTitle() {
        if (selectedNote && titleValue.trim()) {
            folderService.updateNote(selectedNote.id!, { title: titleValue });
            setSelectedNote({ ...selectedNote, title: titleValue });
            refreshTree();
        }
        setEditingTitle(false);
    }

    // Met à jour le contenu
    function handleContentChange(newContent: string) {
        setContentValue(newContent);
        if (selectedNote) {
            folderService.updateNote(selectedNote.id!, { content: newContent });
        }
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
                                value={titleValue}
                                onChange={(e) => setTitleValue(e.target.value)}
                                onBlur={saveTitle}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") saveTitle();
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

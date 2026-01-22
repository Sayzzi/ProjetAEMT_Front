import {type ChangeEvent, useState} from "react";
import {useAuth} from "../../auth/contexts/AuthContext.tsx";
import type {CreateFolderCommand} from "../services/commands/createFolderCommand.ts";
import type {NoteCreateCommand} from "../../types/commands/note-create-command.ts";

interface InputData {
    folderTitle: string
    noteTitle: string
}

export function FolderHeader({ onCreateFolder, onCreateNote, currentFolderId, rootFolderId }) {
    const [openInput, setOpenInput] = useState<"folder" | "note" | null>(null);
    const {user} = useAuth();
    const [inputData, setInputData] = useState<InputData>({
        folderTitle: '',
        noteTitle: '',
    })

    function createFolder() {
        if (!inputData.folderTitle.trim()) return;
        if (user == null) {
            alert("Utilisateur non connecté");
            return;
        }
        const parentId = currentFolderId ?? rootFolderId;
        const command: CreateFolderCommand = {
            userId: user.id,
            parentFolderId: parentId,
            title: inputData.folderTitle,
        };
        onCreateFolder(command);
        setInputData(prev => ({ ...prev, folderTitle: '' }));
        setOpenInput(null);
    }

    function createNote() {
        if (!inputData.noteTitle.trim()) return;
        if (user == null) {
            alert("Utilisateur non connecté");
            return;
        }
        const folderId = currentFolderId ?? rootFolderId;
        if (!folderId) {
            alert("Aucun dossier disponible");
            return;
        }
        const command: NoteCreateCommand = {
            idUser: user.id,
            idFolder: folderId,
            title: inputData.noteTitle,
            content: ""
        };
        onCreateNote(command);
        setInputData(prev => ({ ...prev, noteTitle: '' }));
        setOpenInput(null);
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setInputData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    return (
        <div className="folder-header">
            <button onClick={() => setOpenInput(openInput === "folder" ? null : "folder")}>
                +📁
            </button>

            <button onClick={() => setOpenInput(openInput === "note" ? null : "note")}>
                +📄
            </button>

            {openInput === "folder" && (
                <div className="header-input">
                    <input
                        name="folderTitle"
                        type="text"
                        placeholder="Titre du dossier"
                        value={inputData.folderTitle}
                        onChange={handleChange}
                        onKeyDown={(e) => e.key === "Enter" && createFolder()}
                    />
                    <button onClick={createFolder}>Ajouter</button>
                </div>
            )}

            {openInput === "note" && (
                <div className="header-input">
                    <input
                        name="noteTitle"
                        type="text"
                        placeholder="Titre de la note"
                        value={inputData.noteTitle}
                        onChange={handleChange}
                        onKeyDown={(e) => e.key === "Enter" && createNote()}
                    />
                    <button onClick={createNote}>Ajouter</button>
                </div>
            )}
        </div>
    );
}

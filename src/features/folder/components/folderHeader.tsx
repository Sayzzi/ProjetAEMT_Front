import {type ChangeEvent, useState} from "react";
import {useAuth} from "../../auth/contexts/AuthContext.tsx";
import type {CreateFolderCommand} from "../services/commands/createFolderCommand.ts";
import type {NoteCreateCommand} from "../../types/commands/note-create-command.ts";

interface InputData {
    folderTitle: string
    noteTitle: string
}

// Composant pour créer des dossiers et des notes
export function FolderHeader({ onCreateFolder, onCreateNote, currentFolderId, rootFolderId }) {

    // État pour savoir quel input afficher (folder, note, ou aucun)
    const [openInput, setOpenInput] = useState<"folder" | "note" | null>(null);
    const {user} = useAuth();

    // Valeurs des inputs
    const [inputData, setInputData] = useState<InputData>({
        folderTitle: '',
        noteTitle: '',
    })

    // Crée un nouveau dossier
    function createFolder() {
        if (!inputData.folderTitle.trim()) return; // Ne pas créer si vide

        if (user == null) {
            alert("Utilisateur non connecté");
            return;
        }

        // Utilise le dossier sélectionné ou le dossier racine comme parent
        const parentId = currentFolderId ?? rootFolderId;

        const command: CreateFolderCommand = {
            userId: user.id,
            parentFolderId: parentId,
            title: inputData.folderTitle,
        };

        //Envoi du command au parent
        onCreateFolder(command);

        // Reset et ferme l'input
        setInputData(prev => ({ ...prev, folderTitle: '' }));
        setOpenInput(null);
    }

    // Crée une nouvelle note
    function createNote() {
        if (!inputData.noteTitle.trim()) return; // Ne pas créer si vide

        if (user == null) {
            alert("Utilisateur non connecté");
            return;
        }

        // Utilise le dossier sélectionné ou le dossier racine par défaut
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

        //Envoi du command au parent
        onCreateNote(command);

        // Reset et ferme l'input
        setInputData(prev => ({ ...prev, noteTitle: '' }));
        setOpenInput(null);
    }

    // Met à jour l'état à chaque frappe
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setInputData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    return (
        <div className="folder-header">
            {/* Boutons pour ouvrir les inputs */}
            <button onClick={() => setOpenInput(openInput === "folder" ? null : "folder")}>
                +📁
            </button>

            <button onClick={() => setOpenInput(openInput === "note" ? null : "note")}>
                +📄
            </button>

            {/* Input pour créer un dossier */}
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

            {/* Input pour créer une note */}
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

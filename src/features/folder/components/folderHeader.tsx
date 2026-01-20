import {type ChangeEvent, useState} from "react";

interface InputData {
    folderTitle: string
    noteTitle: string
}

// Composant pour créer des dossiers et des notes
export function FolderHeader({ onCreateFolder, onCreateNote, currentFolderId }) {

    // État pour savoir quel input afficher (folder, note, ou aucun)
    const [openInput, setOpenInput] = useState<"folder" | "note" | null>(null);

    // Valeurs des inputs
    const [inputData, setInputData] = useState<InputData>({
        folderTitle: '',
        noteTitle: '',
    })

    // Crée un nouveau dossier
    function createFolder() {
        if (!inputData.folderTitle.trim()) return; // Ne pas créer si vide
        onCreateFolder({
            id_user: 1,
            id_parent_folder: currentFolderId,
            title: inputData.folderTitle
        });
        // Reset et ferme l'input
        setInputData(prev => ({ ...prev, folderTitle: '' }));
        setOpenInput(null);
    }

    // Crée une nouvelle note
    function createNote() {
        if (!inputData.noteTitle.trim()) return; // Ne pas créer si vide
        if (currentFolderId === null) {
            alert("Sélectionnez d'abord un dossier");
            return;
        }
        onCreateNote({
            id_user: 1,
            id_folder: currentFolderId,
            title: inputData.noteTitle
        });
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

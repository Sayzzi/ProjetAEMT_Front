import {type ChangeEvent, useState} from "react";

interface InputData {
    folderTitle: string
    noteTitle: string
}

export function FolderHeader({ onCreateFolder, currentFolderId  }) {

    const [openInput, setOpenInput] = useState<"folder" | "note" | null>(null);

    //Signaux
    const [inputData, setInputData] = useState<InputData>({
        folderTitle: '',
        noteTitle: '',
    })

    //fonction qui va appel au service pour créer un folder
    function createFolder() {
        onCreateFolder({
            id_user: 1, //à remplacer avec le user connecté
            id_parent_folder: currentFolderId,//à remplacer avec le current folder
            title: inputData.folderTitle
        });
    }


    //fonction qui va appel au service pour créer une note
    function createNote() {

    }

    // Met à jour l'état du input à chaque frappe dans un input
    //Le champ modifié est identifié grâce à son attribut name
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setInputData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    return (
        <>
            <button onClick={() => setOpenInput(openInput === "folder" ? null : "folder")}>
                +📁
            </button>

            <button onClick={() => setOpenInput(openInput === "note" ? null : "note")}>
                +📄
            </button>

            {openInput === "folder" && (
                <>
                <input name="folderTitle" type="text" placeholder="Titre du dossier" onChange={handleChange} />
                    <button onClick={createFolder}>Ajouter</button>
                </>
            )}

            {openInput === "note" && (
                <>
                <input name="noteTitle" type="text" placeholder="Titre d'une note" onChange={handleChange}  />
                    <button onClick={createNote}>Ajouter</button>
                </>
            )}
        </>
    );
}
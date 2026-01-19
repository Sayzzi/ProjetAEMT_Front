import { useState } from "react";

export function FolderHeader() {

    const [openInput, setOpenInput] = useState<"folder" | "note" | null>(null);

    return (
        <>
            <button onClick={() => setOpenInput(openInput === "folder" ? null : "folder")}>
                +📁
            </button>

            <button onClick={() => setOpenInput(openInput === "note" ? null : "note")}>
                +📄
            </button>

            {openInput === "folder" && (
                <input type="text" placeholder="Créer un dossier" />
            )}

            {openInput === "note" && (
                <input type="text" placeholder="Créer une note" />
            )}
        </>
    );
}
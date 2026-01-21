import {useState, useEffect} from "react";
import {FolderTreeComponent} from "./folderTreeComponent.tsx";
import type Note from "../../types/note.ts";
import "./folderTreeComponent.css";

// Composant qui affiche un dossier et ses enfants (sous-dossiers + notes)
export function FolderItem({
    node,              // Le noeud du dossier à afficher
    onSelectFolder,    // Callback quand on sélectionne un dossier
    currentFolderId,   // ID du dossier actuellement sélectionné
    onDeleteFolder,    // Callback pour supprimer un dossier
    onSelectNote,     // Callback quand on clique sur une note
    selectedNoteId,     // ID de la note actuellement sélectionné
    onUpdateFolder
}) {
    // État pour savoir si le dossier est ouvert (déplié)
    const [open, setOpen] = useState(false);

    // État pour le mode édition du titre
    const [isEditing, setIsEditing] = useState(false);

    // Valeur du champ de renommage
    const [folderTitleValue, setFolderTitleValue] = useState(node.title);

    // Position du menu contextuel (clic droit)
    const [contextMenu, setContextMenu] = useState(null);

    // Vérifie si ce dossier est sélectionné
    const isSelected = currentFolderId === node.id;


    // Valide le renommage du dossier
    function handleRename() {
        if (folderTitleValue.trim() !== "" && folderTitleValue !== node.title) {
            setFolderTitleValue(folderTitleValue);
            onUpdateFolder(folderTitleValue);
        }
        setIsEditing(false);
    }

    // Annule le renommage et restaure le titre original
    function cancelRename() {
        setFolderTitleValue(node.title);
        setIsEditing(false);
    }

    // Ferme le menu contextuel quand on clique ailleurs
    useEffect(() => {
        const close = () => setContextMenu(null);
        window.addEventListener("click", close);
        return () => window.removeEventListener("click", close);
    }, []);

    return (
        <li>
            {/* Mode édition : affiche un input pour renommer */}
            {isEditing ? (
                <input
                    className="folder-input"
                    autoFocus
                    value={folderTitleValue}
                    onChange={(e) => setFolderTitleValue(e.target.value)}
                    onBlur={handleRename}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename();
                        if (e.key === "Escape") cancelRename();
                    }}
                />
            ) : (
                // Mode normal : affiche le dossier cliquable
                <div
                    className={`folder-item ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                        // Ouvre/ferme le dossier et le sélectionne
                        setOpen(!open);
                        onSelectFolder(node.id);
                    }}
                    onDoubleClick={() => setIsEditing(true)} // Double-clic = renommer
                    onContextMenu={(e) => {
                        // Clic droit = ouvre le menu contextuel
                        e.preventDefault();
                        setContextMenu({ x: e.clientX, y: e.clientY });
                    }}
                >
                    {/* Icône différente si ouvert ou fermé */}
                    {open ? "📂" : "📁"} {node.title}
                </div>
            )}

            {/* Menu contextuel (clic droit) */}
            {contextMenu && (
                <div
                    className="context-menu"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <div
                        className="context-menu-item"
                        onClick={() => {
                            onDeleteFolder(node.id);
                            setContextMenu(null);
                        }}
                    >
                        Supprimer
                    </div>
                </div>
            )}

            {/* Contenu du dossier (visible seulement si ouvert) */}
            {open && (
                <>
                    {/* Sous-dossiers (récursif) */}
                    {node.children.length > 0 && (
                        <FolderTreeComponent
                            nodes={node.children}
                            onSelectFolder={onSelectFolder}
                            currentFolderId={currentFolderId}
                            onDeleteFolder={onDeleteFolder}
                            onSelectNote={onSelectNote}
                            selectedNoteId={selectedNoteId}
                            onUpdateFolder={onUpdateFolder}
                        />
                    )}

                    {/* Notes du dossier */}
                    {node.notes && node.notes.length > 0 && (
                        <ul>
                            {node.notes.map((note: Note) => (
                                <li
                                    key={note.id}
                                    className={`note-item ${selectedNoteId === note.id ? "selected" : ""}`}
                                    onClick={() => onSelectNote?.(note)} // Sélectionne la note
                                >
                                    📄 {note.title}
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </li>
    );
}

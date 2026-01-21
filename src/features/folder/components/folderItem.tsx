// Composant qui affiche UN dossier + ses sous-dossiers + ses notes
import {useState, useEffect} from "react";
import {FolderTreeComponent} from "./folderTreeComponent.tsx";
import type Note from "../../types/note.ts";
import "./folderTreeComponent.css";

export function FolderItem({
    node,              // Le dossier à afficher
    onSelectFolder,    // Callback : sélectionne ce dossier
    currentFolderId,   // ID du dossier actuellement sélectionné
    onDeleteFolder,    // Callback : supprime ce dossier
    onSelectNote,      // Callback : sélectionne une note
    selectedNoteId,    // ID de la note sélectionnée
    onUpdateFolder,    // Callback : renomme ce dossier
    onDeleteNote,      // Callback : supprime une note
    depth = 0          // Niveau de profondeur (pour l'indentation)
}) {
    // true = dossier ouvert (on voit le contenu)
    const [open, setOpen] = useState(false);

    // true = mode édition du titre
    const [isEditing, setIsEditing] = useState(false);

    // Valeur de l'input de renommage
    const [folderTitleValue, setFolderTitleValue] = useState(node.title);

    // Position du menu clic droit sur dossier
    const [contextMenu, setContextMenu] = useState(null);

    // Position du menu clic droit sur note
    const [noteContextMenu, setNoteContextMenu] = useState<{x: number, y: number, noteId: number} | null>(null);

    // true si ce dossier est sélectionné
    const isSelected = currentFolderId === node.id;

    // Valide le renommage (Enter ou blur)
    function handleRename() {
        if (folderTitleValue.trim() !== "" && folderTitleValue !== node.title) {
            setFolderTitleValue(folderTitleValue);
            onUpdateFolder(folderTitleValue);
        }
        setIsEditing(false);
    }

    // Annule le renommage (Escape)
    function cancelRename() {
        setFolderTitleValue(node.title);
        setIsEditing(false);
    }

    // Ferme les menus contextuels quand on clique ailleurs
    useEffect(() => {
        const close = () => {
            setContextMenu(null);
            setNoteContextMenu(null);
        };
        window.addEventListener("click", close);
        return () => window.removeEventListener("click", close);
    }, []);

    return (
        <li>
            {/* Mode édition : input pour renommer */}
            {isEditing ? (
                <input
                    className="folder-input"
                    style={{ marginLeft: `${depth * 16}px` }}
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
                // Mode normal : affiche le dossier
                <div
                    className={`folder-item ${isSelected ? "selected" : ""} ${open ? "open" : ""}`}
                    style={{ paddingLeft: `${10 + depth * 16}px` }}
                    onClick={() => {
                        setOpen(!open);  // Toggle ouvert/fermé
                        onSelectFolder(node.id);
                    }}
                    onDoubleClick={() => setIsEditing(true)}  // Double-clic = renommer
                    onContextMenu={(e) => {
                        e.preventDefault();  // Empêche le menu par défaut
                        setContextMenu({ x: e.clientX, y: e.clientY });
                    }}
                >
                    {node.title}
                </div>
            )}

            {/* Menu clic droit sur dossier */}
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

            {/* Menu clic droit sur note */}
            {noteContextMenu && (
                <div
                    className="context-menu"
                    style={{ top: noteContextMenu.y, left: noteContextMenu.x }}
                >
                    <div
                        className="context-menu-item"
                        onClick={() => {
                            onDeleteNote?.(noteContextMenu.noteId);
                            setNoteContextMenu(null);
                        }}
                    >
                        Supprimer
                    </div>
                </div>
            )}

            {/* Contenu du dossier (si ouvert) */}
            {open && (
                <>
                    {/* Sous-dossiers (appel récursif avec depth + 1) */}
                    {node.children.length > 0 && (
                        <FolderTreeComponent
                            nodes={node.children}
                            onSelectFolder={onSelectFolder}
                            currentFolderId={currentFolderId}
                            onDeleteFolder={onDeleteFolder}
                            onSelectNote={onSelectNote}
                            selectedNoteId={selectedNoteId}
                            onUpdateFolder={onUpdateFolder}
                            onDeleteNote={onDeleteNote}
                            depth={depth + 1}
                        />
                    )}

                    {/* Notes du dossier */}
                    {node.notes && node.notes.length > 0 && (
                        <ul>
                            {node.notes.map((note: Note) => (
                                <li
                                    key={note.id}
                                    className={`note-item ${selectedNoteId === note.id ? "selected" : ""}`}
                                    style={{ paddingLeft: `${10 + (depth + 1) * 16}px` }}
                                    onClick={() => onSelectNote?.(note)}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();  // Empêche le menu du dossier
                                        setNoteContextMenu({ x: e.clientX, y: e.clientY, noteId: note.id! });
                                    }}
                                >
                                    {note.title}
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </li>
    );
}

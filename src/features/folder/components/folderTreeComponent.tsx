// Composant qui affiche une liste de dossiers (récursif)
import type {FolderNode} from "../../types/folderNode.ts";
import type Note from "../../types/note.ts";
import {FolderItem} from "./folderItem.tsx";

export function FolderTreeComponent({
    nodes,             // Liste des dossiers à afficher
    onSelectFolder,    // Callback : sélectionne un dossier
    currentFolderId,   // ID du dossier sélectionné
    onDeleteFolder,    // Callback : supprime un dossier
    onSelectNote,      // Callback : sélectionne une note
    selectedNoteId,    // ID de la note sélectionnée
    onUpdateFolder,    // Callback : renomme un dossier
    onDeleteNote       // Callback : supprime une note
}: {
    nodes: FolderNode[],
    currentFolderId: number | null,
    onSelectFolder: (id: number) => void,
    onDeleteFolder: (id: number) => void,
    onSelectNote?: (note: Note) => void,
    selectedNoteId?: number | null,
    onUpdateFolder?: (newTitle: string) => void,
    onDeleteNote?: (id: number) => void
}) {
    return (
        <ul>
            {/* Boucle sur chaque dossier */}
            {nodes.map(node => (
                <FolderItem
                    key={node.id}
                    node={node}
                    onSelectFolder={onSelectFolder}
                    currentFolderId={currentFolderId}
                    onDeleteFolder={onDeleteFolder}
                    onSelectNote={onSelectNote}
                    selectedNoteId={selectedNoteId}
                    onUpdateFolder={onUpdateFolder}
                    onDeleteNote={onDeleteNote}
                />
            ))}
        </ul>
    );
}

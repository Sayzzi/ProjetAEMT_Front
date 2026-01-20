import type {FolderNode} from "../../types/folderNode.ts";
import type Note from "../../types/note.ts";
import {FolderItem} from "./folderItem.tsx";

// Composant qui affiche une liste de dossiers (utilisé récursivement)
export function FolderTreeComponent({
    nodes,             // Liste des noeuds (dossiers) à afficher
    onSelectFolder,    // Callback quand on sélectionne un dossier
    currentFolderId,   // ID du dossier actuellement sélectionné
    onDeleteFolder,    // Callback pour supprimer un dossier
    onSelectNote,      // Callback quand on clique sur une note
    selectedNoteId     // ID de la note actuellement sélectionnée
}: {
    nodes: FolderNode[],
    currentFolderId: number | null,
    onSelectFolder: (id: number) => void,
    onDeleteFolder: (id: number) => void,
    onSelectNote?: (note: Note) => void,
    selectedNoteId?: number | null
}) {
    return (
        // Liste des dossiers
        <ul>
            {/* Boucle sur chaque dossier et crée un FolderItem */}
            {nodes.map(node => (
                <FolderItem
                    key={node.id}
                    node={node}
                    onSelectFolder={onSelectFolder}
                    currentFolderId={currentFolderId}
                    onDeleteFolder={onDeleteFolder}
                    onSelectNote={onSelectNote}
                    selectedNoteId={selectedNoteId}
                />
            ))}
        </ul>
    );
}

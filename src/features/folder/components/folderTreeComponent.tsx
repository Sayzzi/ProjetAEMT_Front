import type {FolderNode} from "../../types/folderNode.ts";
import type Note from "../../types/note.ts";
import {FolderItem} from "./folderItem.tsx";

// Recursive folder tree component
export function FolderTreeComponent({
    nodes,
    onSelectFolder,
    currentFolderId,
    onDeleteFolder,
    onSelectNote,
    selectedNoteId,
    onUpdateFolder,
    onDeleteNote,
    depth = 0
}: {
    nodes: FolderNode[],
    currentFolderId: number | null,
    onSelectFolder: (id: number | null) => void,
    onDeleteFolder: (id: number) => void,
    onSelectNote?: (note: Note | null) => void,
    selectedNoteId?: number | null,
    onUpdateFolder?: (folderId: number, newTitle: string) => void,
    onDeleteNote?: (id: number) => void,
    depth?: number
}) {
    return (
        <ul>
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
                    depth={depth}
                />
            ))}
        </ul>
    );
}

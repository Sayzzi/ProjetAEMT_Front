import type {FolderNode} from "../../types/folderNode.ts";
import {FolderItem} from "./folderItem.tsx";

export function FolderTreeComponent({nodes, onSelectFolder, currentFolderId,  onDeleteFolder}:
                                    {nodes: FolderNode[],
                                        currentFolderId : number | null,
                                        onSelectFolder: (id: number) => void
                                        onDeleteFolder: (id: number) => void
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
                />
            ))}
        </ul>
    );
}
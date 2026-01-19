import type {FolderNode} from "../../types/folderNode.ts";
import {FolderItem} from "./folderItem.tsx";

export function FolderTreeComponent({nodes, onSelectFolder}:
                                    {nodes: FolderNode[],onSelectFolder: (id: number) => void
}) {
    return (
        <ul>
            {nodes.map(node => (
                <FolderItem
                    key={node.id}
                    node={node}
                    onSelectFolder={onSelectFolder}
                />
            ))}
        </ul>
    );
}
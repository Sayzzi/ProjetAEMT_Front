import type {FolderNode} from "../../types/folderNode.ts";
import {FolderItem} from "./folderItem.tsx";

export function FolderTreeComponent({ nodes }: { nodes: FolderNode[] }) {
    return (
        <ul>
            {nodes.map(node => (
                <FolderItem key={node.id} node={node} />
            ))}
        </ul>
    );
}
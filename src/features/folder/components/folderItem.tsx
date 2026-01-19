import type {FolderNode} from "../../types/folderNode.ts";
import {useState} from "react";
import {FolderTreeComponent} from "./folderTreeComponent.tsx";

export function FolderItem({ node, onSelectFolder }: { node: FolderNode, onSelectFolder: (id: number) => void }) {
    const [open, setOpen] = useState(false);

    return (
        <li>
            <div
                onClick={() => {
                    setOpen(!open);
                    onSelectFolder(node.id); // met à jour le current folder
                }}
                style={{ cursor: "pointer" }}
            >
                {open ? "📂" : "📁"} {node.title}
            </div>

            {open && node.children.length > 0 && (
                <FolderTreeComponent
                    nodes={node.children}
                    onSelectFolder={onSelectFolder}
                />
            )}
        </li>
    );
}
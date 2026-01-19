import type {FolderNode} from "../../types/folderNode.ts";
import {useState} from "react";
import {FolderTreeComponent} from "./folderTreeComponent.tsx";


export function FolderItem({ node }: { node: FolderNode }) {
    const [open, setOpen] = useState(false);


    return (
        <li>
            <div onClick={() => setOpen(!open)} style={{ cursor: "pointer" }}>
                {open ? "📂" : "📁"} {node.title}
            </div>

            {open && node.children.length > 0 && ( //On vérifie la taille du folder
                <FolderTreeComponent nodes={node.children} />
            )}
        </li>
    );
}
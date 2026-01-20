import {useState, useEffect} from "react";
import {FolderTreeComponent} from "./folderTreeComponent.tsx";
import "./folderTreeComponent.css";

export function FolderItem({
                               node,
                               onSelectFolder,
                               currentFolderId,
                               onDeleteFolder
                           }) {
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(node.title);

    const [contextMenu, setContextMenu] = useState(null);

    const isSelected = currentFolderId === node.id;

    function handleRename() {
        if (editValue.trim() !== "" && editValue !== node.title) {
            node.title = editValue;
            // TODO : appeler updateFolder(node.id, { title: editValue })
        }
        setIsEditing(false);
    }

    function cancelRename() {
        setEditValue(node.title);
        setIsEditing(false);
    }

    // Fermer le menu si on clique ailleurs
    useEffect(() => {
        const close = () => setContextMenu(null);
        window.addEventListener("click", close);
        return () => window.removeEventListener("click", close);
    }, []);

    return (
        <li>
            {isEditing ? (
                <input
                    className="folder-input"
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleRename}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename();
                        if (e.key === "Escape") cancelRename();
                    }}
                />
            ) : (
                <div
                    className={`folder-item ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                        setOpen(!open);
                        onSelectFolder(node.id);
                    }}
                    onDoubleClick={() => setIsEditing(true)}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({ x: e.clientX, y: e.clientY });
                    }}
                >
                    {open ? "📂" : "📁"} {node.title}
                </div>
            )}

            {/* MENU CONTEXTUEL */}
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

            {open && node.children.length > 0 && (
                <FolderTreeComponent
                    nodes={node.children}
                    onSelectFolder={onSelectFolder}
                    currentFolderId={currentFolderId}
                    onDeleteFolder={onDeleteFolder}
                />
            )}
        </li>
    );
}

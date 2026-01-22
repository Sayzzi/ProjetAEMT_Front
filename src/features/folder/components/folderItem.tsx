import {useState, useEffect} from "react";
import {FolderTreeComponent} from "./folderTreeComponent.tsx";
import {NoteItem} from "./NoteItem.tsx";
import type Note from "../../types/note.ts";
import "./folderTreeComponent.css";

// Single folder item with recursive children
export function FolderItem({
    node,
    onSelectFolder,
    currentFolderId,
    onDeleteFolder,
    onSelectNote,
    selectedNoteId,
    onUpdateFolder,
    onDeleteNote,
    depth = 0
}) {
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [folderTitleValue, setFolderTitleValue] = useState(node.title);
    const [contextMenu, setContextMenu] = useState(null);
    const isSelected = currentFolderId === node.id;

    function handleRename() {
        if (folderTitleValue.trim() !== "" && folderTitleValue !== node.title) {
            setFolderTitleValue(folderTitleValue);
            onUpdateFolder(node.id, folderTitleValue);
        }
        setIsEditing(false);
    }

    function cancelRename() {
        setFolderTitleValue(node.title);
        setIsEditing(false);
    }

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
                <div
                    className={`folder-item ${isSelected ? "selected" : ""} ${open ? "open" : ""}`}
                    style={{ paddingLeft: `${10 + depth * 16}px` }}
                    onClick={() => {
                        setOpen(!open);
                        onSelectFolder(isSelected ? null : node.id);
                    }}
                    onDoubleClick={() => setIsEditing(true)}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({ x: e.clientX, y: e.clientY });
                    }}
                >
                    {node.title}
                </div>
            )}

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

            {open && (
                <>
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

                    {node.notes && node.notes.length > 0 && (
                        <ul>
                            {node.notes.map((note: Note) => (
                                <NoteItem
                                    key={note.id}
                                    note={note}
                                    isSelected={selectedNoteId === note.id}
                                    onSelect={(n) => onSelectNote?.(n)}
                                    onDelete={(id) => onDeleteNote?.(id)}
                                    depth={depth + 1}
                                />
                            ))}
                        </ul>
                    )}
                </>
            )}
        </li>
    );
}

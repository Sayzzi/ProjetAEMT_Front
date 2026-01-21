// Composant qui affiche UNE note avec son menu contextuel
import {useState, useEffect} from "react";
import type Note from "../../types/note.ts";

interface NoteItemProps {
    note: Note;
    isSelected: boolean;
    onSelect: (note: Note) => void;
    onDelete: (id: number) => void;
    depth?: number;
}

export function NoteItem({ note, isSelected, onSelect, onDelete, depth = 0 }: NoteItemProps) {
    const [contextMenu, setContextMenu] = useState<{x: number, y: number} | null>(null);

    // Ferme le menu contextuel au clic ailleurs
    useEffect(() => {
        const close = () => setContextMenu(null);
        window.addEventListener("click", close);
        return () => window.removeEventListener("click", close);
    }, []);

    return (
        <>
            <li
                className={`note-item ${isSelected ? "selected" : ""}`}
                style={{ paddingLeft: `${10 + depth * 16}px` }}
                onClick={() => onSelect(note)}
                onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setContextMenu({ x: e.clientX, y: e.clientY });
                }}
            >
                {note.title || 'Sans titre'}
            </li>

            {contextMenu && (
                <div
                    className="context-menu"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <div
                        className="context-menu-item"
                        onClick={() => {
                            onDelete(note.id!);
                            setContextMenu(null);
                        }}
                    >
                        Supprimer
                    </div>
                </div>
            )}
        </>
    );
}

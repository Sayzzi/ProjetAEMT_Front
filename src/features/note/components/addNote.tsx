import React, {useState} from "react";
import type Note from "../../types/note.ts";
import {addNote} from "../service/fakeNoteService.tsx";

interface AddNoteProps {
    userId: number;
    folderId: number;
    onNoteAdded?: () => void;
}


export default function AddNote({userId, folderId}: AddNoteProps) {

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const handleSubmit = (e: React.FormEvent) => {

        //évite le comportement par défaut de la page
        e.preventDefault();

        if (!title.trim()) return;

        try {
            const newNote: Note = {
                id: Date.now(), // Génère un ID temporaire
                id_user: userId,
                id_folder: folderId,
                title: title.trim(),
                content: content.trim(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                size_bytes: content.length,
                line_count: content.split("\n").length,
                word_count: content.split(/\s+/).filter(w => w).length,
                char_count: content.length,
            };

            addNote(newNote);

            // Réinitialise le formulaire
            setTitle("");
            setContent("");


        } catch (err) {
            console.error(err);
        }
    };

    // ← Ajoute le return ici
    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Titre"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
                placeholder="Contenu"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
            />
            <button type="submit">Ajouter</button>
        </form>
    );


}

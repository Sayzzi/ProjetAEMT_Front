

//Méthode pour avoir le temps actuel
import type Note from "../../types/note.ts";

const nowISO = (): string => new Date().toISOString();


const notes: Note[] = [
    {
        id: 1,
        id_user: 10,
        id_folder: 100,
        title: "Première note",
        content: "Hello world\nDeuxième ligne",
        created_at: nowISO(),
        updated_at: nowISO(),
        size_bytes: 26,
        line_count: 2,
        word_count: 4,
        char_count: 26,
    },
    {
        id: 2,
        id_user: 10,
        id_folder: 101,
        title: "Checklist",
        content: "- item 1\n- item 2",
        created_at: nowISO(),
        updated_at: nowISO(),
        size_bytes: 18,
        line_count: 2,
        word_count: 4,
        char_count: 18,
    },
];

export const addNote = (newNote: Note): void => {
    notes.push(newNote);
};



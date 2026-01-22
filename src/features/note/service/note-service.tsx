import type Note from "../../types/note";
import type { NoteCreateCommand } from "../../types/commands/note-create-command";
import type {NoteUpdateCommand} from "../../types/commands/noteUpdateCommand.ts";
import {api} from "../../auth/services/api.ts";

export class NoteService {

    async createNote(command: NoteCreateCommand): Promise<Note> {
        const response = await api.post("/notes", command);
        if (!response.ok) {
            throw new Error("Erreur lors de la création de la note");
        }
        return response.json();
    }

    async updateNote(command: NoteUpdateCommand): Promise<void> {
        const response = await api.put("/notes", command);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur ${response.status}: ${errorText}`);
        }
    }

    async deleteNote(noteId: number): Promise<void> {
        const response = await api.delete(`/notes/${noteId}`);
        if (!response.ok) {
            throw new Error("Erreur lors de la suppression de la note");
        }
    }
}

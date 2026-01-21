// Service pour communiquer avec l'API /notes
import type Note from "../../types/note";
import type { NoteCreateCommand } from "../../types/commands/note-create-command";
import type {NoteUpdateCommand} from "../../types/commands/noteUpdateCommand.ts";
import {api} from "../../auth/services/api.ts";  // Fetch avec JWT auto

export class NoteService {

    // POST /notes - Crée une nouvelle note
    async createNote(command: NoteCreateCommand): Promise<Note> {
        const response = await api.post("/notes", command);
        if (!response.ok) {
            throw new Error("Erreur lors de la création de la note");
        }
        return response.json();
    }

    // PUT /notes - Modifie une note existante
    async updateNote(command: NoteUpdateCommand): Promise<void> {
        console.log("📝 Sauvegarde note:", command);  // Debug
        const response = await api.put("/notes", command);
        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Erreur API:", response.status, errorText);
            throw new Error(`Erreur ${response.status}: ${errorText}`);
        }
        console.log("✅ Note sauvegardée avec succès");
    }

    // DELETE /notes/:id - Supprime une note
    async deleteNote(noteId: number): Promise<void> {
        const response = await api.delete(`/notes/${noteId}`);
        if (!response.ok) {
            throw new Error("Erreur lors de la suppression de la note");
        }
    }
}

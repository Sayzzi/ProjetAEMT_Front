import type Note from "../../types/note";
import type { NoteCreateCommand } from "../../types/commands/note-create-command";
import type {NoteUpdateCommand} from "../../types/commands/noteUpdateCommand.ts";

export class NoteService {

    private readonly NOTE_API_URL = import.meta.env.VITE_API_URL + "/notes";

    // POST /notes - Création d'une note
    async createNote(command: NoteCreateCommand): Promise<Note> {
        const response = await fetch(this.NOTE_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(command),
        });

        if (!response.ok) {
            throw new Error("Erreur lors de la création de la note");
        }

        return response.json();
    }

    //PUT /notes - Modification d'une note
    async updateNote(command : NoteUpdateCommand) : Promise<void> {
        const response = await fetch(this.NOTE_API_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(command),
        })
        if (!response.ok) {
            throw new Error("Erreur lors de la modification de la note");
        }
    }
}
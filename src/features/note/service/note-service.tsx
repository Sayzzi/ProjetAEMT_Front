import type Note from "../../types/note.ts";
import type {NoteCreateCommand} from "../../types/commands/note-create-command.ts";

const API_URL = import.meta.env.VITE_API_URL + "/notes";

export const postNote: (note: NoteCreateCommand) => Promise<Note> = async (note: NoteCreateCommand) => {

    //Créer une note !
    const response = await fetch(API_URL, {

        method: 'POST',
        headers: {

            'Content-Type': 'application/json',

        },
        body: JSON.stringify(note)
    });

    return response.json();


}

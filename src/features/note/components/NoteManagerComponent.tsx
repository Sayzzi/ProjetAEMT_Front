import type Note from "../../types/note.ts";
import {postNote} from "../service/note-service.tsx";
import {NoteFormComponent} from "./NoteFormComponent.tsx";

export default function NoteManagerComponent() {

    //Permet de créer de la note
    const onNoteCreated : (note : Note) => void  = note => {
        const sendNote = async (note : Note) => {
            const noteCreated = await postNote({
                idUser: note.idUser,
                idFolder: note.idFolder,
                title: note.title,
                content: note.content
            });
        }
        sendNote(note);
    }


    return <>
        <NoteFormComponent
            onNoteCreated={onNoteCreated}
        />
    </>


}
import type Note from "../../types/note.ts";
import {type FormEvent, useEffect, useState} from "react";

interface NoteFormComponentProps {
    onNoteCreated: (t: Note) => void
}

export function NoteFormComponent({onNoteCreated}: NoteFormComponentProps) {

    const [inputs, setInputs] = useState({idUser : 1, idFolder : 1, title: "", content: ""});
    const [formValid, setFormValid] = useState(false);

    useEffect(() => {
        checkFormValidity();
    }, [inputs]);

    function checkFormValidity() {
        setFormValid(!!inputs.title);
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const {name, value} = e.target;
        setInputs(values => ({...values, [name]: value}));
    }

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        console.log(inputs);
        e.preventDefault();
        if (!formValid) return ;
        let note = {idUser : inputs.idUser, idFolder : inputs.idFolder,
            title : inputs.title, content:  inputs.content};
        onNoteCreated(note);

        alert("Note ajouté");

        const form = e.target as HTMLFormElement;
        form.reset();
        setFormValid(false);
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                name="title"
                placeholder="Titre de la note"
                value={inputs.title}
                onChange={handleChange}
                required
            />

            <textarea
                name="content"
                placeholder="Contenu de la note"
                value={inputs.content}
                onChange={handleChange}
                required
            />

            <button type="submit" disabled={!formValid}>
                Créer la note
            </button>
        </form>
    );


}
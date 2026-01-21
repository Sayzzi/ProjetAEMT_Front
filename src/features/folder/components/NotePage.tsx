import {useState} from "react";
import MarkdownEditor from "../components/MarkdownEditor";
import ExportPdfButton from "./exportPdfButton.tsx";


export default function NotePage() {

    const noteId = 1;


    const [content, setContent] = useState("");
    const [isSaved, setIsSaved] = useState(true);

    return (
        <div className="note-page">

            {/* BARRE D’ACTIONS */}
            <div className="note-toolbar">
                <ExportPdfButton
                    noteId={noteId}
                    disabled={!isSaved}
                />
            </div>

            {/* EDITEUR */}
            <MarkdownEditor
                content={content}
                onChange={(html) => {
                    setContent(html);
                    setIsSaved(false);
                }}
            />
        </div>
    );
}

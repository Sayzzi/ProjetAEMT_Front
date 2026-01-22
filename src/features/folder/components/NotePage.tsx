import {useState} from "react";
import MarkdownEditor from "../components/MarkdownEditor";
import ExportPdfButton from "./exportPdfButton.tsx";


export default function NotePage() {

    const noteId = 1;


    const [content, setContent] = useState("");
    const [isSaved, setIsSaved] = useState(true);

    return (
        <div className="note-page">

            {/* Action bar */}
            <div className="note-toolbar">
                <ExportPdfButton
                    noteId={noteId}
                    disabled={!isSaved}
                />
            </div>

            {/* Editor */}
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

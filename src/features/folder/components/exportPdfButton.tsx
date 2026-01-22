import {useState} from "react";
import ExportNoteService from "../services/export-note-service.tsx";

interface Props {
    noteId: number;
    disabled?: boolean;
}

export default function ExportPdfButton({noteId, disabled}: Props) {
    const {exportNoteToPdf} = ExportNoteService();
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        if (loading) return;

        try {
            setLoading(true);
            await exportNoteToPdf(noteId);
        } catch (e) {
            alert("Erreur lors de l'export PDF");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button onClick={handleExport} disabled={disabled || loading}>
            {loading ? "⏳ Export..." : "📄 Exporter en PDF"}
        </button>
    );
}

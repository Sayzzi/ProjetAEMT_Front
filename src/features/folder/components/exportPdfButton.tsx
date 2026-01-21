// Bouton pour exporter une note en PDF
import {useState} from "react";
import ExportNoteService from "../services/export-note-service.tsx";

interface Props {
    noteId: number;      // ID de la note à exporter
    disabled?: boolean;  // Désactivé pendant la sauvegarde
}

export default function ExportPdfButton({noteId, disabled}: Props) {
    const {exportNoteToPdf} = ExportNoteService();
    const [loading, setLoading] = useState(false);  // true = export en cours

    // Lance l'export PDF
    const handleExport = async () => {
        if (loading) return;  // Évite le double-clic

        try {
            setLoading(true);
            await exportNoteToPdf(noteId);  // Télécharge le PDF
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

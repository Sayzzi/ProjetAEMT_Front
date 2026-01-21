// Bouton pour exporter un dossier en ZIP
import {useState} from "react";
import ExportZipService from "../services/export-zip-service.tsx";

interface Props {
    folderId: number;    // ID du dossier à exporter
    disabled?: boolean;  // Désactivé si aucun dossier sélectionné
}

export default function ExportZipButton({folderId, disabled}: Props) {
    const {exportFolderToZip} = ExportZipService();
    const [loading, setLoading] = useState(false);  // true = export en cours

    // Lance l'export ZIP
    const handleExport = async () => {
        if (loading || !folderId) return;  // Évite le double-clic

        try {
            setLoading(true);
            await exportFolderToZip(folderId);  // Télécharge le ZIP
        } catch (e) {
            alert("Erreur lors de l'export ZIP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button onClick={handleExport} disabled={disabled || loading || !folderId}>
            {loading ? "⏳ Export..." : "📦 Exporter en ZIP"}
        </button>
    );
}

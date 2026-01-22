import {useState} from "react";
import ExportZipService from "../services/export-zip-service.tsx";

interface Props {
    folderId: number;
    disabled?: boolean;
}

export default function ExportZipButton({folderId, disabled}: Props) {
    const {exportFolderToZip} = ExportZipService();
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        if (loading || !folderId) return;

        try {
            setLoading(true);
            await exportFolderToZip(folderId);
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

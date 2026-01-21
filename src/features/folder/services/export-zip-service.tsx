// Service pour exporter un dossier en ZIP
import {fetchWithAuth} from "../../auth/services/api.ts";

export default function ExportZipService() {

    // GET /folders/:id/export-zip - Télécharge le ZIP du dossier
    const exportFolderToZip = async (folderId: number): Promise<void> => {

        const response = await fetchWithAuth(
            `/folders/${folderId}/export-zip`,
            {
                method: "GET",
                headers: {
                    Accept: "application/octet-stream",
                },
            }
        );

        if (!response.ok) {
            throw new Error("Erreur lors de l'export ZIP");
        }

        // Récupère le blob (fichier binaire)
        const blob = await response.blob();

        // Nom du fichier depuis le header si possible
        const contentDisposition = response.headers.get("content-disposition");
        let filename = `folder_${folderId}.zip`;

        if (contentDisposition) {
            const match = contentDisposition.match(/filename=([^;]+)/);
            if (match?.[1]) {
                filename = match[1].replace(/"/g, "");
            }
        }

        // Crée un lien invisible et déclenche le téléchargement
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();

        // Nettoie
        link.remove();
        window.URL.revokeObjectURL(url);
    };

    return {
        exportFolderToZip,
    };
}

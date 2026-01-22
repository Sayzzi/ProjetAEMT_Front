// Service to export a folder as ZIP
import { fetchWithAuth } from "../../auth/services/api.ts";

export default function ExportZipService() {

    // GET /folders/:id/export-zip - Download the folder ZIP
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
            throw new Error("Error during ZIP export");
        }

        // Retrieve the blob (binary file)
        const blob = await response.blob();

        // Get the filename from the header if possible
        const contentDisposition = response.headers.get("content-disposition");
        let filename = `folder_${folderId}.zip`;

        if (contentDisposition) {
            const match = contentDisposition.match(/filename=([^;]+)/);
            if (match?.[1]) {
                filename = match[1].replace(/"/g, "");
            }
        }

        // Create an invisible link and trigger the download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();

        // Clean up
        link.remove();
        window.URL.revokeObjectURL(url);
    };

    return {
        exportFolderToZip,
    };
}

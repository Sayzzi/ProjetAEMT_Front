// Service to export a note as PDF
import { fetchWithAuth } from "../../auth/services/api.ts";

export default function ExportNoteService() {

    // GET /notes/:id/export-pdf - Download the PDF
    const exportNoteToPdf = async (noteId: number): Promise<void> => {

        const response = await fetchWithAuth(
            `/notes/${noteId}/export-pdf`,
            {
                method: "GET",
                headers: {
                    Accept: "application/pdf",
                },
            }
        );

        if (!response.ok) {
            throw new Error("Error during PDF export");
        }

        // Retrieve the blob (binary file)
        const blob = await response.blob();

        // Get the filename from the header if possible
        const contentDisposition = response.headers.get("content-disposition");
        let filename = `note_${noteId}.pdf`;

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
        exportNoteToPdf,
    };
}

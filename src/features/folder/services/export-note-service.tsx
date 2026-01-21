const API_URL = import.meta.env.VITE_API_URL + "/notes";


export default function ExportNoteService() {


    const exportNoteToPdf = async (noteId: number): Promise<void> => {

        const response = await fetch(
            `${API_URL}/${noteId}/export-pdf`,
            {
                method: "GET",
                headers: {
                    Accept: "application/pdf",
                },
            }
        );

        if (!response.ok) {
            throw new Error("Erreur lors de l’export PDF");
        }

        const blob = await response.blob();

        // nom du fichier depuis le header si possible
        const contentDisposition = response.headers.get("content-disposition");
        let filename = `note_${noteId}.pdf`;

        if (contentDisposition) {
            const match = contentDisposition.match(/filename=([^;]+)/);
            if (match?.[1]) {
                filename = match[1].replace(/"/g, "");
            }
        }

        // téléchargement
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = filename;

        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);
    };

    return {
        exportNoteToPdf,
    };


}
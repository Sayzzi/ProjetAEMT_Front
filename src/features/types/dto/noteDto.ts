// DTO d'une note reçu du backend (GET /folders/all/:userId)
export interface NoteDto {
    id: number;
    id_user: number;
    id_folder: number;
    title: string;
    content: string;
    createdAt?: string;    // Date de création
    updatedAt?: string;    // Date de dernière modif
    lineCount?: number;    // Stats calculées par le backend
    wordCount?: number;
    charCount?: number;
}

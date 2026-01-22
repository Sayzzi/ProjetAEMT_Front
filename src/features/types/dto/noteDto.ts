
export interface NoteDto {
    id: number;
    id_user: number;
    id_folder: number;
    title: string;
    content: string;
    createdAt?: string;
    updatedAt?: string;
    lineCount?: number;
    wordCount?: number;
    charCount?: number;
}

// Type of a note (corresponds to the backend entity)
export default interface Note {
    id?: number,             // Unique ID
    id_user: number,         // Owner's ID
    id_folder: number,       // Parent folder ID
    title?: string | null,   // Note title
    content?: string | null, // HTML content (TipTap)
    createdAt?: string,      // Creation date (ISO string)
    updatedAt?: string,      // Last modification date
    sizeBytes?: number,      // Size in bytes
    lineCount?: number,      // Number of lines
    wordCount?: number,      // Number of words
    charCount?: number       // Number of characters
}

// Type d'une note (correspond à l'entité backend)
export default interface Note {
    id?: number,           // ID unique
    id_user: number,       // ID du propriétaire
    id_folder: number,     // ID du dossier parent
    title?: string | null, // Titre de la note
    content?: string | null, // Contenu HTML (TipTap)
    createdAt?: string,    // Date de création (ISO string)
    updatedAt?: string,    // Date de dernière modif
    sizeBytes?: number,    // Taille en octets
    lineCount?: number,    // Nombre de lignes
    wordCount?: number,    // Nombre de mots
    charCount?: number     // Nombre de caractères
}

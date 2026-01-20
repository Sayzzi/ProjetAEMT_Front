import type {FolderNode} from "../../types/folderNode.ts";
import type {FolderDto} from "../../types/dto/folderDto.ts";
import type {NoteDto} from "../../types/dto/noteDto.ts";

// Transforme une liste plate de dossiers et notes en arbre hiérarchique
export function buildFolderTree(folders: FolderDto[], notes: NoteDto[] = []): FolderNode[] {
    // Map pour accéder rapidement à un dossier par son ID
    const folderMap = new Map<number, FolderNode>();

    // Étape 1 : Convertir chaque folder en FolderNode (avec children et notes vides)
    folders.forEach(f => {
        folderMap.set(
            f.id,
            { ...f, children: [], notes: [] }
        );
    });

    // Étape 2 : Ajouter les notes à leurs dossiers respectifs
    notes.forEach(note => {
        const folder = folderMap.get(note.id_folder);
        if (folder) folder.notes.push(note);
    });

    // Étape 3 : Construire la hiérarchie parent/enfant
    const roots: FolderNode[] = []; // Dossiers racines (sans parent)

    folderMap.forEach(node => {
        if (node.id_parent_folder === null) {
            // Pas de parent = dossier racine
            roots.push(node);
        } else {
            // A un parent = on l'ajoute comme enfant du parent
            const parent = folderMap.get(node.id_parent_folder);
            if (parent) parent.children.push(node);
        }
    });

    return roots;
}

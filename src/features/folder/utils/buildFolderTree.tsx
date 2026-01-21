import type {FolderNode} from "../../types/folderNode.ts";
import type {FolderDto} from "../../types/dto/folderDto.ts";
import type {NoteDto} from "../../types/dto/noteDto.ts";
import type Note from "../../types/note.ts";

// Résultat du build : arbre + notes orphelines (dans le dossier racine invisible)
export interface BuildTreeResult {
    tree: FolderNode[];
    rootNotes: Note[];  // Notes dans le dossier racine
    rootFolderId: number | null;
}

// Transforme une liste plate de dossiers et notes en arbre hiérarchique
// Le dossier racine (invisible) n'est pas affiché, seuls ses enfants le sont
export function buildFolderTree(folders: FolderDto[], notes: NoteDto[] = []): BuildTreeResult {
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
    let rootFolder: FolderNode | null = null;

    folderMap.forEach(node => {
        if (node.id_parent_folder === null) {
            // Dossier racine invisible
            rootFolder = node;
        } else {
            // A un parent = on l'ajoute comme enfant du parent
            const parent = folderMap.get(node.id_parent_folder);
            if (parent) parent.children.push(node);
        }
    });

    // Retourne les enfants du dossier racine + les notes du dossier racine
    if (rootFolder) {
        return {
            tree: rootFolder.children,
            rootNotes: rootFolder.notes,
            rootFolderId: rootFolder.id
        };
    }

    return { tree: [], rootNotes: [], rootFolderId: null };
}

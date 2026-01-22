import type {FolderNode} from "../../types/folderNode.ts";
import type {FolderDto} from "../../types/dto/folderDto.ts";
import type {NoteDto} from "../../types/dto/noteDto.ts";
import type Note from "../../types/note.ts";

export interface BuildTreeResult {
    tree: FolderNode[];
    rootNotes: Note[];
    rootFolderId: number | null;
}

// Transforms flat folder/note lists into a hierarchical tree
export function buildFolderTree(folders: FolderDto[], notes: NoteDto[] = []): BuildTreeResult {
    const folderMap = new Map<number, FolderNode>();

    folders.forEach(f => {
        folderMap.set(f.id, { ...f, children: [], notes: [] });
    });

    notes.forEach(note => {
        const folder = folderMap.get(note.id_folder);
        if (folder) folder.notes.push(note);
    });

    let rootFolder: FolderNode | null = null;

    folderMap.forEach(node => {
        if (node.id_parent_folder === null) {
            rootFolder = node;
        } else {
            const parent = folderMap.get(node.id_parent_folder);
            if (parent) parent.children.push(node);
        }
    });

    if (rootFolder) {
        return {
            tree: rootFolder.children,
            rootNotes: rootFolder.notes,
            rootFolderId: rootFolder.id
        };
    }

    return { tree: [], rootNotes: [], rootFolderId: null };
}

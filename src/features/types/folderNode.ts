import type {Folder} from "./folder.ts";
import type Note from "./note.ts";

export interface FolderNode extends Folder {
    children: FolderNode[];
    notes: Note[];
}
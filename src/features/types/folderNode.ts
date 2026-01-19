import type {Folder} from "./folder.ts";

export interface FolderNode extends Folder {
    children: FolderNode[];
}
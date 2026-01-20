import type Note from "./note.ts";
import type {FolderDto} from "./dto/folderDto.ts";

export interface FolderNode extends FolderDto {
    children: FolderNode[];
    notes: Note[];
}
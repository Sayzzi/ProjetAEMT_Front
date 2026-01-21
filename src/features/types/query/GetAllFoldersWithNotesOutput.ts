import type {FolderDto} from "../dto/folderDto.ts";
import type {NoteDto} from "../dto/noteDto.ts";

export interface GetAllFoldersWithNotesOutput {
    folders: FolderDto[];
    notes: NoteDto[];
}
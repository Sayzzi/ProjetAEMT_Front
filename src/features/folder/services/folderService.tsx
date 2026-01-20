import type {CreateFolderCommand} from "./commands/createFolderCommand.ts";
import type {Folder} from "../../types/folder.ts";
import type {NoteDto} from "../../types/dto/noteDto.ts";
import type {FolderDto} from "../../types/dto/folderDto.ts";

export class FolderService {

    private readonly FOLDER_API_URL = import.meta.env.VITE_API_URL + "/folders";

    // POST /folders - Ajout d'un folder
    async createFolder(command: CreateFolderCommand): Promise<Folder> {
        const response = await fetch(this.FOLDER_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(command),
        });

        if (!response.ok) {
            throw new Error("Erreur lors de la création du dossier");
        }
        return response.json();
    }



    // GET /folders/id - Recuperation de tous les folders  et les notes d'un user
    async getAllFoldersAndNotesByUser(userId: number): Promise<{ folders: FolderDto[], notes: NoteDto[] }> {
        const response = await fetch(`${this.FOLDER_API_URL}/all/${userId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des dossiers et notes");
        }

        return response.json(); // contient { folders: [...], notes: [...] } separés
    }
}
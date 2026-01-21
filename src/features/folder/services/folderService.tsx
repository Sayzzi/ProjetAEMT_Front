import type {CreateFolderCommand} from "./commands/createFolderCommand.ts";
import type {Folder} from "../../types/folder.ts";
import type {NoteDto} from "../../types/dto/noteDto.ts";
import type {FolderDto} from "../../types/dto/folderDto.ts";
import type {UpdateFolderCommand} from "../../types/commands/updateFolderCommand.ts";
import {api} from "../../auth/services/api.ts";

export class FolderService {

    // POST /folders - Ajout d'un folder
    async createFolder(command: CreateFolderCommand): Promise<Folder> {
        const response = await api.post("/folders", command);
        if (!response.ok) {
            throw new Error("Erreur lors de la création du dossier");
        }
        return response.json();
    }

    // GET /folders/all/:id - Récupère tous les folders et notes d'un user
    async getAllFoldersAndNotesByUser(userId: number): Promise<{ folders: FolderDto[], notes: NoteDto[] }> {
        const response = await api.get(`/folders/all/${userId}`);
        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des dossiers et notes");
        }
        return response.json();
    }

    // DELETE /folders/:id - Suppression d'un dossier
    async deleteFolder(folderId: number): Promise<boolean> {
        const response = await api.delete(`/folders/${folderId}`);
        if (!response.ok) {
            throw new Error("Erreur lors du delete d'un folder");
        }
        return true;
    }

    // PUT /folders - Modification d'un dossier
    async updateFolder(command: UpdateFolderCommand): Promise<void> {
        const response = await api.put("/folders", command);
        if (!response.ok) {
            throw new Error("Erreur lors de la modification du dossier");
        }
    }
}

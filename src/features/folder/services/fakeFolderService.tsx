import type {Folder} from "../../types/folder.ts";


export class FakeFolderService {
    private folders: Folder[] = [
        {
            id: 1,
            id_user: 1,
            id_parent_folder: null,
            title: "Les dossiers de Roddy",
            created_at: new Date().toISOString(),
        },
        {
            id: 2,
            id_user: 1,
            id_parent_folder: 1,
            title: "Projets",
            created_at: new Date().toISOString(),
        }
    ];

    private autoIncrementId = 3;

    // Récupère tous les dossiers d’un utilisateur
    getFoldersByUser(id_user: number): Folder[] {
        const result: Folder[] = [];
        for (const f of this.folders) {
            if (f.id_user === id_user) {
                result.push(f);
            }
        }
        return result;
    }

    // Récupère les sous-dossiers d’un dossier
    getChildren(parentId: number | null): Folder[] {
        const result: Folder[] = [];
        for (const f of this.folders) {
            if (f.id_parent_folder === parentId) {
                result.push(f);
            }
        }
        return result;
    }

    // Crée un nouveau dossier
    createFolder(data: Omit<Folder, "id" | "created_at">): Folder {
        const newFolder: Folder = {
            id: this.autoIncrementId++,
            created_at: new Date().toISOString(),
            ...data,
        };

        this.folders.push(newFolder);
        return newFolder;
    }

    // Met à jour un dossier
    updateFolder(id: number, updates: Partial<Folder>): Folder | null {
        for (let i = 0; i < this.folders.length; i++) {
            if (this.folders[i].id === id) {
                this.folders[i] = {
                    ...this.folders[i],
                    ...updates,
                };
                return this.folders[i];
            }
        }
        return null;
    }

    // Supprime un dossier
    deleteFolder(id: number): boolean {
        const newList: Folder[] = [];
        let deleted = false;

        for (const f of this.folders) {
            if (f.id !== id) {
                newList.push(f);
            } else {
                deleted = true;
            }
        }

        this.folders = newList;
        return deleted;
    }
}
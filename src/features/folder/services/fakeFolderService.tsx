import type {Folder} from "../../types/folder.ts";
import type Note from "../../types/note.ts";


export class FakeFolderService {
    private notes: Note[] = [
        { id: 1, id_user: 1, id_folder: 1, title: "Ma première note", content: "<h1>Bienvenue</h1><p>Ceci est une note avec du <strong>texte en gras</strong> et en <em>italique</em>.</p><h2>Fonctionnalités</h2><ul><li>Tape <strong>**texte**</strong> pour du gras</li><li>Tape <em>*texte*</em> pour de l'italique</li><li>Tape # au début pour un titre</li></ul>" },
        { id: 2, id_user: 1, id_folder: 1, title: "Idées projet", content: "<h2>Idées</h2><ul><li>Créer une app de notes</li><li>Ajouter le thème <strong>Halloween</strong></li><li>Intégrer le backend</li></ul>" },
        { id: 3, id_user: 1, id_folder: 2, title: "Todo list", content: "<h2>À faire</h2><ol><li>Finir le frontend</li><li>Tester l'application</li><li>Déployer</li></ol>" },
    ];

    private folders: Folder[] = [
        {
            id: 1,
            id_user: 1,
            id_parent_folder: null,
            title: "Les dossiers de abdel",
            created_at: new Date().toISOString(),
        },
        {
            id: 2,
            id_user: 1,
            id_parent_folder: null,
            title: "Projets",
            created_at: new Date().toISOString(),
        },
        {
            id: 3,
            id_user: 1,
            id_parent_folder: 2,
            title: "Projets test",
            created_at: new Date().toISOString(),
        },
    ];

    private autoIncrementId = 4;
    private noteAutoIncrementId = 4;

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

    // Récupère les notes d'un dossier
    getNotesByFolder(id_folder: number): Note[] {
        return this.notes.filter(n => n.id_folder === id_folder);
    }

    // Récupère toutes les notes d'un utilisateur
    getNotesByUser(id_user: number): Note[] {
        return this.notes.filter(n => n.id_user === id_user);
    }

    // Crée une nouvelle note
    createNote(data: { id_user: number, id_folder: number, title: string }): Note {
        const newNote: Note = {
            id: this.noteAutoIncrementId++,
            id_user: data.id_user,
            id_folder: data.id_folder,
            title: data.title,
            content: "",
            created_at: new Date().toISOString()
        };
        this.notes.push(newNote);
        return newNote;
    }

    // Met à jour une note
    updateNote(id: number, updates: Partial<Note>): Note | null {
        const index = this.notes.findIndex(n => n.id === id);
        if (index !== -1) {
            this.notes[index] = { ...this.notes[index], ...updates };
            return this.notes[index];
        }
        return null;
    }
}
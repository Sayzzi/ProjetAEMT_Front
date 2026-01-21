export interface NoteCreateCommand {
    idUser: number;
    idFolder: number | null;
    title: string;
    content: string;
}
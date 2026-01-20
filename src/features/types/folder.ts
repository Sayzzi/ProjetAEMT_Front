export interface Folder {
    id: number;
    id_user: number;
    id_parent_folder: number | null;
    title: string;
    created_at: string;
}

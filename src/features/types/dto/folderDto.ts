export interface FolderDto {
    id: number;
    userId: number;
    id_parent_folder: number | null;
    title: string;
}
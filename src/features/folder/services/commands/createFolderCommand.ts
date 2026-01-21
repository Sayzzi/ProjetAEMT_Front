export interface CreateFolderCommand {
    userId: number;
    title: string;
    parentFolderId: number | null;
}
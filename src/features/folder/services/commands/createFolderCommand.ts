export interface CreateFolderCommand {
    userId : number | null;
    title : string;
    parentFolderId : number;
}
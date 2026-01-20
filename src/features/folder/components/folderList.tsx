import {FakeFolderService} from "../services/fakeFolderService.tsx";
import {useEffect, useState} from "react";
import type {FolderNode} from "../../types/folderNode.ts";
import {buildFolderTree} from "../utils/buildFolderTree.tsx";
import {FolderTreeComponent} from "./folderTreeComponent.tsx";
import {FolderHeader} from "./folderHeader.tsx";

const folderService = new FakeFolderService();

export function FolderList() {
    const [tree, setTree] = useState<FolderNode[]>([]);
    const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);

    useEffect(() => {
        const folders = folderService.getFoldersByUser(1);
        const folderTree = buildFolderTree(folders);
        setTree(folderTree);
    }, []);

    function refreshTree() {
        const flat = folderService.getFoldersByUser(1);
        const structured = buildFolderTree(flat);
        setTree(structured);
    }

    function handleCreateFolder(data) {
        folderService.createFolder(data);
        refreshTree();
    }

    function handleDeleteFolder(id: number) {
        folderService.deleteFolder(id);   // suppression récursive
        refreshTree();                    // reconstruit l’arbre
    }

    return (
        <div>
            <h2>Mes dossiers</h2>

            <FolderHeader
                onCreateFolder={handleCreateFolder}
                currentFolderId={currentFolderId}
            />

            <FolderTreeComponent
                nodes={tree}
                onSelectFolder={setCurrentFolderId}
                currentFolderId={currentFolderId}
                onDeleteFolder={handleDeleteFolder}
            />
        </div>
    );
}
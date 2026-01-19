import {FakeFolderService} from "../services/fakeFolderService.tsx";
import {useEffect, useState} from "react";
import type {FolderNode} from "../../types/folderNode.ts";
import {buildFolderTree} from "../utils/buildFolderTree.tsx";
import {FolderTreeComponent} from "./folderTreeComponent.tsx";
import {FolderHeader} from "./folderHeader.tsx";


const service = new FakeFolderService();

export function FolderList() {
    const [tree, setTree] = useState<FolderNode[]>([]);

    useEffect(() => {
        const folders = service.getFoldersByUser(1);
        const folderTree = buildFolderTree(folders);
        setTree(folderTree);
    }, []);

    return (
        <div>
            <h2>Mes dossiers</h2>
            <FolderHeader></FolderHeader>
    <FolderTreeComponent nodes={tree} />
    </div>
);
}
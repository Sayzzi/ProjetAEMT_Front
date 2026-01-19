import type {Folder} from "../../types/folder.ts";
import type {FolderNode} from "../../types/folderNode.ts";

export function buildFolderTree(folders: Folder[]): FolderNode[] {
    const folderMap = new Map<number, FolderNode>();

    //Convertir chaque folder en folderNode car chaque folder peut avoir des sous-folders
    folders.forEach(f => {
        folderMap.set(
            f.id,
            { ...f, children: [] }
        );
    });

    const roots: FolderNode[] = []; //Création des tableaux pour les dossiers qui n'ont pas de parent(racine)

    folderMap.forEach(node => {
        if (node.id_parent_folder === null) {//On verifie si l'élement n'a pas de parent
            roots.push(node);
        } else {
            const parent = folderMap.get(node.id_parent_folder);//on recupère le parent avec map.get grace à id_parent
            if (parent) parent.children.push(node);//On l'ajoute dans le children du bon parent
        }
    });

    return roots;
}
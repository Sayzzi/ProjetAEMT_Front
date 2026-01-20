// ==============================================
// IMPORTS
// ==============================================

// Service pour gérer les dossiers et notes (fake data pour le moment)
import {FakeFolderService} from "../services/fakeFolderService.tsx";

// Hooks React
// - useEffect : exécuter du code au montage ou quand une dépendance change
// - useState : créer des variables d'état qui déclenchent un re-render
import {useEffect, useState} from "react";

// Types TypeScript
import type {FolderNode} from "../../types/folderNode.ts";
import type Note from "../../types/note.ts";

// Fonction utilitaire pour construire l'arbre de dossiers
import {buildFolderTree} from "../utils/buildFolderTree.tsx";

// Composants enfants
import {FolderTreeComponent} from "./folderTreeComponent.tsx";
import {FolderHeader} from "./folderHeader.tsx";
import {MarkdownEditor} from "./MarkdownEditor.tsx";

// Styles CSS
import "./folderList.css";

// ==============================================
// CRÉATION DU SERVICE
// ==============================================
// On crée une seule instance du service (singleton)
// Cette instance garde les données en mémoire pendant toute la session
const folderService = new FakeFolderService();

// ==============================================
// COMPOSANT PRINCIPAL : FOLDER LIST
// ==============================================
// Ce composant affiche :
// - À gauche : la sidebar avec l'arbre des dossiers/notes
// - À droite : l'éditeur pour modifier la note sélectionnée

export function FolderList() {

    // ==============================================
    // ÉTATS (useState)
    // ==============================================
    // Chaque useState crée une variable et une fonction pour la modifier
    // Quand l'état change, React re-render le composant

    // Arbre des dossiers (structure hiérarchique)
    const [tree, setTree] = useState<FolderNode[]>([]);

    // ID du dossier actuellement sélectionné (pour créer des notes dedans)
    const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);

    // Note actuellement sélectionnée (affichée dans l'éditeur)
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);

    // Mode édition du titre (true = on modifie le titre)
    const [editingTitle, setEditingTitle] = useState(false);

    // Valeur du titre en cours d'édition
    const [titleValue, setTitleValue] = useState("");

    // Contenu de la note (HTML généré par l'éditeur)
    const [contentValue, setContentValue] = useState("");

    // ==============================================
    // CHARGEMENT INITIAL (useEffect)
    // ==============================================
    // useEffect avec [] en dépendance = s'exécute UNE SEULE FOIS au montage
    useEffect(() => {
        // Récupère les dossiers de l'utilisateur 1
        const folders = folderService.getFoldersByUser(1);
        // Récupère les notes de l'utilisateur 1
        const notes = folderService.getNotesByUser(1);
        // Construit l'arbre hiérarchique (dossiers avec enfants et notes)
        const folderTree = buildFolderTree(folders, notes);
        // Met à jour l'état → déclenche un re-render
        setTree(folderTree);
    }, []); // [] = pas de dépendances = s'exécute une seule fois

    // ==============================================
    // FONCTION : RAFRAÎCHIR L'ARBRE
    // ==============================================
    // Appelée après chaque modification (ajout, suppression, etc.)
    function refreshTree() {
        const folders = folderService.getFoldersByUser(1);
        const notes = folderService.getNotesByUser(1);
        const tree = buildFolderTree(folders, notes);
        setTree(tree);
    }

    // ==============================================
    // CALLBACKS : GESTION DES DOSSIERS
    // ==============================================

    // Callback appelé quand on crée un nouveau dossier
    function handleCreateFolder(data) {
        // Appelle le service pour créer le dossier
        folderService.createFolder(data);
        // Rafraîchit l'arbre pour afficher le nouveau dossier
        refreshTree();
    }

    // Callback appelé quand on supprime un dossier
    function handleDeleteFolder(id: number) {
        folderService.deleteFolder(id);
        refreshTree();
    }

    // ==============================================
    // CALLBACKS : GESTION DES NOTES
    // ==============================================

    // Callback appelé quand on crée une nouvelle note
    function handleCreateNote(data) {
        // Crée la note et récupère l'objet créé
        const newNote = folderService.createNote(data);
        refreshTree();
        // Sélectionne automatiquement la nouvelle note
        setSelectedNote(newNote);
        setTitleValue(newNote.title || "");
        setContentValue(newNote.content || "");
    }

    // Callback appelé quand on clique sur une note dans la sidebar
    function handleSelectNote(note: Note) {
        // Sauvegarde la note précédente si le contenu a changé
        if (selectedNote && contentValue !== selectedNote.content) {
            folderService.updateNote(selectedNote.id!, { content: contentValue });
            refreshTree();
        }
        // Sélectionne la nouvelle note
        setSelectedNote(note);
        setTitleValue(note.title || "");
        setContentValue(note.content || "");
        setEditingTitle(false);
    }

    // ==============================================
    // CALLBACKS : ÉDITION DU TITRE
    // ==============================================

    // Sauvegarde le titre quand on finit de l'éditer
    function saveTitle() {
        if (selectedNote && titleValue.trim()) {
            // Met à jour dans le service
            folderService.updateNote(selectedNote.id!, { title: titleValue });
            // Met à jour l'état local
            setSelectedNote({ ...selectedNote, title: titleValue });
            // Rafraîchit la sidebar pour afficher le nouveau titre
            refreshTree();
        }
        // Sort du mode édition
        setEditingTitle(false);
    }

    // ==============================================
    // CALLBACK : CHANGEMENT DE CONTENU
    // ==============================================
    // Appelé par l'éditeur à chaque modification

    function handleContentChange(newContent: string) {
        // Met à jour l'état local
        setContentValue(newContent);
        // Sauvegarde automatique dans le service
        if (selectedNote) {
            folderService.updateNote(selectedNote.id!, { content: newContent });
        }
    }

    // ==============================================
    // RENDU JSX
    // ==============================================

    return (
        // Container principal avec layout flex
        <div className="app-layout">

            {/* ========================================
                SIDEBAR GAUCHE
                ======================================== */}
            <aside className="sidebar">
                {/* Titre de la sidebar */}
                <h2>Mes dossiers</h2>

                {/* Boutons pour créer dossier/note */}
                <FolderHeader
                    onCreateFolder={handleCreateFolder}
                    onCreateNote={handleCreateNote}
                    currentFolderId={currentFolderId}
                />

                {/* Arbre des dossiers et notes */}
                <FolderTreeComponent
                    nodes={tree}
                    onSelectFolder={setCurrentFolderId}
                    currentFolderId={currentFolderId}
                    onDeleteFolder={handleDeleteFolder}
                    onSelectNote={handleSelectNote}
                    selectedNoteId={selectedNote?.id ?? null}
                />
            </aside>

            {/* ========================================
                ZONE DE CONTENU DROITE
                ======================================== */}
            <main className="content">
                {/* Affiche l'éditeur si une note est sélectionnée */}
                {selectedNote ? (
                    <>
                        {/* ==============================
                            TITRE DE LA NOTE
                            ==============================
                            Double-clic pour éditer */}
                        {editingTitle ? (
                            // Mode édition : input pour modifier le titre
                            <input
                                className="title-input"
                                value={titleValue}
                                onChange={(e) => setTitleValue(e.target.value)}
                                onBlur={saveTitle}  // Sauvegarde quand on clique ailleurs
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") saveTitle();   // Entrée = sauvegarder
                                    if (e.key === "Escape") setEditingTitle(false);  // Échap = annuler
                                }}
                                autoFocus  // Focus automatique sur l'input
                            />
                        ) : (
                            // Mode affichage : titre cliquable
                            <h1 onDoubleClick={() => setEditingTitle(true)}>
                                {selectedNote.title}
                            </h1>
                        )}

                        {/* ==============================
                            ÉDITEUR MARKDOWN WYSIWYG
                            ==============================
                            Tape **texte** → devient gras
                            Tape *texte* → devient italique
                            etc. */}
                        <MarkdownEditor
                            content={contentValue}
                            onChange={handleContentChange}
                        />
                    </>
                ) : (
                    // Message si aucune note n'est sélectionnée
                    <p className="no-selection">Sélectionnez une note</p>
                )}
            </main>
        </div>
    );
}

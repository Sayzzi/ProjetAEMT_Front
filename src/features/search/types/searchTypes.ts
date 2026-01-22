export interface SearchResultItem {
    type: "FOLDER" | "NOTE" | "NOTE_CONTENT" | string;
    id: number;
    folderId?: number | null;
    title?: string | null;
    snippet?: string | null;
    line?: number | null;
    score: number;
}

export interface SearchResponse {
    results: SearchResultItem[];
}

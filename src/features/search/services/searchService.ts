import {api} from "../../auth/services/api.ts";
import type {SearchResponse} from "../types/searchTypes.ts";

// Service dédié à l'endpoint /search
export class SearchService {
    async quickSearch(query: string, userId: number, limit = 20): Promise<SearchResponse> {
        const params = new URLSearchParams({
            q: query,
            userId: String(userId),
            limit: String(limit),
        });

        const response = await api.get(`/search?${params.toString()}`);
        if (!response.ok) {
            throw new Error("Erreur lors de la recherche");
        }
        return response.json();
    }
}

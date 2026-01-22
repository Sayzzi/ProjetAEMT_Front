import {useEffect, useMemo, useRef, useState} from "react";
import {SearchService} from "../services/searchService.ts";
import type {SearchResultItem} from "../types/searchTypes.ts";
import "./quickSearch.css";

interface QuickSearchProps {
    userId?: number | null;
    onOpenFolder: (folderId: number) => void;
    onOpenNote: (noteId: number, folderId?: number | null) => void;
}

const typeLabel: Record<string, string> = {
    FOLDER: "Dossier",
    NOTE: "Note",
    NOTE_CONTENT: "Contenu",
};

export function QuickSearch({ userId, onOpenFolder, onOpenNote }: QuickSearchProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResultItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchService = useMemo(() => new SearchService(), []);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<number | null>(null);
    const lastShiftRef = useRef<number>(0);

    // Double Shift opens search panel
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                setIsOpen(false);
                return;
            }

            if (e.key === "Shift") {
                const now = Date.now();
                if (now - lastShiftRef.current < 400 && userId) {
                    e.preventDefault();
                    setIsOpen(true);
                    setQuery("");
                    setResults([]);
                    setError(null);
                    setTimeout(() => inputRef.current?.focus(), 40);
                }
                lastShiftRef.current = now;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, userId]);

    // Debounced search
    useEffect(() => {
        if (!isOpen || !userId || userId <= 0) return;

        if (debounceRef.current) {
            window.clearTimeout(debounceRef.current);
        }

        if (query.trim().length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        debounceRef.current = window.setTimeout(async () => {
            try {
                const data = await searchService.quickSearch(query.trim(), userId);
                setResults(data.results);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Erreur inconnue");
            } finally {
                setLoading(false);
            }
        }, 250);

        return () => {
            if (debounceRef.current) {
                window.clearTimeout(debounceRef.current);
            }
        };
    }, [query, isOpen, userId, searchService]);

    function handleResultClick(item: SearchResultItem) {
        if (item.type === "FOLDER") {
            onOpenFolder(item.id);
        } else {
            onOpenNote(item.id, item.folderId);
        }
        setIsOpen(false);
    }

    if (!isOpen) return null;

    return (
        <div className="quicksearch-overlay" onClick={() => setIsOpen(false)}>
            <div className="quicksearch-panel" onClick={(e) => e.stopPropagation()}>
                <div className="quicksearch-header">
                    <div>
                        <p className="quicksearch-title">Recherche rapide</p>
                        <span className="quicksearch-subtitle">Double Shift pour ouvrir, Échap pour fermer</span>
                    </div>
                    <span className="quicksearch-badge">Utilisateur #{userId}</span>
                </div>

                <input
                    ref={inputRef}
                    className="quicksearch-input"
                    placeholder="Chercher un dossier ou une note..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && results.length > 0) {
                            handleResultClick(results[0]);
                        }
                    }}
                />

                {error && <div className="quicksearch-error">{error}</div>}
                {query.trim().length < 2 && !error && (
                    <div className="quicksearch-hint">Tapez au moins 2 caractères</div>
                )}
                {loading && <div className="quicksearch-loading">Recherche en cours...</div>}

                <div className="quicksearch-results">
                    {results.map((item) => (
                        <div
                            key={`${item.type}-${item.id}-${item.folderId ?? "root"}`}
                            className="quicksearch-result"
                            onClick={() => handleResultClick(item)}
                        >
                            <div className="quicksearch-result-top">
                                <span className={`quicksearch-chip type-${item.type.toLowerCase()}`}>
                                    {typeLabel[item.type] ?? item.type}
                                </span>
                                <span className="quicksearch-score">{(item.score * 100).toFixed(0)}%</span>
                            </div>
                            <div className="quicksearch-result-title">{item.title || "Sans titre"}</div>
                            {item.snippet && (
                                <div className="quicksearch-snippet">
                                    {item.line ? `Ligne ${item.line} · ` : ""}
                                    {item.snippet}
                                </div>
                            )}
                        </div>
                    ))}

                    {!loading && results.length === 0 && query.trim().length >= 2 && !error && (
                        <div className="quicksearch-empty">Aucun résultat</div>
                    )}
                </div>
            </div>
        </div>
    );
}

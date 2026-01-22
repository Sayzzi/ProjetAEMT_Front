// Fonction pour faire des requêtes avec le token JWT
import { getGlobalShowError } from '../../alert/contexts/AlertContext';

const API_URL = import.meta.env.VITE_API_URL;

// Structure ProblemDetail du backend (RFC 7807)
interface ProblemDetail {
    type?: string;
    title?: string;
    status?: number;
    detail?: string;
}

// Map des codes HTTP vers des titres lisibles
const HTTP_ERROR_TITLES: Record<number, string> = {
    400: 'Requête invalide',
    401: 'Non autorisé',
    403: 'Accès refusé',
    404: 'Non trouvé',
    409: 'Conflit',
    500: 'Erreur serveur',
};

// Récupère le token depuis localStorage
function getToken(): string | null {
    const user = localStorage.getItem('user');
    if (!user) return null;
    return JSON.parse(user).token;
}

// Affiche une erreur via le système d'alertes
function showApiError(status: number, detail: string) {
    const showError = getGlobalShowError();
    if (showError) {
        const title = HTTP_ERROR_TITLES[status] || `Erreur ${status}`;
        showError(title, detail || 'Une erreur est survenue');
    }
}

// Fetch avec token JWT automatique + gestion des erreurs
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = getToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Ajoute le token si présent
    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(API_URL + endpoint, {
        ...options,
        headers,
    });

    // Si erreur HTTP, parse le ProblemDetail et affiche l'alerte
    if (!response.ok) {
        try {
            const errorData: ProblemDetail = await response.clone().json();
            showApiError(response.status, errorData.detail || errorData.title || 'Erreur inconnue');
        } catch {
            // Si le body n'est pas du JSON, utilise le statusText
            showApiError(response.status, response.statusText);
        }
    }

    return response;
}

// Raccourcis pour les méthodes HTTP
export const api = {
    get: (endpoint: string) => fetchWithAuth(endpoint, { method: 'GET' }),

    post: (endpoint: string, data: unknown) => fetchWithAuth(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    put: (endpoint: string, data: unknown) => fetchWithAuth(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    delete: (endpoint: string) => fetchWithAuth(endpoint, { method: 'DELETE' }),
};

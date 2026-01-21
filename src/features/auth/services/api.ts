// Fonction pour faire des requêtes avec le token JWT

const API_URL = import.meta.env.VITE_API_URL;

// Récupère le token depuis localStorage
function getToken(): string | null {
    const user = localStorage.getItem('user');
    if (!user) return null;
    return JSON.parse(user).token;
}

// Fetch avec token JWT automatique
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

    return fetch(API_URL + endpoint, {
        ...options,
        headers,
    });
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

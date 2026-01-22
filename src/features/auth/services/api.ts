// Function to make requests with the JWT token
import { getGlobalShowError } from '../../alert/contexts/AlertContext';

const API_URL = import.meta.env.VITE_API_URL;

// Backend ProblemDetail structure (RFC 7807)
interface ProblemDetail {
    type?: string;
    title?: string;
    status?: number;
    detail?: string;
}

// Map of HTTP codes to readable titles
const HTTP_ERROR_TITLES: Record<number, string> = {
    400: 'Invalid request',
    401: 'Unauthorized',
    403: 'Access denied',
    404: 'Not found',
    409: 'Conflict',
    500: 'Server error',
};

// Retrieve the token from localStorage
function getToken(): string | null {
    const user = localStorage.getItem('user');
    if (!user) return null;
    return JSON.parse(user).token;
}

// Display an error using the alert system
function showApiError(status: number, detail: string) {
    const showError = getGlobalShowError();
    if (showError) {
        const title = HTTP_ERROR_TITLES[status] || `Error ${status}`;
        showError(title, detail || 'An error occurred');
    }
}

// Fetch with automatic JWT token + error handling
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = getToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Add the token if present
    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(API_URL + endpoint, {
        ...options,
        headers,
    });

    // If HTTP error, parse ProblemDetail and display the alert
    if (!response.ok) {
        try {
            const errorData: ProblemDetail = await response.clone().json();
            showApiError(response.status, errorData.detail || errorData.title || 'Unknown error');
        } catch {
            // If the body is not JSON, use statusText
            showApiError(response.status, response.statusText);
        }
    }

    return response;
}

// Shortcuts for HTTP methods
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

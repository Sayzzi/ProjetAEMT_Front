import type { LoginCommand } from './commands/login-command.ts';
import type { RegisterCommand } from './commands/register-command.ts';
import type { User } from '../../types/user.ts';

const USER_API_URL = import.meta.env.VITE_API_URL + "/users";

// POST /users - Inscription
export const register: (command: RegisterCommand) => Promise<User> = async (command: RegisterCommand) => {
    const response = await fetch(USER_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command),
    });
    return response.json();
}

// POST /users/login - Connexion
// Envoie les credentials au backend et retourne l'utilisateur si valide
export const login: (command: LoginCommand) => Promise<User> = async (command: LoginCommand) => {
    // fetch: fonction native du navigateur pour faire des requêtes HTTP
    // USER_API_URL + "/login" = "http://localhost:8080/api/users/login"
    const response = await fetch(USER_API_URL + "/login", {
        method: 'POST',  // Méthode HTTP POST (envoie des données)
        headers: { 'Content-Type': 'application/json' },  // Dit au serveur qu'on envoie du JSON
        body: JSON.stringify(command),  // Convertit { userName, password } en chaîne JSON
    });

    // Si le serveur retourne une erreur (status 400, 401, etc.)
    // On lance une erreur pour que le catch dans le composant la récupère
    if (!response.ok) {
        throw new Error('Erreur de connexion');
    }

    // response.json() convertit la réponse JSON en objet JavaScript
    // Retourne { id: 1, userName: "john" }
    return response.json();
}

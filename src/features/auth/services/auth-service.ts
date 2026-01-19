// Service pour les appels API auth
// Base URL: import.meta.env.VITE_API_URL

import { LoginCommand } from './commands/login-command';
import { RegisterCommand } from './commands/register-command';
import { User } from '../../types/user.ts';

const API_URL = import.meta.env.VITE_API_URL;

// POST /users - Inscription
export async function register(command: RegisterCommand): Promise<User> {
    // TODO: fetch POST vers /users
    // - headers: Content-Type: application/json
    // - body: JSON.stringify(command)
    // - retourne response.json()
    throw new Error('Not implemented');
}

// POST /users/login - Connexion
export async function login(command: LoginCommand): Promise<User> {
    // TODO: fetch POST vers /users/login
    // - headers: Content-Type: application/json
    // - body: JSON.stringify(command)
    // - retourne response.json()
    throw new Error('Not implemented');
}

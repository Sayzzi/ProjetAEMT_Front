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
export const login: (command: LoginCommand) => Promise<User> = async (command: LoginCommand) => {

}

import type { LoginCommand } from './commands/login-command.ts';
import type { RegisterCommand } from './commands/register-command.ts';
import type { User } from '../../types/user.ts';

const USER_API_URL = import.meta.env.VITE_API_URL + "/users";

// POST /users - Registration
export const register: (command: RegisterCommand) => Promise<User> = async (command: RegisterCommand) => {
    const response = await fetch(USER_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command),
    });
    return response.json();
}

// POST /users/login - Login
// Sends credentials to the backend and returns the user if valid
export const login: (command: LoginCommand) => Promise<User> = async (command: LoginCommand) => {
    // fetch: native browser function to make HTTP requests
    // USER_API_URL + "/login" = "http://localhost:8080/api/users/login"
    const response = await fetch(USER_API_URL + "/login", {
        method: 'POST',  // HTTP POST method (sends data)
        headers: { 'Content-Type': 'application/json' },  // Tells the server we are sending JSON
        body: JSON.stringify(command),  // Converts { userName, password } into a JSON string
    });

    // If the server returns an error (status 400, 401, etc.)
    // Throw an error so the catch block in the component can handle it
    if (!response.ok) {
        throw new Error('Login error');
    }

    // response.json() converts the JSON response into a JavaScript object
    // Returns { id: 1, userName: "john" }
    return response.json();
}

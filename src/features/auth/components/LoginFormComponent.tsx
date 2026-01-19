// Composant formulaire de connexion
// - Champs: userName, password
// - Bouton: Se connecter
// - Appelle auth-service.login()
// - Dispatch action 'login' dans AuthContext

import { useState } from 'react';

export function LoginFormComponent() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // TODO:
        // 1. Appeler login({ userName, password })
        // 2. dispatch({ type: 'login', user: result })
        // 3. Rediriger vers /notes
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* TODO: Inputs userName, password + bouton submit */}
        </form>
    );
}

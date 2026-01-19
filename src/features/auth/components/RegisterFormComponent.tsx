// Composant formulaire d'inscription
// - Champs: userName, password, confirmPassword
// - Bouton: S'inscrire
// - Appelle auth-service.register()
// - Redirige vers /login après succès

import { useState } from 'react';

export function RegisterFormComponent() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // TODO:
        // 1. Vérifier password === confirmPassword
        // 2. Appeler register({ userName, password })
        // 3. Rediriger vers /login
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* TODO: Inputs userName, password, confirmPassword + bouton submit */}
        </form>
    );
}

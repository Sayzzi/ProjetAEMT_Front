import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/auth-service.ts';

export function RegisterFormComponent() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        try {
            await register({ userName, password });
            navigate('/login');
        } catch (err) {
            setError('Erreur lors de l\'inscription');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Inscription</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div>
                <label>Nom d'utilisateur</label>
                <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                />
            </div>

            <div>
                <label>Mot de passe</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            <div>
                <label>Confirmer le mot de passe</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
            </div>

            <button type="submit">S'inscrire</button>
        </form>
    );
}

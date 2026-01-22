import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/auth-service.ts';
import { useAuth } from '../contexts/AuthContext.tsx';

export function LoginFormComponent() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const user = await login({ userName, password });
            setUser(user);
            navigate('/');
        } catch (err) {
            setError('Nom d\'utilisateur ou mot de passe incorrect');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Connexion</h2>

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

            <button type="submit">Se connecter</button>

            <p style={{ marginTop: '15px', textAlign: 'center' }}>
                Pas encore de compte ? <Link to="/register">Créer un compte</Link>
                <br/>
                Retour à l'<Link to="/welcome">Accueil</Link>
            </p>
        </form>
    );
}

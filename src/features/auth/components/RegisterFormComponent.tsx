import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/auth-service.ts';
import './RegisterForm.css';

// Règles de validation du mot de passe
interface PasswordRule {
    label: string;
    test: (password: string) => boolean;
}

const passwordRules: PasswordRule[] = [
    { label: '8 caractères minimum', test: (p) => p.length >= 8 },
    { label: 'Une lettre majuscule', test: (p) => /[A-Z]/.test(p) },
    { label: 'Une lettre minuscule', test: (p) => /[a-z]/.test(p) },
    { label: 'Un chiffre', test: (p) => /[0-9]/.test(p) },
    { label: 'Un caractère spécial (!@#$%...)', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

export function RegisterFormComponent() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Vérifie chaque règle en temps réel
    const ruleResults = useMemo(() => {
        return passwordRules.map(rule => ({
            ...rule,
            valid: rule.test(password)
        }));
    }, [password]);

    // Toutes les règles sont-elles valides ?
    const allRulesValid = ruleResults.every(r => r.valid);

    // Les mots de passe correspondent ?
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!allRulesValid) {
            setError('Le mot de passe ne respecte pas tous les critères');
            return;
        }

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
        <div className="register-container">
            <form onSubmit={handleSubmit} className="register-form">
                <div className="register-header">
                    <span className="register-icon">🎃</span>
                    <h2>Inscription</h2>
                    <p className="register-subtitle">Rejoins Spooky Notes</p>
                </div>

                {error && <div className="register-error">{error}</div>}

                <div className="form-group">
                    <label>Nom d'utilisateur</label>
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Ton pseudo"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Mot de passe</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Ton mot de passe"
                        required
                    />

                    {/* Indicateur de force en temps réel */}
                    {password.length > 0 && (
                        <div className="password-rules">
                            {ruleResults.map((rule, index) => (
                                <div
                                    key={index}
                                    className={`password-rule ${rule.valid ? 'valid' : 'invalid'}`}
                                >
                                    <span className="rule-icon">{rule.valid ? '✓' : '✗'}</span>
                                    <span className="rule-label">{rule.label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label>Confirmer le mot de passe</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirme ton mot de passe"
                        required
                    />
                    {confirmPassword.length > 0 && (
                        <div className={`password-match ${passwordsMatch ? 'valid' : 'invalid'}`}>
                            <span className="rule-icon">{passwordsMatch ? '✓' : '✗'}</span>
                            <span className="rule-label">
                                {passwordsMatch ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}
                            </span>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className="register-btn"
                    disabled={!allRulesValid || !passwordsMatch || !userName}
                >
                    S'inscrire
                </button>

                <p className="register-footer">
                    Deja un compte ? <Link to="/login">Se connecter</Link>
                    <br/>
                    Retour à l'<Link to="/welcome">Accueil</Link>
                </p>
            </form>
        </div>
    );
}

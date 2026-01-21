
// useState: hook React pour créer des variables d'état
// Quand l'état change, le composant se re-render (se réaffiche)
import { useState } from 'react';

// useNavigate: hook de React Router pour naviguer entre les pages
// Link: composant pour créer un lien vers une autre page
import { useNavigate, Link } from 'react-router-dom';

// Fonction qui appelle l'API backend POST /api/users/login
// Elle envoie { userName, password } et retourne { id, userName }
import { login } from '../services/auth-service.ts';

// Hook personnalisé pour accéder au contexte d'authentification
// Permet de lire et modifier l'utilisateur connecté globalement
import { useAuth } from '../contexts/AuthContext.tsx';

// ============================================
// COMPOSANT LOGIN FORM
// ============================================

export function LoginFormComponent() {

    // ============================================
    // ÉTATS (variables qui déclenchent un re-render quand elles changent)
    // ============================================

    // userName: contient ce que l'utilisateur tape dans le champ "nom d'utilisateur"
    // setUserName: fonction pour modifier userName
    // useState('') : valeur initiale = chaîne vide
    const [userName, setUserName] = useState('');

    // password: contient ce que l'utilisateur tape dans le champ "mot de passe"
    const [password, setPassword] = useState('');

    // error: contient le message d'erreur à afficher (si connexion échoue)
    const [error, setError] = useState('');

    // ============================================
    // HOOKS (fonctions spéciales de React/React Router)
    // ============================================

    // navigate: fonction pour changer de page sans recharger
    // Utilisation: navigate('/chemin')
    const navigate = useNavigate();

    // useAuth(): récupère le contexte d'authentification
    // setUser: fonction pour stocker l'utilisateur dans le contexte global
    // Après setUser(), tous les composants peuvent accéder à l'utilisateur
    const { setUser } = useAuth();

    // ============================================
    // FONCTION DE SOUMISSION DU FORMULAIRE
    // ============================================

    // async: cette fonction contient du code asynchrone (await)
    // e: l'événement du formulaire (contient des infos sur la soumission)
    const handleSubmit = async (e: React.FormEvent) => {

        // Empêche le comportement par défaut du formulaire
        // Sans ça, la page se recharge et on perd tout
        e.preventDefault();

        // Efface l'erreur précédente avant de réessayer
        setError('');

        try {
            // ============================================
            // 1. APPEL API - Connexion
            // ============================================

            // Appelle POST http://localhost:8080/api/users/login
            // Envoie: { userName: "john", password: "123" }
            // Reçoit: { id: 1, userName: "john" }
            //
            // await: attend que la requête soit terminée avant de continuer
            // Sans await, le code continuerait sans attendre la réponse
            const user = await login({ userName, password });

            // ============================================
            // 2. STOCKAGE - Sauvegarde l'utilisateur dans le contexte
            // ============================================

            // setUser() stocke l'utilisateur dans AuthContext
            // Maintenant, TOUS les composants de l'app peuvent faire:
            //   const { user } = useAuth();
            //   console.log(user.id);  // 1
            //   console.log(user.userName);  // "john"
            setUser(user);

            // ============================================
            // 3. REDIRECTION - Envoie l'utilisateur vers une autre page
            // ============================================

            // Change l'URL vers '/' (page d'accueil)
            // Tu peux changer vers '/notes' quand la page existera
            navigate('/');

        } catch (err) {
            // ============================================
            // GESTION D'ERREUR
            // ============================================

            // Si login() échoue (mauvais mot de passe, utilisateur inexistant)
            // On affiche un message d'erreur à l'utilisateur
            setError('Nom d\'utilisateur ou mot de passe incorrect');
        }
    };

    // ============================================
    //Ce qui s'affiche à l'écran
    // ============================================

    return (
        // form: élément HTML formulaire
        // onSubmit: quand l'utilisateur clique sur "Se connecter" ou appuie Entrée
        <form onSubmit={handleSubmit}>

            <h2>Connexion</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* ============================================ */}
            {/* CHAMP NOM D'UTILISATEUR */}
            {/* ============================================ */}
            <div>
                <label>Nom d'utilisateur</label>
                <input
                    type="text"
                    // value: lie l'input à l'état userName
                    // L'input affiche toujours la valeur de userName
                    value={userName}

                    // onChange: appelé à CHAQUE frappe de clavier
                    // e.target.value = le nouveau contenu de l'input
                    // setUserName() met à jour l'état, ce qui re-render le composant
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

            {/* Lien vers la page d'inscription */}
            <p style={{ marginTop: '15px', textAlign: 'center' }}>
                Pas encore de compte ? <Link to="/register">Créer un compte</Link>
                <br/>
                Retour à l'<Link to="/welcome">Accueil</Link>
            </p>
        </form>
    );
}

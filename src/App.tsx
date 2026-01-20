// ============================================
// IMPORTS
// ============================================

import { BrowserRouter, Route, Routes, Link } from "react-router-dom"
import './App.css'

// Import des composants de pages
import { RegisterFormComponent } from "./features/auth/components/RegisterFormComponent.tsx";
import { LoginFormComponent } from "./features/auth/components/LoginFormComponent.tsx";

// Import du Provider et hook d'authentification
import { AuthProvider, useAuth } from "./features/auth/contexts/AuthContext.tsx";

// ============================================
// COMPOSANT BARRE DE STATUT (affiche si connecté ou pas)
// ============================================

function StatusBar() {
    // useAuth() récupère l'utilisateur connecté depuis le contexte
    // user = { id, userName } si connecté, null sinon
    // logout = fonction pour déconnecter
    const { user, logout } = useAuth();

    return (
        <div style={{
            padding: '10px',
            backgroundColor: '#333',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            {/* Liens de navigation */}
            <div>
                <Link to="/login" style={{ color: 'white', marginRight: '15px' }}>Connexion</Link>
                <Link to="/register" style={{ color: 'white' }}>Inscription</Link>
            </div>

            {/* Affichage du statut de connexion */}
            <div>
                {/* Si user existe (connecté) */}
                {user ? (
                    <>
                        {/* Affiche le nom et l'id de l'utilisateur */}
                        <span style={{ marginRight: '15px' }}>
                            Connecté: {user.userName} (id: {user.id})
                        </span>
                        {/* Bouton pour se déconnecter */}
                        <button onClick={logout}>Déconnexion</button>
                    </>
                ) : (
                    // Si user est null (pas connecté)
                    <span>Non connecté</span>
                )}
            </div>
        </div>
    );
}

// ============================================
// COMPOSANT PRINCIPAL DE L'APPLICATION
// ============================================

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                {/* Barre de statut en haut de toutes les pages */}
                <StatusBar />

                {/* Routes: les différentes pages */}
                <Routes>
                    <Route path="/" element={<LoginFormComponent />} />
                    <Route path="/register" element={<RegisterFormComponent />} />
                    <Route path="/login" element={<LoginFormComponent />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App

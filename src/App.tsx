import { BrowserRouter, Route, Routes } from "react-router-dom"
import './App.css'

// Composants de pages
import { LoginFormComponent } from "./features/auth/components/LoginFormComponent.tsx";
import { RegisterFormComponent } from "./features/auth/components/RegisterFormComponent.tsx";
import { FolderList } from "./features/folder/components/folderList.tsx";
import { LandingPage } from "./features/landing/LandingPage.tsx";

// Contexte d'authentification + protection des routes
import { AuthProvider, useAuth } from "./features/auth/contexts/AuthContext.tsx";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute.tsx";

// ============================================
// BARRE DE STATUT - Header avec logo + infos user
// Visible uniquement quand connecté
// ============================================
function StatusBar() {
    const { user, logout } = useAuth();

    // Cache le header sur les pages publiques (login, register, landing)
    if (!user) return null;

    return (
        <header className="status-bar">
            {/* Logo cliquable pour retour à l'accueil */}
            <div className="status-left">
                <a href="/welcome" className="app-logo">
                    <span className="logo-pumpkin">🎃</span>
                    <span className="logo-text">Spooky Notes</span>
                </a>
            </div>
            {/* Infos utilisateur + bouton déconnexion */}
            <div className="status-right">
                <div className="user-info">
                    <span className="user-avatar">👻</span>
                    <span className="user-name">{user.userName}</span>
                </div>
                {/* Déconnexion : vide le localStorage et redirige vers /login */}
                <button onClick={logout} className="logout-btn">
                    Déconnexion
                </button>
            </div>
        </header>
    );
}

// ============================================
// APP PRINCIPAL
// ============================================
function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <StatusBar />
                <Routes>
                    {/* Page d'accueil publique avec présentation */}
                    <Route path="/welcome" element={<LandingPage />} />

                    {/* App principale - ProtectedRoute redirige vers /login si non connecté */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <FolderList />
                        </ProtectedRoute>
                    } />
                    {/* Pages d'authentification (publiques) */}
                    <Route path="/login" element={<LoginFormComponent />} />
                    <Route path="/register" element={<RegisterFormComponent />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App

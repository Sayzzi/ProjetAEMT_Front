import { BrowserRouter, Route, Routes } from "react-router-dom"
import './App.css'

// Composants de pages
import { LoginFormComponent } from "./features/auth/components/LoginFormComponent.tsx";
import { RegisterFormComponent } from "./features/auth/components/RegisterFormComponent.tsx";
import { FolderList } from "./features/folder/components/folderList.tsx";

// Contexte d'authentification + protection des routes
import { AuthProvider, useAuth } from "./features/auth/contexts/AuthContext.tsx";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute.tsx";

// ============================================
// BARRE DE STATUT (connecté ou pas)
// ============================================
function StatusBar() {
    const { user, logout } = useAuth();

    // Affiche seulement si connecté
    if (!user) return null;

    return (
        <div className="status-bar">
            <div className="user-info">
                <span className="user-name">{user.userName}</span>
            </div>
            <button onClick={logout} className="logout-btn">Déconnexion</button>
        </div>
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
                    {/* Route protégée : redirige vers /login si pas connecté */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <FolderList />
                        </ProtectedRoute>
                    } />
                    <Route path="/login" element={<LoginFormComponent />} />
                    <Route path="/register" element={<RegisterFormComponent />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App

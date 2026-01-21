import { BrowserRouter, Route, Routes, Link } from "react-router-dom"
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

    return (
        <div style={{
            padding: '10px',
            backgroundColor: '#333',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <div>
                {/* Affiche Accueil seulement si connecté */}
                {user && (
                    <Link to="/" style={{ color: 'white', marginRight: '15px' }}>Accueil</Link>
                )}
                {/* Affiche Connexion/Inscription seulement si pas connecté */}
                {!user && (
                    <>
                        <Link to="/login" style={{ color: 'white', marginRight: '15px' }}>Connexion</Link>
                        <Link to="/register" style={{ color: 'white' }}>Inscription</Link>
                    </>
                )}
            </div>

            <div>
                {user ? (
                    <>
                        <span style={{ marginRight: '15px' }}>
                            Connecté: {user.userName}
                        </span>
                        <button onClick={logout}>Déconnexion</button>
                    </>
                ) : (
                    <span>Non connecté</span>
                )}
            </div>
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

import { BrowserRouter, Route, Routes } from "react-router-dom"
import './App.css'

// Page components
import { LoginFormComponent } from "./features/auth/components/LoginFormComponent.tsx";
import { RegisterFormComponent } from "./features/auth/components/RegisterFormComponent.tsx";
import { FolderList } from "./features/folder/components/folderList.tsx";
import { LandingPage } from "./features/landing/LandingPage.tsx";

// Authentication context + route protection
import { AuthProvider, useAuth } from "./features/auth/contexts/AuthContext.tsx";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute.tsx";

// Global alert system
import { AlertProvider } from "./features/alert/contexts/AlertContext.tsx";
import { AlertContainer } from "./features/alert/components/AlertContainer.tsx";

// ============================================
// STATUS BAR - Header with logo + user info
// Visible only when logged in
// ============================================
function StatusBar() {
    const { user, logout } = useAuth();

    // Hide header on public pages (login, register, landing)
    if (!user) return null;

    return (
        <header className="status-bar">
            {/* Clickable logo to return to home */}
            <div className="status-left">
                <a href="/welcome" className="app-logo">
                    <span className="logo-pumpkin">🎃</span>
                    <span className="logo-text">Spooky Notes</span>
                </a>
            </div>
            {/* User info + logout button */}
            <div className="status-right">
                <div className="user-info">
                    <span className="user-avatar">👻</span>
                    <span className="user-name">{user.userName}</span>
                </div>
                {/* Logout: clears localStorage and redirects to /login */}
                <button onClick={logout} className="logout-btn">
                    Logout
                </button>
            </div>
        </header>
    );
}

// ============================================
// MAIN APP
// ============================================
function App() {
    return (
        <BrowserRouter>
            <AlertProvider>
                <AuthProvider>
                    <AlertContainer />
                    <StatusBar />
                    <Routes>
                        {/* Public landing page with presentation */}
                        <Route path="/welcome" element={<LandingPage />} />

                        {/* Main app - ProtectedRoute redirects to /login if not authenticated */}
                        <Route path="/" element={
                            <ProtectedRoute>
                                <FolderList />
                            </ProtectedRoute>
                        } />
                        {/* Authentication pages (public) */}
                        <Route path="/login" element={<LoginFormComponent />} />
                        <Route path="/register" element={<RegisterFormComponent />} />
                    </Routes>
                </AuthProvider>
            </AlertProvider>
        </BrowserRouter>
    )
}

export default App

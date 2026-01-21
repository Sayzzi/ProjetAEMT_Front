import { Link } from 'react-router-dom';
import { useAuth } from '../auth/contexts/AuthContext';
import './LandingPage.css';

// Page d'accueil publique avec présentation de l'app
export function LandingPage() {
    // Vérifie si l'utilisateur est connecté pour adapter les boutons
    const { user } = useAuth();

    return (
        <div className="landing">
            {/* Éléments décoratifs animés en arrière-plan (CSS animations) */}
            <div className="landing-bg">
                <div className="fog fog-1"></div>
                <div className="fog fog-2"></div>
                <div className="bats">
                    <span className="bat bat-1">🦇</span>
                    <span className="bat bat-2">🦇</span>
                    <span className="bat bat-3">🦇</span>
                </div>
                <div className="floating-elements">
                    <span className="float-item ghost">👻</span>
                    <span className="float-item pumpkin">🎃</span>
                    <span className="float-item skull">💀</span>
                    <span className="float-item spider">🕷️</span>
                </div>
            </div>
            {/* Section principale : titre accrocheur + aperçu de l'app */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-badge">
                        <span>🕸️</span> Application de Notes
                    </div>
                    <h1 className="hero-title">
                        <span className="title-line">Prenez des notes</span>
                        <span className="title-line accent">Terriblement</span>
                        <span className="title-line">efficaces</span>
                    </h1>
                    <p className="hero-description">
                        Organisez vos idées dans une ambiance Halloween.
                        Dossiers, notes Markdown, export PDF...
                        Tout ce qu'il faut pour être productif, avec style.
                    </p>
                    <div className="hero-actions">
                        {user ? (
                            <Link to="/" className="cta-btn primary">
                                <span>Accéder à mes notes</span>
                                <span className="btn-icon">→</span>
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="cta-btn primary">
                                    <span>Commencer gratuitement</span>
                                    <span className="btn-icon">→</span>
                                </Link>
                                <Link to="/login" className="cta-btn secondary">
                                    <span>J'ai déjà un compte</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Aperçu visuel : fausse capture de l'interface avec effet 3D */}
                <div className="hero-visual">
                    <div className="app-preview">
                        <div className="preview-header">
                            <div className="preview-dots">
                                <span></span><span></span><span></span>
                            </div>
                            <span className="preview-title">Spooky Notes</span>
                        </div>
                        <div className="preview-body">
                            <div className="preview-sidebar">
                                <div className="preview-folder">📁 Projets</div>
                                <div className="preview-folder">📁 Idées</div>
                                <div className="preview-note active">📝 Ma note</div>
                            </div>
                            <div className="preview-content">
                                <div className="preview-note-title">🎃 Bienvenue !</div>
                                <div className="preview-text-line"></div>
                                <div className="preview-text-line short"></div>
                                <div className="preview-text-line"></div>
                            </div>
                        </div>
                    </div>
                    <div className="preview-glow"></div>
                </div>
            </section>

            {/* Grille des fonctionnalités avec icônes et descriptions */}
            <section className="features">
                <h2 className="section-title">
                    <span className="title-icon">✨</span>
                    Fonctionnalités
                </h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">📁</div>
                        <h3>Dossiers imbriqués</h3>
                        <p>Organisez vos notes dans une arborescence de dossiers illimitée</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">✍️</div>
                        <h3>Éditeur Markdown</h3>
                        <p>Formatez vos notes avec un éditeur WYSIWYG puissant</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📄</div>
                        <h3>Export PDF</h3>
                        <p>Exportez vos notes en PDF en un clic</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📦</div>
                        <h3>Export ZIP</h3>
                        <p>Téléchargez toutes vos notes en une archive</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💾</div>
                        <h3>Sauvegarde auto</h3>
                        <p>Vos notes sont sauvegardées automatiquement</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🎃</div>
                        <h3>Thème Halloween</h3>
                        <p>Une interface unique pour travailler avec style</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <span className="footer-logo">🎃 Spooky Notes</span>
                    <span className="footer-text">Projet Hackathon AEMT 2026</span>
                </div>
            </footer>
        </div>
    );
}

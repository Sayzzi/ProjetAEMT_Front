import { Link } from 'react-router-dom';
import { useAuth } from '../auth/contexts/AuthContext';
import './LandingPage.css';

// Public landing page with app presentation
export function LandingPage() {
    // Check if the user is logged in to adapt the buttons
    const { user } = useAuth();

    return (
        <div className="landing">
            {/* Animated decorative elements in the background (CSS animations) */}
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
            {/* Main section: catchy title + app preview */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-badge">
                        <span>🕸️</span> Notes Application
                    </div>
                    <h1 className="hero-title">
                        <span className="title-line">Take notes</span>
                        <span className="title-line accent">Terribly</span>
                        <span className="title-line">efficient</span>
                    </h1>
                    <p className="hero-description">
                        Organize your ideas in a Halloween atmosphere.
                        Folders, Markdown notes, PDF export...
                        Everything you need to be productive, with style.
                    </p>
                    <div className="hero-actions">
                        {user ? (
                            <Link to="/" className="cta-btn primary">
                                <span>Access my notes</span>
                                <span className="btn-icon">→</span>
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="cta-btn primary">
                                    <span>Start for free</span>
                                    <span className="btn-icon">→</span>
                                </Link>
                                <Link to="/login" className="cta-btn secondary">
                                    <span>I already have an account</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Visual preview: fake interface screenshot with 3D effect */}
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
                                <div className="preview-folder">📁 Projects</div>
                                <div className="preview-folder">📁 Ideas</div>
                                <div className="preview-note active">📝 My note</div>
                            </div>
                            <div className="preview-content">
                                <div className="preview-note-title">🎃 Welcome!</div>
                                <div className="preview-text-line"></div>
                                <div className="preview-text-line short"></div>
                                <div className="preview-text-line"></div>
                            </div>
                        </div>
                    </div>
                    <div className="preview-glow"></div>
                </div>
            </section>

            {/* Features grid with icons and descriptions */}
            <section className="features">
                <h2 className="section-title">
                    Features
                </h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">📁</div>
                        <h3>Nested folders</h3>
                        <p>Organize your notes in an unlimited folder tree</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">✍️</div>
                        <h3>Markdown editor</h3>
                        <p>Format your notes with a powerful WYSIWYG editor</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📄</div>
                        <h3>PDF export</h3>
                        <p>Export your notes to PDF with one click</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📦</div>
                        <h3>ZIP export</h3>
                        <p>Download all your notes in one archive</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💾</div>
                        <h3>Auto-save</h3>
                        <p>Your notes are saved automatically</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🎃</div>
                        <h3>Halloween theme</h3>
                        <p>A unique interface to work in style</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <span className="footer-logo">🎃 Spooky Notes</span>
                    <span className="footer-text">Hackathon AEMT 2026 Project</span>
                </div>
            </footer>
        </div>
    );
}

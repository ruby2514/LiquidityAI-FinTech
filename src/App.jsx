import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Icon from './components/Icon';
import ProfilePanel from './components/ProfilePanel';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import GraphPage from './pages/GraphPage';
import PipelinePage from './pages/PipelinePage';
import EntityResolutionPage from './pages/EntityResolutionPage';
import LLMOrchestratorPage from './pages/LLMOrchestratorPage';
import ViewsPage from './pages/ViewsPage';
import ProvenancePage from './pages/ProvenancePage';
import SecurityPage from './pages/SecurityPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
    const { user, isAuthenticated, loading, login, register, logout, error, setError, isAdmin, isSuperAdmin } = useAuth();
    const [activePage, setActivePage] = useState("dashboard");
    const [authMode, setAuthMode] = useState("login");
    const [profileOpen, setProfileOpen] = useState(false);

    if (loading) {
        return (
            <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0C10' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 28, fontWeight: 700, color: '#2DD4BF', marginBottom: 8 }}>Liquidity.ai</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#4A5568' }}>Initializing secure session...</div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        if (authMode === 'register') {
            return <RegisterPage onRegister={register} onSwitchToLogin={() => { setAuthMode('login'); setError(null); }} error={error} setError={setError} />;
        }
        return <LoginPage onLogin={login} onSwitchToRegister={() => { setAuthMode('register'); setError(null); }} error={error} setError={setError} />;
    }

    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: "dashboard" },
        { id: "graph", label: "Knowledge Graph", icon: "graph" },
        { id: "pipeline", label: "Ingestion Pipeline", icon: "pipeline" },
        { id: "er", label: "Entity Resolution", icon: "entity", badge: "31" },
        { id: "llm", label: "LLM Orchestrator", icon: "llm" },
        { id: "views", label: "Views & Personas", icon: "views" },
        { id: "provenance", label: "Provenance & Audit", icon: "audit" },
        { id: "security", label: "Security & Compliance", icon: "security", roles: ['super_admin', 'admin', 'auditor'] },
        { id: "settings", label: "Settings", icon: "settings", roles: ['super_admin', 'admin'] },
    ];

    const visibleNav = navItems.filter(item => !item.roles || item.roles.includes(user.role));
    const pageTitle = navItems.find(n => n.id === activePage)?.label || "Dashboard";

    const pages = {
        dashboard: <DashboardPage />,
        graph: <GraphPage />,
        pipeline: <PipelinePage />,
        er: <EntityResolutionPage />,
        llm: <LLMOrchestratorPage />,
        views: <ViewsPage />,
        provenance: <ProvenancePage />,
        security: <SecurityPage />,
        settings: <SettingsPage />,
    };

    const coreItems = visibleNav.filter(n => ['dashboard', 'graph', 'pipeline'].includes(n.id));
    const intelItems = visibleNav.filter(n => ['er', 'llm', 'views'].includes(n.id));
    const govItems = visibleNav.filter(n => ['provenance', 'security', 'settings'].includes(n.id));

    return (
        <div className="liq-app">
            <aside className="sidebar">
                <div className="logo-area">
                    <div className="logo-wordmark">Liquidity.ai</div>
                    <div className="logo-sub">Financial Intelligence Graph</div>
                    <div className="status-pill"><div className="status-dot" />SSOT · Live</div>
                </div>

                <nav className="nav-section">
                    {coreItems.length > 0 && <div className="nav-group-label">Core Platform</div>}
                    {coreItems.map(item => (
                        <div key={item.id} className={`nav-item ${activePage === item.id ? "active" : ""}`} onClick={() => setActivePage(item.id)}>
                            <Icon name={item.icon} size={14} />{item.label}
                            {item.badge && <span className="nav-badge">{item.badge}</span>}
                        </div>
                    ))}

                    {intelItems.length > 0 && <div className="nav-group-label">Intelligence</div>}
                    {intelItems.map(item => (
                        <div key={item.id} className={`nav-item ${activePage === item.id ? "active" : ""}`} onClick={() => setActivePage(item.id)}>
                            <Icon name={item.icon} size={14} />{item.label}
                            {item.badge && <span className="nav-badge">{item.badge}</span>}
                        </div>
                    ))}

                    {govItems.length > 0 && <div className="nav-group-label">Governance</div>}
                    {govItems.map(item => (
                        <div key={item.id} className={`nav-item ${activePage === item.id ? "active" : ""}`} onClick={() => setActivePage(item.id)}>
                            <Icon name={item.icon} size={14} />{item.label}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-card" onClick={() => setProfileOpen(true)} style={{ cursor: 'pointer' }}>
                        <div className="user-avatar">{user.avatarInitials || user.displayName?.slice(0, 2).toUpperCase()}</div>
                        <div className="user-info">
                            <div className="user-name">{user.displayName}</div>
                            <div className="user-role">{user.role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
                        </div>
                        <div style={{ padding: 4, borderRadius: 4, color: 'var(--accent)' }}>
                            <Icon name="chevron" size={12} />
                        </div>
                    </div>
                </div>
            </aside>

            <div className="main-content">
                <header className="topbar">
                    <div className="breadcrumb">
                        <span>Liquidity.ai</span>
                        <span className="breadcrumb-sep">/</span>
                        <span className="breadcrumb-current">{pageTitle}</span>
                    </div>
                    <div className="topbar-actions">
                        <div className="search-bar" style={{ maxWidth: 240 }}>
                            <Icon name="search" size={12} color="#4A5568" />
                            <input placeholder="Search entities, orgs, funds..." />
                        </div>
                        <div className="icon-btn" style={{ position: "relative" }}>
                            <Icon name="bell" size={14} />
                            <div className="notif-dot" style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6 }} />
                        </div>
                        <div className="icon-btn"><Icon name="key" size={14} /></div>
                        <div className="tag tag-green mono" style={{ fontSize: 9 }}>SOC2 ✓</div>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 6, padding: '3px 8px',
                            background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 6,
                            fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#C9A84C', cursor: 'pointer',
                        }} onClick={() => setProfileOpen(true)}>
                            {user.displayName}
                        </div>
                    </div>
                </header>

                <main className="page-content">
                    {pages[activePage]}
                </main>
            </div>

            <ProfilePanel isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
        </div>
    );
}

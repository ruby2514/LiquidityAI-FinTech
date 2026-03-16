import { useState } from 'react';

const LoginPage = ({ onLogin, onSwitchToRegister, error, setError }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const result = await onLogin(email, password);
        setLoading(false);
        if (!result.ok && result.code === 'ACCOUNT_LOCKED') {
            setError(`Account locked. Try again in ${result.minutesLeft} minute(s).`);
        }
    };

    return (
        <div style={{
            width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#0A0C10',
            backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(201,168,76,0.06) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 80% 80%, rgba(45,212,191,0.04) 0%, transparent 50%)',
        }}>
            <div style={{
                width: 400, maxWidth: '90vw', background: '#0F1318', border: '1px solid #21283A', borderRadius: 12,
                padding: '40px 36px', position: 'relative', overflow: 'hidden',
            }}>
                {/* Accent glow */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }} />

                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 28, fontWeight: 700, color: '#2DD4BF', letterSpacing: '0.04em', marginBottom: 6 }}>Liquidity.ai</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#4A5568', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Financial Intelligence Graph</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 20, padding: '3px 8px', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#34D399', marginTop: 10 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#34D399', boxShadow: '0 0 6px #34D399' }} />SSOT · Secure
                    </div>
                </div>

                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: '#E8ECF2', textAlign: 'center', marginBottom: 6 }}>Sign In</div>
                <div style={{ fontSize: 12, color: '#4A5568', textAlign: 'center', marginBottom: 24 }}>Enter your credentials to access the platform</div>

                {error && (
                    <div style={{
                        background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8,
                        padding: '10px 14px', fontSize: 12, color: '#F87171', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                        <span>⚠</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8892A4', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Email</label>
                        <input
                            type="email" value={email} onChange={e => setEmail(e.target.value)} required
                            placeholder="you@company.com"
                            style={{
                                width: '100%', background: '#0A0C10', border: '1px solid #21283A', borderRadius: 6,
                                padding: '10px 12px', fontSize: 13, color: '#E8ECF2', fontFamily: 'Syne, sans-serif', outline: 'none',
                                boxSizing: 'border-box', transition: 'border-color 0.15s',
                            }}
                            onFocus={e => e.target.style.borderColor = '#C9A84C'}
                            onBlur={e => e.target.style.borderColor = '#21283A'}
                        />
                    </div>
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8892A4', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                                placeholder="••••••••"
                                style={{
                                    width: '100%', background: '#0A0C10', border: '1px solid #21283A', borderRadius: 6,
                                    padding: '10px 12px', fontSize: 13, color: '#E8ECF2', fontFamily: 'Syne, sans-serif', outline: 'none',
                                    boxSizing: 'border-box', transition: 'border-color 0.15s',
                                }}
                                onFocus={e => e.target.style.borderColor = '#C9A84C'}
                                onBlur={e => e.target.style.borderColor = '#21283A'}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', color: '#4A5568', cursor: 'pointer', fontSize: 16,
                            }}>{showPassword ? '🙈' : '👁'}</button>
                        </div>
                    </div>
                    <button type="submit" disabled={loading} style={{
                        width: '100%', padding: '11px 0', borderRadius: 6, border: 'none', cursor: loading ? 'wait' : 'pointer',
                        background: loading ? '#8B6F2E' : '#C9A84C', color: '#0A0C10', fontSize: 13, fontWeight: 700, fontFamily: 'Syne, sans-serif',
                        transition: 'background 0.15s', letterSpacing: '0.02em',
                    }}>
                        {loading ? '● Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: '#4A5568' }}>
                    Don't have an account? {' '}
                    <span onClick={onSwitchToRegister} style={{ color: '#C9A84C', cursor: 'pointer', fontWeight: 600 }}>Sign Up</span>
                </div>

                <div style={{ marginTop: 20, textAlign: 'center', display: 'flex', justifyContent: 'center', gap: 16 }}>
                    {[{ icon: '🔐', label: 'SOC 2 Type II' }, { icon: '🔒', label: 'AES-256' }, { icon: '🛡️', label: 'RBAC' }].map((b, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: '#4A5568', fontFamily: 'JetBrains Mono, monospace' }}>
                            <span>{b.icon}</span>{b.label}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

import { useState } from 'react';
import Icon from '../components/Icon';

const RegisterPage = ({ onRegister, onSwitchToLogin, error, setError }) => {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [department, setDepartment] = useState('');
    const [title, setTitle] = useState('');
    const [reason, setReason] = useState('');
    const [referral, setReferral] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPw, setShowPw] = useState(false);

    const strength = (() => {
        if (!password) return { score: 0, label: '', color: '#4A5568' };
        let s = 0;
        if (password.length >= 8) s++;
        if (password.length >= 12) s++;
        if (/[A-Z]/.test(password)) s++;
        if (/[a-z]/.test(password)) s++;
        if (/[0-9]/.test(password)) s++;
        if (/[^A-Za-z0-9]/.test(password)) s++;
        if (s <= 2) return { score: s, label: 'Weak', color: '#F87171' };
        if (s <= 4) return { score: s, label: 'Fair', color: '#FBBF24' };
        return { score: s, label: 'Strong', color: '#34D399' };
    })();

    const checks = [
        { test: password.length >= 8, label: '8+ characters' },
        { test: /[A-Z]/.test(password), label: 'Uppercase letter' },
        { test: /[a-z]/.test(password), label: 'Lowercase letter' },
        { test: /[0-9]/.test(password), label: 'Number' },
        { test: /[^A-Za-z0-9]/.test(password), label: 'Special character' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (password !== confirmPassword) { setError('Passwords do not match'); return; }
        setLoading(true);
        const result = await onRegister(displayName, email, password, department, title, reason, referral);
        setLoading(false);
        if (result?.ok) setSuccess(true);
    };

    if (success) {
        return (
            <div className="auth-wrapper">
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
                    <div style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 22, fontWeight: 700, color: '#C9A84C', marginBottom: 8 }}>Request Submitted</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
                        Your access request has been submitted for review. An administrator will evaluate your request and assign the appropriate access level.
                    </div>
                    <div className="er-card" style={{ textAlign: 'left', marginBottom: 20 }}>
                        <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', marginBottom: 8 }}>WHAT HAPPENS NEXT</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {['Your request is scored for risk assessment', 'An admin reviews your details and access reason', 'You receive platform access once approved'].map((step, i) => (
                                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--text-secondary)' }}>
                                    <span className="tag tag-blue" style={{ fontSize: 9, minWidth: 18, textAlign: 'center' }}>{i + 1}</span> {step}
                                </div>
                            ))}
                        </div>
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={onSwitchToLogin}>Back to Sign In</button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-wrapper">
            <div className="auth-card" style={{ maxWidth: 440 }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 28, fontWeight: 700, color: '#2DD4BF', marginBottom: 4 }}>Liquidity.ai</div>
                    <div className="mono" style={{ fontSize: 9, color: '#4A5568', letterSpacing: 3 }}>REQUEST ACCESS</div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label className="form-label">FULL NAME *</label>
                            <input className="form-input" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" required />
                        </div>
                        <div>
                            <label className="form-label">EMAIL *</label>
                            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                        <div>
                            <label className="form-label">DEPARTMENT</label>
                            <input className="form-input" value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g. Engineering" />
                        </div>
                        <div>
                            <label className="form-label">TITLE / ROLE</label>
                            <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Data Analyst" />
                        </div>
                    </div>

                    <label className="form-label" style={{ marginTop: 12 }}>REASON FOR ACCESS *</label>
                    <textarea className="form-input" rows={2} value={reason} onChange={e => setReason(e.target.value)}
                        placeholder="Briefly describe why you need access to the platform..." required
                        style={{ resize: 'none', fontFamily: 'inherit' }} />

                    <label className="form-label" style={{ marginTop: 12 }}>REFERRAL CODE</label>
                    <input className="form-input" value={referral} onChange={e => setReferral(e.target.value)}
                        placeholder="Optional — from an existing team member" />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                        <div>
                            <label className="form-label">PASSWORD *</label>
                            <div style={{ position: 'relative' }}>
                                <input className="form-input" type={showPw ? 'text' : 'password'} value={password}
                                    onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                                <span onClick={() => setShowPw(!showPw)} style={{
                                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                                    cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12,
                                }}>{showPw ? '🔒' : '👁'}</span>
                            </div>
                        </div>
                        <div>
                            <label className="form-label">CONFIRM *</label>
                            <input className="form-input" type="password" value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
                        </div>
                    </div>

                    {password && (
                        <div style={{ marginTop: 8 }}>
                            <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < strength.score ? strength.color : 'var(--border)' }} />
                                ))}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {checks.map((c, i) => (
                                    <span key={i} className={`tag ${c.test ? 'tag-green' : 'tag-gray'}`} style={{ fontSize: 9 }}>
                                        {c.test ? '✓' : '○'} {c.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && <div className="alert alert-error mt-12" style={{ fontSize: 11 }}>{error}</div>}

                    <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: 16 }} disabled={loading}>
                        {loading ? 'Submitting...' : 'Request Access'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                    Already have access? <span onClick={onSwitchToLogin} style={{ color: '#C9A84C', cursor: 'pointer', fontWeight: 600 }}>Sign In</span>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;

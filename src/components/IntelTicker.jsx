import { useState, useEffect, useRef } from 'react';

const TICKER_ITEMS = [
    { label: 'ER Queue', value: '31', unit: 'pending', icon: '🔗', color: '#F87171', pulse: true },
    { label: 'Graph Entities', value: '847,293', unit: '', icon: '📊', color: '#2DD4BF', trend: '+2.4%', up: true },
    { label: 'Pipeline Throughput', value: '4,218', unit: 'rec/min', icon: '⚡', color: '#60A5FA', trend: '+8%', up: true },
    { label: 'ER Precision', value: '98.7%', unit: '7d avg', icon: '🎯', color: '#34D399', trend: '+0.3pp', up: true },
    { label: 'LLM Cost Today', value: '$142', unit: 'of $200', icon: '💰', color: '#A78BFA', trend: '-12%', up: true },
    { label: 'Data Freshness', value: '42s', unit: 'avg lag', icon: '🕐', color: '#2DD4BF' },
    { label: 'SOC 2 Controls', value: '24/24', unit: 'passing', icon: '🛡️', color: '#34D399' },
    { label: 'Active Sources', value: '12', unit: 'connected', icon: '🔌', color: '#60A5FA' },
    { label: 'Provenance', value: '99.9%', unit: 'coverage', icon: '📜', color: '#2DD4BF', trend: 'SLO Met', up: true },
    { label: 'HITL Reviews', value: '7', unit: 'today', icon: '👤', color: '#FBBF24' },
    { label: 'Canonical Orgs', value: '312,440', unit: '', icon: '🏢', color: '#A78BFA', trend: '+1.2k', up: true },
    { label: 'API Calls', value: '48.2k', unit: '24h', icon: '📡', color: '#60A5FA', trend: '+5%', up: true },
];

export default function IntelTicker() {
    const scrollRef = useRef(null);
    const [offset, setOffset] = useState(0);
    const animRef = useRef(null);
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        let last = performance.now();
        const speed = 40; // px/s

        const tick = (now) => {
            if (!hovered) {
                const dt = (now - last) / 1000;
                setOffset(prev => {
                    const el = scrollRef.current;
                    if (!el) return prev;
                    const half = el.scrollWidth / 2;
                    const next = prev + speed * dt;
                    return next >= half ? next - half : next;
                });
            }
            last = now;
            animRef.current = requestAnimationFrame(tick);
        };

        animRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animRef.current);
    }, [hovered]);

    // Duplicate items for seamless loop
    const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

    return (
        <div
            className="intel-ticker"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className="ticker-label">
                <span className="ticker-pulse" />
                LIVE
            </div>
            <div className="ticker-track">
                <div
                    ref={scrollRef}
                    className="ticker-scroll"
                    style={{ transform: `translateX(-${offset}px)` }}
                >
                    {items.map((item, i) => (
                        <div key={i} className="ticker-item">
                            <span className="ticker-icon">{item.icon}</span>
                            <span className="ticker-item-label">{item.label}</span>
                            <span className="ticker-item-value" style={{ color: item.color }}>
                                {item.value}
                            </span>
                            {item.unit && (
                                <span className="ticker-item-unit">{item.unit}</span>
                            )}
                            {item.trend && (
                                <span className={`ticker-trend ${item.up ? 'up' : 'down'}`}>
                                    {item.up ? '↑' : '↓'}{item.trend}
                                </span>
                            )}
                            {item.pulse && (
                                <span className="ticker-alert-dot" />
                            )}
                            <span className="ticker-sep">│</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

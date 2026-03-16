import Icon from '../components/Icon';
import Sparkline from '../components/Sparkline';
import ConfidenceRing from '../components/ConfidenceRing';
import IntelTicker from '../components/IntelTicker';

const DashboardPage = () => {
    const kpis = [
        { label: "Canonical Entities", value: "847,293", change: "+2.4%", up: true, spark: [40, 45, 43, 55, 60, 58, 72, 80, 75, 90, 88, 95] },
        { label: "ER Precision (7d avg)", value: "98.7%", change: "+0.3pp", up: true, spark: [92, 93, 94, 93, 95, 96, 96, 97, 97, 98, 98, 99] },
        { label: "Provenance Coverage", value: "99.9%", change: "SLO Met", up: true, spark: [99, 99, 99, 99, 100, 99, 99, 100, 100, 99, 100, 100] },
        { label: "LLM Cost / Record", value: "$0.0024", change: "-12%", up: true, spark: [38, 36, 32, 30, 28, 29, 27, 26, 26, 25, 24, 24] },
    ];

    const ingestQueue = [
        { source: "PitchBook CSV Batch", records: "142,888", status: "processing", stage: 4, trust: "High" },
        { source: "SEC EDGAR Filings", records: "8,440", status: "complete", stage: 8, trust: "Regulatory" },
        { source: "LinkedIn Profiles (PDF)", records: "2,100", status: "llm_queue", stage: 5, trust: "Medium" },
        { source: "Firm Websites (crawl)", records: "580", status: "review", stage: 6, trust: "Low" },
        { source: "Crunchbase API", records: "48,200", status: "complete", stage: 8, trust: "High" },
    ];

    const hitlQueue = [
        { entity: "Accel Partners vs. Accel LLP", score: 74, type: "ORG_MERGE", priority: "High", age: "2h" },
        { entity: "John Lim (Tiger Global)", score: 61, type: "PERSON_DEDUP", priority: "Med", age: "5h" },
        { entity: "Fund: Lightspeed X vs XI", score: 83, type: "FUND_MERGE", priority: "Low", age: "12h" },
        { entity: "Deal: Databricks Series F", score: 56, type: "DEAL_CONFLICT", priority: "High", age: "1h" },
    ];

    const stageNames = ["Raw", "Validate", "Map", "Parse", "Embed", "LLM", "ER", "QA", "Canon"];
    const stageEmoji = ["📦", "✅", "🗺️", "⚙️", "🔢", "🤖", "🔗", "🔍", "✨"];

    return (
        <div>
            <div className="section-header">
                <div>
                    <div className="section-title">Knowledge Graph Overview</div>
                    <div className="section-subtitle">Liquidity.ai SSOT · Live · Updated 42s ago</div>
                </div>
                <div className="flex gap-8 items-center">
                    <div className="tag tag-green">● All Systems Nominal</div>
                    <button className="btn btn-secondary"><Icon name="export" size={12} /> Export Report</button>
                    <button className="btn btn-primary"><Icon name="upload" size={12} /> Ingest Source</button>
                </div>
            </div>

            {/* Live Intel Ticker */}
            <IntelTicker />

            {/* KPIs */}
            <div className="grid-4 mb-16">
                {kpis.map((k, i) => (
                    <div key={i} className="card card-accent" style={{ paddingBottom: 20 }}>
                        <div className="stat-label mb-8">{k.label}</div>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="stat-value">{k.value}</div>
                                <div className={`stat-change ${k.up ? "up" : "down"}`}>
                                    {k.up ? "↑" : "↓"} {k.change}
                                </div>
                            </div>
                            <Sparkline data={k.spark} color={k.up ? "#34D399" : "#F87171"} height={36} width={70} />
                        </div>
                        <div className="stat-accent-bar" />
                    </div>
                ))}
            </div>

            <div className="grid-2-1 mb-16">
                {/* Pipeline Status */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title"><Icon name="pipeline" size={14} />Active Ingestion Pipeline</div>
                        <div className="flex gap-6">
                            <span className="tag tag-amber">5 Active</span>
                            <button className="btn btn-ghost" style={{ padding: "2px 8px" }}><Icon name="refresh" size={11} /></button>
                        </div>
                    </div>

                    {/* Stage bar visual */}
                    <div style={{ marginBottom: 16, padding: "10px 0" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                            {stageNames.map((s, i) => (
                                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                                    <div style={{
                                        width: 30, height: 30, borderRadius: "50%",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 13,
                                        background: i < 5 ? "rgba(52,211,153,0.1)" : i === 5 ? "rgba(201,168,76,0.15)" : "rgba(33,40,58,0.5)",
                                        border: `1.5px solid ${i < 5 ? "#34D399" : i === 5 ? "#C9A84C" : "#21283A"}`,
                                        boxShadow: i === 5 ? "0 0 12px rgba(201,168,76,0.3)" : "none",
                                    }}>
                                        {stageEmoji[i]}
                                    </div>
                                    <div style={{ fontSize: 8, color: "#4A5568", marginTop: 4, fontFamily: "JetBrains Mono", letterSpacing: "0.04em" }}>{s}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ height: 3, borderRadius: 2, background: "#21283A", position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "62%", background: "linear-gradient(90deg,#0D7B55,#34D399)", borderRadius: 2 }} />
                            <div style={{ position: "absolute", left: "62%", top: 0, height: "100%", width: "7%", background: "linear-gradient(90deg,#8B6F2E,#C9A84C)", borderRadius: 2, animation: "pulse 1.5s infinite" }} />
                        </div>
                    </div>

                    <div className="table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr><th>Source</th><th>Records</th><th>Stage</th><th>Trust</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                {ingestQueue.map((r, i) => (
                                    <tr key={i}>
                                        <td style={{ color: "var(--text-primary)", fontWeight: 500, maxWidth: 160 }} className="truncate">{r.source}</td>
                                        <td className="mono">{r.records}</td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <div className="progress-bar" style={{ width: 60 }}>
                                                    <div className="progress-fill accent" style={{ width: `${(r.stage / 8) * 100}%` }} />
                                                </div>
                                                <span className="mono text-muted text-xs">{stageNames[r.stage - 1]}</span>
                                            </div>
                                        </td>
                                        <td><span className={`tag ${r.trust === "Regulatory" ? "tag-blue" : r.trust === "High" ? "tag-green" : r.trust === "Medium" ? "tag-amber" : "tag-gray"}`}>{r.trust}</span></td>
                                        <td><span className={`tag ${r.status === "complete" ? "tag-green" : r.status === "processing" ? "tag-amber" : r.status === "review" ? "tag-red" : "tag-purple"}`}>{r.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* HITL Queue */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title"><Icon name="merge" size={14} />HITL Review Queue</div>
                        <span className="nav-badge">4 pending</span>
                    </div>
                    {hitlQueue.map((h, i) => (
                        <div key={i} className="er-card review" style={{ marginBottom: 8 }}>
                            <div className="flex items-start gap-10">
                                <ConfidenceRing value={h.score} color={h.score > 80 ? "#34D399" : h.score > 65 ? "#C9A84C" : "#F87171"} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className="flex items-center gap-6 mb-4">
                                        <span className="tag tag-purple" style={{ fontSize: 9 }}>{h.type}</span>
                                        <span className={`tag ${h.priority === "High" ? "tag-red" : h.priority === "Med" ? "tag-amber" : "tag-gray"}`} style={{ fontSize: 9 }}>{h.priority}</span>
                                    </div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{h.entity}</div>
                                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "JetBrains Mono" }}>Queued {h.age} ago</div>
                                    <div className="flex gap-6 mt-8">
                                        <button className="btn btn-secondary" style={{ padding: "3px 10px", fontSize: 11, gap: 4 }}><Icon name="check" size={10} color="#34D399" /> Merge</button>
                                        <button className="btn btn-danger" style={{ padding: "3px 10px", fontSize: 11, gap: 4 }}><Icon name="x" size={10} /> Split</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button className="btn btn-ghost w-full" style={{ marginTop: 4 }}>View All 31 Items →</button>
                </div>
            </div>

            {/* Bottom row */}
            <div className="grid-3">
                {/* Entity Distribution */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title"><Icon name="graph" size={14} />Entity Distribution</div>
                    </div>
                    {[
                        { type: "Organizations", count: "312,440", pct: 37, color: "#C9A84C" },
                        { type: "Persons", count: "198,820", pct: 23, color: "#60A5FA" },
                        { type: "Funds/Vehicles", count: "142,200", pct: 17, color: "#2DD4BF" },
                        { type: "Deals/Transactions", count: "112,600", pct: 13, color: "#A78BFA" },
                        { type: "Industry Tags", count: "81,233", pct: 10, color: "#34D399" },
                    ].map((e, i) => (
                        <div key={i} style={{ marginBottom: 10 }}>
                            <div className="flex justify-between mb-4">
                                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{e.type}</span>
                                <span style={{ fontSize: 12, fontFamily: "JetBrains Mono", color: "var(--text-primary)" }}>{e.count}</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${e.pct}%`, background: `linear-gradient(90deg, ${e.color}60, ${e.color})` }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Model Cost */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title"><Icon name="cost" size={14} />LLM Cost This Month</div>
                        <span className="tag tag-green">Under Budget</span>
                    </div>
                    <div style={{ fontFamily: "Libre Baskerville", fontSize: 26, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>$4,218</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12 }}>of $6,000 budget · 70.3% utilized</div>
                    <div className="progress-bar mb-16" style={{ height: 6 }}>
                        <div className="progress-fill accent" style={{ width: "70%" }} />
                    </div>
                    {[
                        { model: "claude-sonnet-4", task: "ER Adjudication", cost: "$1,840", pct: 44 },
                        { model: "gemini-flash-2", task: "PDF Parsing", cost: "$940", pct: 22 },
                        { model: "llama-3.1-8b", task: "Schema Mapping", cost: "$620", pct: 15 },
                        { model: "claude-haiku-4", task: "NER / Classify", cost: "$818", pct: 19 },
                    ].map((m, i) => (
                        <div key={i} className="metric-row">
                            <div>
                                <div className="metric-name">{m.task}</div>
                                <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "JetBrains Mono" }}>{m.model}</div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="progress-bar" style={{ width: 40 }}>
                                    <div className="progress-fill accent" style={{ width: `${m.pct}%` }} />
                                </div>
                                <div className="metric-val">{m.cost}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Audit Timeline */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title"><Icon name="audit" size={14} />Recent Audit Events</div>
                    </div>
                    {[
                        { icon: "🔗", title: "Auto-merge: Accel Partners (2 orgs)", desc: "Confidence 96% · anchors: LEI match", time: "4m ago", color: "#34D399" },
                        { icon: "👤", title: "Human approved: Sarah Guo dedup", desc: "Reviewer: analyst_02 · 2 approvals", time: "22m ago", color: "#60A5FA" },
                        { icon: "⚠️", title: "Conflict flagged: AUM mismatch", desc: "PitchBook vs SEC filing · Δ $2.1B", time: "1h ago", color: "#C9A84C" },
                        { icon: "🔒", title: "SOC 2 control verified: CC6.1", desc: "Logical access review passed", time: "6h ago", color: "#A78BFA" },
                        { icon: "📊", title: "Accuracy report published", desc: "Top 5k orgs: 98.9% precision", time: "1d ago", color: "#2DD4BF" },
                    ].map((e, i) => (
                        <div key={i} className="timeline-item">
                            <div className="timeline-dot" style={{ background: `${e.color}15`, borderColor: `${e.color}40` }}>{e.icon}</div>
                            <div className="timeline-content">
                                <div className="timeline-title">{e.title}</div>
                                <div className="timeline-desc">{e.desc}</div>
                                <div className="timeline-time">{e.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;

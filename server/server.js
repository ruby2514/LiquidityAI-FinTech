import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createNetServer } from 'net';
import { execSync } from 'child_process';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import apiKeyRoutes from './routes/apiKeyRoutes.js';
import policyRoutes from './routes/policyRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// ───────────── SECURITY HEADERS ─────────────
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));

// ───────────── CORS ─────────────
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({
    origin: corsOrigin === '*' ? true : corsOrigin,
    credentials: true,
}));

// ───────────── BODY PARSING ─────────────
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// ───────────── RATE LIMITING ─────────────
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many login attempts. Try again in 15 minutes.', code: 'RATE_LIMITED' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip,
});

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { error: 'Too many requests. Slow down.', code: 'RATE_LIMITED' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', loginLimiter);
app.use('/api/', apiLimiter);

// ───────────── API ROUTES ─────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/keys', apiKeyRoutes);
app.use('/api/policies', policyRoutes);

// ───────────── HEALTH CHECK ─────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'operational',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '2.0.0',
        features: ['rbac', 'risk-scoring', 'sessions', 'api-keys', 'policies', 'audit'],
    });
});

// ───────────── SERVE FRONTEND (Production) ─────────────
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(distPath, 'index.html'));
    }
});

// ───────────── ERROR HANDLER ─────────────
app.use((err, req, res, _next) => {
    console.error('[ERROR]', err.message);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        code: 'SERVER_ERROR',
    });
});

// ───────────── INTELLIGENT STARTUP ─────────────


function isPortFree(port) {
    return new Promise((resolve) => {
        const srv = createNetServer();
        srv.once('error', () => resolve(false));
        srv.once('listening', () => { srv.close(); resolve(true); });
        srv.listen(port, '0.0.0.0');
    });
}

function identifyBlocker(port) {
    try {
        // Check if a Docker container is using the port
        const dockerCheck = execSync(
            `docker ps --filter "publish=${port}" --format "{{.Names}}"`,
            { encoding: 'utf-8', timeout: 3000 }
        ).trim();
        if (dockerCheck) return { type: 'docker', name: dockerCheck };
    } catch (_) { }

    try {
        // On Windows, use netstat to find what's using the port
        const netstat = execSync(
            `netstat -ano | findstr :${port} | findstr LISTENING`,
            { encoding: 'utf-8', timeout: 3000 }
        ).trim();
        if (netstat) {
            const pid = netstat.split(/\s+/).pop();
            try {
                const taskInfo = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, { encoding: 'utf-8', timeout: 3000 }).trim();
                const processName = taskInfo.split(',')[0]?.replace(/"/g, '') || 'unknown';
                return { type: 'process', name: processName, pid };
            } catch (_) { }
            return { type: 'process', name: 'unknown', pid };
        }
    } catch (_) { }

    return { type: 'unknown' };
}

async function startServer() {
    const isDev = process.env.NODE_ENV !== 'production';
    let port = PORT;

    const free = await isPortFree(port);

    if (!free) {
        const blocker = identifyBlocker(port);

        if (blocker.type === 'docker') {
            console.log(`\n⚠️  Port ${port} is in use by Docker container: "${blocker.name}"`);
            if (isDev) {
                console.log(`   → Searching for a free port...`);
            } else {
                console.log(`   → Stop it first: docker stop ${blocker.name}`);
                console.log(`   → Or from Docker Desktop: click Stop on "${blocker.name}"\n`);
                process.exit(1);
            }
        } else if (blocker.type === 'process') {
            console.log(`\n⚠️  Port ${port} is in use by: ${blocker.name} (PID ${blocker.pid})`);
            if (isDev) {
                console.log(`   → Searching for a free port...`);
            } else {
                console.log(`   → Kill it: taskkill /F /PID ${blocker.pid}\n`);
                process.exit(1);
            }
        } else {
            console.log(`\n⚠️  Port ${port} is in use by an unknown process.`);
            if (!isDev) process.exit(1);
        }

        // In dev mode, auto-find next free port
        if (isDev) {
            for (let p = port + 1; p <= port + 20; p++) {
                if (await isPortFree(p)) { port = p; break; }
            }
            if (port === PORT) {
                console.log(`   ✕ Could not find a free port in range ${PORT}–${PORT + 20}. Exiting.\n`);
                process.exit(1);
            }
            console.log(`   ✓ Auto-switched to port ${port}\n`);
        }
    }

    app.listen(port, '0.0.0.0', () => {
        console.log(`\n🔐 Liquidity.ai API Server running on http://0.0.0.0:${port}`);
        console.log(`   Rate limiting: 10 auth / 15min, 100 api / 1min`);
        console.log(`   CORS origin:   ${corsOrigin}`);
        console.log(`   Features:      RBAC · Risk Scoring · Sessions · API Keys · Policies`);
        console.log(`   Audit:         Immutable append-only logging enabled`);
        if (port !== PORT) {
            console.log(`   ⚠ NOTE:        Running on port ${port} (${PORT} was busy)`);
            console.log(`   → Update your frontend proxy or env to point to ${port}`);
        }
        console.log('');
    });
}

startServer();

export default app;

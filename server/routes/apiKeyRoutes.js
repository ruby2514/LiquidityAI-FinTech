import { Router } from 'express';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { queries, logAudit } from '../db.js';
import { authenticate, hashToken } from '../middleware/auth.js';

const router = Router();

const VALID_SCOPES = ['read', 'write', 'graph', 'pipeline', 'audit'];

// Create API key
router.post('/', authenticate, (req, res) => {
    try {
        const { name, scopes = ['read'], expiresInDays = 90 } = req.body;
        if (!name || name.trim().length < 2) return res.status(400).json({ error: 'Key name required (min 2 chars)' });

        const invalidScopes = scopes.filter(s => !VALID_SCOPES.includes(s));
        if (invalidScopes.length) return res.status(400).json({ error: `Invalid scopes: ${invalidScopes.join(', ')}` });

        // Generate key: liq_sk_<random>
        const rawKey = `liq_sk_${crypto.randomBytes(32).toString('hex')}`;
        const keyHash = hashToken(rawKey);
        const keyPrefix = rawKey.slice(0, 16) + '...';

        const id = uuidv4();
        const expiresAt = new Date(Date.now() + expiresInDays * 86400000).toISOString();

        queries.createApiKey.run(id, req.user.id, name.trim(), keyHash, keyPrefix, JSON.stringify(scopes), expiresAt);

        logAudit({
            actorId: req.user.id, actorEmail: req.user.email, actorRole: req.user.role,
            action: 'API_KEY_CREATED', targetType: 'api_key', targetId: id,
            details: { name: name.trim(), scopes, expiresInDays },
            ip: req.ip,
        });

        // Key shown only once
        res.status(201).json({
            id,
            name: name.trim(),
            key: rawKey,
            prefix: keyPrefix,
            scopes,
            expiresAt,
            warning: 'Copy this key now. It will not be shown again.',
        });
    } catch (err) {
        console.error('API key create error:', err);
        res.status(500).json({ error: 'Failed to create API key' });
    }
});

// List own API keys
router.get('/', authenticate, (req, res) => {
    try {
        const keys = queries.getApiKeysByUser.all(req.user.id);
        res.json(keys.map(k => ({
            ...k,
            scopes: JSON.parse(k.scopes || '[]'),
        })));
    } catch (err) {
        res.status(500).json({ error: 'Failed to list keys' });
    }
});

// Revoke API key
router.delete('/:id', authenticate, (req, res) => {
    try {
        queries.revokeApiKey.run(req.params.id, req.user.id);

        logAudit({
            actorId: req.user.id, actorEmail: req.user.email, actorRole: req.user.role,
            action: 'API_KEY_REVOKED', targetType: 'api_key', targetId: req.params.id,
            ip: req.ip,
        });

        res.json({ message: 'API key revoked' });
    } catch (err) {
        res.status(500).json({ error: 'Revoke failed' });
    }
});

export default router;

const jwt = require('jsonwebtoken');

const getJwtSecret = () => process.env.JWT_SECRET || 'pw2-development-secret';

const extractTokenFromHeader = (authorizationHeader) => {
    if (!authorizationHeader || typeof authorizationHeader !== 'string') {
        return null;
    }

    const [scheme, token] = authorizationHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return null;
    }

    return token;
};

const authenticateToken = (req, res, next) => {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
        return res.status(401).json({ message: 'Token de autorizacion requerido' });
    }

    try {
        const decoded = jwt.verify(token, getJwtSecret());
        req.user = {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email,
            is_admin: Boolean(decoded.is_admin)
        };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token invalido o expirado' });
    }
};

const requireAdmin = (req, res, next) => {
    if (!req.user?.is_admin) {
        return res.status(403).json({ message: 'Solo un administrador puede realizar esta accion' });
    }

    next();
};

module.exports = {
    authenticateToken,
    requireAdmin,
    getJwtSecret
};
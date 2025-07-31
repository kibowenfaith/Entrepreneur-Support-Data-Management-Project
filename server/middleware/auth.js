const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ 
                message: 'Access token required',
                error: 'No token provided'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ 
                message: 'Invalid token',
                error: 'User not found'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({ 
                message: 'Account deactivated',
                error: 'User account is not active'
            });
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                message: 'Invalid token',
                error: 'Token verification failed'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Token expired',
                error: 'Please login again'
            });
        }

        console.error('Auth middleware error:', error);
        res.status(500).json({ 
            message: 'Authentication error',
            error: 'Internal server error'
        });
    }
};

// Middleware to check if user owns the resource
const checkResourceOwnership = (resourceModel) => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params.id;
            const resource = await resourceModel.findById(resourceId);

            if (!resource) {
                return res.status(404).json({ 
                    message: 'Resource not found'
                });
            }

            // Check if user owns the resource
            if (resource.userId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ 
                    message: 'Access denied',
                    error: 'You can only access your own resources'
                });
            }

            req.resource = resource;
            next();
        } catch (error) {
            console.error('Resource ownership check error:', error);
            res.status(500).json({ 
                message: 'Authorization error',
                error: 'Internal server error'
            });
        }
    };
};

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { 
            expiresIn: '7d',
            issuer: 'entrepreneur-support-api'
        }
    );
};

// Verify token without middleware (for optional auth)
const verifyTokenOptional = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);
            
            if (user && user.isActive) {
                req.user = user;
            }
        }
        
        next();
    } catch (error) {
        // Continue without user if token is invalid
        next();
    }
};

module.exports = {
    authenticateToken,
    checkResourceOwnership,
    generateToken,
    verifyTokenOptional
};

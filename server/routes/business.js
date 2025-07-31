const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Business = require('../models/Business');
const { authenticateToken, checkResourceOwnership, verifyTokenOptional } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateBusiness = [
    body('businessName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Business name must be between 2 and 100 characters'),
    body('description')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Description must be between 10 and 500 characters'),
    body('startedAt')
        .isInt({ min: 1900, max: new Date().getFullYear() })
        .withMessage('Start year must be between 1900 and current year'),
    body('businessField')
        .isIn(['Agriculture', 'Technology', 'Healthcare', 'Education', 'Finance', 'Retail', 'Manufacturing', 'Services'])
        .withMessage('Please select a valid business field'),
    body('isPublic')
        .optional()
        .isBoolean()
        .withMessage('isPublic must be a boolean value')
];

const validateIncomeRecord = [
    body('year')
        .isInt({ min: 1900, max: new Date().getFullYear() })
        .withMessage('Year must be between 1900 and current year'),
    body('amount')
        .isFloat({ min: 0 })
        .withMessage('Amount must be a positive number')
];

const validateFunder = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Funder name must be between 2 and 100 characters'),
    body('method')
        .isIn(['Grant', 'Loan', 'Investment', 'Donation'])
        .withMessage('Please select a valid funding method'),
    body('amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Amount must be a positive number')
];

// @route   POST /api/business
// @desc    Create a new business profile
// @access  Private
router.post('/', [authenticateToken, ...validateBusiness], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        // Check if user already has a business profile
        const existingBusiness = await Business.findOne({ userId: req.user._id });
        if (existingBusiness) {
            return res.status(409).json({
                message: 'Business profile creation failed',
                error: 'You already have a business profile. Use PUT to update it.'
            });
        }

        const businessData = {
            ...req.body,
            userId: req.user._id,
            businessField: req.body.businessField || req.user.businessField
        };

        const business = new Business(businessData);
        await business.save();

        // Populate user data
        await business.populate('userId', 'name email businessField');

        res.status(201).json({
            message: 'Business profile created successfully',
            business
        });

    } catch (error) {
        console.error('Create business error:', error);
        res.status(500).json({
            message: 'Failed to create business profile',
            error: 'Internal server error'
        });
    }
});

// @route   GET /api/business/me
// @desc    Get current user's business profile
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const business = await Business.findOne({ userId: req.user._id })
            .populate('userId', 'name email businessField');

        if (!business) {
            return res.status(404).json({
                message: 'Business profile not found',
                error: 'You haven\'t created a business profile yet'
            });
        }

        res.json({
            message: 'Business profile retrieved successfully',
            business
        });

    } catch (error) {
        console.error('Get business error:', error);
        res.status(500).json({
            message: 'Failed to get business profile',
            error: 'Internal server error'
        });
    }
});

// @route   PUT /api/business/:id
// @desc    Update business profile
// @access  Private
router.put('/:id', [
    authenticateToken,
    checkResourceOwnership(Business),
    ...validateBusiness.map(validator => validator.optional())
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const business = req.resource;
        const allowedUpdates = [
            'businessName', 'description', 'startedAt', 'businessField',
            'isPublic', 'businessLogo', 'location', 'website', 'phoneNumber',
            'socialMedia', 'tags', 'status'
        ];

        // Update only allowed fields
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                business[field] = req.body[field];
            }
        });

        await business.save();
        await business.populate('userId', 'name email businessField');

        res.json({
            message: 'Business profile updated successfully',
            business
        });

    } catch (error) {
        console.error('Update business error:', error);
        res.status(500).json({
            message: 'Failed to update business profile',
            error: 'Internal server error'
        });
    }
});

// @route   DELETE /api/business/:id
// @desc    Delete business profile
// @access  Private
router.delete('/:id', [
    authenticateToken,
    checkResourceOwnership(Business)
], async (req, res) => {
    try {
        await Business.findByIdAndDelete(req.params.id);

        res.json({
            message: 'Business profile deleted successfully'
        });

    } catch (error) {
        console.error('Delete business error:', error);
        res.status(500).json({
            message: 'Failed to delete business profile',
            error: 'Internal server error'
        });
    }
});

// @route   GET /api/business
// @desc    Get all public business profiles with optional filtering
// @access  Public
router.get('/', [
    query('field')
        .optional()
        .isIn(['Agriculture', 'Technology', 'Healthcare', 'Education', 'Finance', 'Retail', 'Manufacturing', 'Services'])
        .withMessage('Invalid business field'),
    query('city')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('City must be between 2 and 50 characters'),
    query('status')
        .optional()
        .isIn(['Active', 'Inactive', 'Seeking Investment', 'Expanding'])
        .withMessage('Invalid status'),
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50')
], verifyTokenOptional, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { field, city, status, page = 1, limit = 10 } = req.query;
        
        // Build filter object
        const filter = { isPublic: true };
        if (field) filter.businessField = field;
        if (city) filter['location.city'] = new RegExp(city, 'i');
        if (status) filter.status = status;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get businesses with pagination
        const businesses = await Business.find(filter)
            .populate('userId', 'name email businessField')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await Business.countDocuments(filter);

        res.json({
            message: 'Public business profiles retrieved successfully',
            businesses,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalBusinesses: total,
                hasNext: skip + businesses.length < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Get businesses error:', error);
        res.status(500).json({
            message: 'Failed to get business profiles',
            error: 'Internal server error'
        });
    }
});

// @route   GET /api/business/:id
// @desc    Get specific business profile
// @access  Public (if public) / Private (if owner)
router.get('/:id', verifyTokenOptional, async (req, res) => {
    try {
        const business = await Business.findById(req.params.id)
            .populate('userId', 'name email businessField');

        if (!business) {
            return res.status(404).json({
                message: 'Business profile not found'
            });
        }

        // Check if user can view this business
        const isOwner = req.user && business.userId._id.toString() === req.user._id.toString();
        const isPublic = business.isPublic;

        if (!isPublic && !isOwner) {
            return res.status(403).json({
                message: 'Access denied',
                error: 'This business profile is private'
            });
        }

        res.json({
            message: 'Business profile retrieved successfully',
            business
        });

    } catch (error) {
        console.error('Get business by ID error:', error);
        res.status(500).json({
            message: 'Failed to get business profile',
            error: 'Internal server error'
        });
    }
});

// @route   POST /api/business/:id/income
// @desc    Add income record to business
// @access  Private
router.post('/:id/income', [
    authenticateToken,
    checkResourceOwnership(Business),
    ...validateIncomeRecord
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { year, amount } = req.body;
        const business = req.resource;

        await business.addIncomeRecord(year, amount);
        await business.populate('userId', 'name email businessField');

        res.json({
            message: 'Income record added successfully',
            business
        });

    } catch (error) {
        console.error('Add income record error:', error);
        res.status(500).json({
            message: 'Failed to add income record',
            error: 'Internal server error'
        });
    }
});

// @route   POST /api/business/:id/funders
// @desc    Add funder to business
// @access  Private
router.post('/:id/funders', [
    authenticateToken,
    checkResourceOwnership(Business),
    ...validateFunder
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const business = req.resource;
        await business.addFunder(req.body);
        await business.populate('userId', 'name email businessField');

        res.json({
            message: 'Funder added successfully',
            business
        });

    } catch (error) {
        console.error('Add funder error:', error);
        res.status(500).json({
            message: 'Failed to add funder',
            error: 'Internal server error'
        });
    }
});

// @route   GET /api/business/stats/overview
// @desc    Get platform statistics
// @access  Public
router.get('/stats/overview', async (req, res) => {
    try {
        const totalBusinesses = await Business.countDocuments({ isPublic: true });
        const businessesByField = await Business.aggregate([
            { $match: { isPublic: true } },
            { $group: { _id: '$businessField', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const activeBusinesses = await Business.countDocuments({ 
            isPublic: true, 
            status: 'Active' 
        });

        res.json({
            message: 'Platform statistics retrieved successfully',
            stats: {
                totalBusinesses,
                activeBusinesses,
                businessesByField,
                lastUpdated: new Date()
            }
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            message: 'Failed to get platform statistics',
            error: 'Internal server error'
        });
    }
});

module.exports = router;

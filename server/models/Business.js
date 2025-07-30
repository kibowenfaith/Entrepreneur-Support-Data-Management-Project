const mongoose = require('mongoose');

const incomeRecordSchema = new mongoose.Schema({
    year: {
        type: Number,
        required: [true, 'Year is required'],
        min: [1900, 'Year must be after 1900'],
        max: [new Date().getFullYear(), 'Year cannot be in the future']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount must be positive']
    }
}, { _id: false });

const funderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Funder name is required'],
        trim: true,
        maxlength: [100, 'Funder name cannot exceed 100 characters']
    },
    method: {
        type: String,
        required: [true, 'Funding method is required'],
        enum: ['Grant', 'Loan', 'Investment', 'Donation']
    },
    amount: {
        type: Number,
        min: [0, 'Amount must be positive'],
        default: null
    },
    dateReceived: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const businessSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    businessName: {
        type: String,
        required: [true, 'Business name is required'],
        trim: true,
        maxlength: [100, 'Business name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Business description is required'],
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    startedAt: {
        type: Number,
        required: [true, 'Start year is required'],
        min: [1900, 'Start year must be after 1900'],
        max: [new Date().getFullYear(), 'Start year cannot be in the future']
    },
    businessField: {
        type: String,
        required: [true, 'Business field is required'],
        enum: [
            'Agriculture',
            'Technology', 
            'Healthcare',
            'Education',
            'Finance',
            'Retail',
            'Manufacturing',
            'Services'
        ]
    },
    incomeRecords: {
        type: [incomeRecordSchema],
        default: []
    },
    funders: {
        type: [funderSchema],
        default: []
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    businessLogo: {
        type: String,
        default: null
    },
    location: {
        city: {
            type: String,
            trim: true,
            maxlength: [50, 'City name cannot exceed 50 characters']
        },
        country: {
            type: String,
            trim: true,
            maxlength: [50, 'Country name cannot exceed 50 characters'],
            default: 'Kenya'
        }
    },
    website: {
        type: String,
        trim: true,
        match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
    },
    phoneNumber: {
        type: String,
        trim: true,
        match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
    },
    socialMedia: {
        facebook: String,
        twitter: String,
        linkedin: String,
        instagram: String
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: [30, 'Tag cannot exceed 30 characters']
    }],
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Seeking Investment', 'Expanding'],
        default: 'Active'
    }
}, {
    timestamps: true
});

// Index for better query performance
businessSchema.index({ userId: 1 });
businessSchema.index({ businessField: 1 });
businessSchema.index({ isPublic: 1 });
businessSchema.index({ 'location.city': 1 });

// Virtual for total income
businessSchema.virtual('totalIncome').get(function() {
    return this.incomeRecords.reduce((total, record) => total + record.amount, 0);
});

// Virtual for latest income year
businessSchema.virtual('latestIncomeYear').get(function() {
    if (this.incomeRecords.length === 0) return null;
    return Math.max(...this.incomeRecords.map(record => record.year));
});

// Virtual for total funders
businessSchema.virtual('totalFunders').get(function() {
    return this.funders.length;
});

// Virtual for business age
businessSchema.virtual('businessAge').get(function() {
    return new Date().getFullYear() - this.startedAt;
});

// Ensure virtual fields are serialized
businessSchema.set('toJSON', { virtuals: true });
businessSchema.set('toObject', { virtuals: true });

// Static method to find public businesses
businessSchema.statics.findPublicBusinesses = function(filter = {}) {
    return this.find({ isPublic: true, ...filter })
        .populate('userId', 'name email businessField')
        .sort({ createdAt: -1 });
};

// Static method to find businesses by field
businessSchema.statics.findByField = function(field, isPublic = true) {
    const query = { businessField: field };
    if (isPublic) query.isPublic = true;
    
    return this.find(query)
        .populate('userId', 'name email businessField')
        .sort({ createdAt: -1 });
};

// Method to add income record
businessSchema.methods.addIncomeRecord = function(year, amount) {
    // Check if record for this year already exists
    const existingIndex = this.incomeRecords.findIndex(record => record.year === year);
    
    if (existingIndex >= 0) {
        // Update existing record
        this.incomeRecords[existingIndex].amount = amount;
    } else {
        // Add new record
        this.incomeRecords.push({ year, amount });
    }
    
    // Sort by year
    this.incomeRecords.sort((a, b) => a.year - b.year);
    return this.save();
};

// Method to add funder
businessSchema.methods.addFunder = function(funderData) {
    this.funders.push(funderData);
    return this.save();
};

module.exports = mongoose.model('Business', businessSchema);

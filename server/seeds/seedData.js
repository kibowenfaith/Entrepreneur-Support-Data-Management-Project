const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Business = require('../models/Business');

// Load environment variables
dotenv.config();

// Sample users data
const sampleUsers = [
    {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "password123",
        businessField: "Agriculture"
    },
    {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        password: "password123",
        businessField: "Technology"
    },
    {
        name: "Dr. Mary Johnson",
        email: "mary.johnson@example.com",
        password: "password123",
        businessField: "Healthcare"
    },
    {
        name: "David Wilson",
        email: "david.wilson@example.com",
        password: "password123",
        businessField: "Education"
    },
    {
        name: "Sarah Brown",
        email: "sarah.brown@example.com",
        password: "password123",
        businessField: "Finance"
    }
];

// Sample businesses data (will be linked to users after creation)
const sampleBusinesses = [
    {
        businessName: "Green Farm Solutions",
        description: "Sustainable agriculture solutions for small-scale farmers in Kenya. We provide organic farming techniques, modern irrigation systems, and crop management services.",
        startedAt: 2020,
        businessField: "Agriculture",
        incomeRecords: [
            { year: 2020, amount: 50000 },
            { year: 2021, amount: 75000 },
            { year: 2022, amount: 120000 },
            { year: 2023, amount: 180000 }
        ],
        funders: [
            { name: "AgriBank Kenya", method: "Loan", amount: 100000 },
            { name: "Green Initiative Fund", method: "Grant", amount: 50000 }
        ],
        isPublic: true,
        location: {
            city: "Nairobi",
            country: "Kenya"
        },
        website: "https://greenfarm.co.ke",
        phoneNumber: "+254 700 123 456",
        status: "Active",
        tags: ["organic", "sustainable", "irrigation"]
    },
    {
        businessName: "TechStart Kenya",
        description: "Mobile app development company specializing in fintech and e-commerce solutions for African markets. We build scalable applications for businesses.",
        startedAt: 2019,
        businessField: "Technology",
        incomeRecords: [
            { year: 2019, amount: 30000 },
            { year: 2020, amount: 85000 },
            { year: 2021, amount: 150000 },
            { year: 2022, amount: 220000 },
            { year: 2023, amount: 300000 }
        ],
        funders: [
            { name: "Tech Accelerator Africa", method: "Investment", amount: 200000 },
            { name: "Innovation Fund", method: "Grant", amount: 75000 }
        ],
        isPublic: true,
        location: {
            city: "Nairobi",
            country: "Kenya"
        },
        website: "https://techstart.co.ke",
        phoneNumber: "+254 700 234 567",
        socialMedia: {
            twitter: "@techstartke",
            linkedin: "techstart-kenya"
        },
        status: "Expanding",
        tags: ["mobile", "fintech", "ecommerce"]
    },
    {
        businessName: "HealthCare Plus",
        description: "Affordable healthcare services for rural communities. We provide telemedicine consultations, mobile clinics, and health education programs.",
        startedAt: 2021,
        businessField: "Healthcare",
        incomeRecords: [
            { year: 2021, amount: 40000 },
            { year: 2022, amount: 90000 },
            { year: 2023, amount: 140000 }
        ],
        funders: [
            { name: "Health Foundation Kenya", method: "Grant", amount: 120000 },
            { name: "Community Development Bank", method: "Loan", amount: 80000 }
        ],
        isPublic: true,
        location: {
            city: "Kisumu",
            country: "Kenya"
        },
        phoneNumber: "+254 700 345 678",
        status: "Active",
        tags: ["telemedicine", "rural", "community"]
    },
    {
        businessName: "EduTech Solutions",
        description: "Digital learning platform providing online courses and educational content for K-12 students in Kenya. Interactive learning with local curriculum focus.",
        startedAt: 2022,
        businessField: "Education",
        incomeRecords: [
            { year: 2022, amount: 25000 },
            { year: 2023, amount: 60000 }
        ],
        funders: [
            { name: "Education Innovation Fund", method: "Grant", amount: 40000 }
        ],
        isPublic: true,
        location: {
            city: "Mombasa",
            country: "Kenya"
        },
        website: "https://edutech.co.ke",
        phoneNumber: "+254 700 456 789",
        status: "Seeking Investment",
        tags: ["education", "online", "k12"]
    },
    {
        businessName: "FinServe Micro",
        description: "Microfinance institution providing small loans and financial services to women entrepreneurs and small business owners in rural areas.",
        startedAt: 2018,
        businessField: "Finance",
        incomeRecords: [
            { year: 2018, amount: 80000 },
            { year: 2019, amount: 120000 },
            { year: 2020, amount: 95000 },
            { year: 2021, amount: 160000 },
            { year: 2022, amount: 200000 },
            { year: 2023, amount: 250000 }
        ],
        funders: [
            { name: "Women Empowerment Fund", method: "Grant", amount: 150000 },
            { name: "Microfinance Bank", method: "Investment", amount: 300000 }
        ],
        isPublic: true,
        location: {
            city: "Eldoret",
            country: "Kenya"
        },
        phoneNumber: "+254 700 567 890",
        status: "Active",
        tags: ["microfinance", "women", "rural"]
    }
];

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🧹 Clearing existing data...');
        await User.deleteMany({});
        await Business.deleteMany({});
        console.log('✅ Existing data cleared');

        // Create users
        console.log('👥 Creating users...');
        const createdUsers = [];
        
        for (let userData of sampleUsers) {
            const user = new User(userData);
            await user.save();
            createdUsers.push(user);
            console.log(`✅ Created user: ${user.name} (${user.email})`);
        }

        // Create businesses and link to users
        console.log('🏢 Creating businesses...');
        
        for (let i = 0; i < sampleBusinesses.length; i++) {
            const businessData = {
                ...sampleBusinesses[i],
                userId: createdUsers[i]._id
            };
            
            const business = new Business(businessData);
            await business.save();
            console.log(`✅ Created business: ${business.businessName} for ${createdUsers[i].name}`);
        }

        // Display summary
        const totalUsers = await User.countDocuments();
        const totalBusinesses = await Business.countDocuments();
        const publicBusinesses = await Business.countDocuments({ isPublic: true });

        console.log('\n📊 Seeding Summary:');
        console.log(`👥 Total Users: ${totalUsers}`);
        console.log(`🏢 Total Businesses: ${totalBusinesses}`);
        console.log(`🌐 Public Businesses: ${publicBusinesses}`);

        console.log('\n🔐 Sample Login Credentials:');
        sampleUsers.forEach(user => {
            console.log(`📧 ${user.email} | 🔑 ${user.password}`);
        });

        console.log('\n🎉 Database seeding completed successfully!');
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

// Run the seeding function
if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase, sampleUsers, sampleBusinesses };

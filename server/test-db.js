const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Simple test to verify database connection and operations
async function testDatabase() {
    try {
        console.log('🔄 Connecting to MongoDB Atlas...');
        
        
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('✅ Connected to MongoDB Atlas');
        console.log('📊 Database:', mongoose.connection.name);
        
        // Test creating a simple document
        const testSchema = new mongoose.Schema({
            name: String,
            createdAt: { type: Date, default: Date.now }
        });
        
        const TestModel = mongoose.model('Test', testSchema);
        
        console.log('🔄 Testing database write operation...');
        
        const testDoc = new TestModel({
            name: 'Connection Test ' + new Date().toISOString()
        });
        
        await testDoc.save();
        console.log('✅ Successfully wrote to database');
        
        // Test reading from database
        console.log('🔄 Testing database read operation...');
        const docs = await TestModel.find().limit(5);
        console.log(`✅ Successfully read ${docs.length} documents from database`);
        
        // Clean up test document
        await TestModel.deleteOne({ _id: testDoc._id });
        console.log('✅ Test document cleaned up');
        
        console.log('🎉 Database connection and operations working correctly!');
        
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
        console.error('Full error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

testDatabase();

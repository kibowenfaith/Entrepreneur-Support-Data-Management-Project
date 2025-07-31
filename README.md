# Entrepreneur Support Platform

A full-stack MERN application for entrepreneurs to manage their business profiles, track income, manage funders, and connect with other entrepreneurs.

## 🚀 Features

- **User Authentication**: JWT-based registration and login
- **Business Profile Management**: Create and manage business profiles
- **Income Tracking**: Visual charts showing business growth over time
- **Funder Management**: Track grants, loans, investments, and donations
- **Public Profiles**: Discover other entrepreneurs with filtering by business field
- **Interactive Chatbot**: Get help navigating the platform
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

### Frontend
- **HTML5** with semantic markup
- **CSS3** with modern styling
- **Vanilla JavaScript** with ES6+
- **Chart.js** for data visualization
- **Font Awesome** for icons

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)
- **MongoDB** (local installation or MongoDB Atlas account)

## 🚀 Getting Started

### Project Structure
```
Entrepreneur-Support-Data-Management-Project/
├── client/                 # Frontend files
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   └── package.json
├── server/                 # Backend files
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── seeds/
├── start-backend.bat       # Start backend server
├── start-frontend.bat      # Start frontend server
└── README.md
```

### Quick Start (Separate Terminals)

#### Option 1: Using Batch Files (Windows)
1. **Start Backend**: Double-click `start-backend.bat`
2. **Start Frontend**: Double-click `start-frontend.bat`

#### Option 2: Manual Commands

**Terminal 1 - Backend:**
```bash
cd server
npm install
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm install
npm start
```

### Environment Configuration

The backend uses a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/entrepreneur-support
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
```

**For MongoDB Atlas (cloud database):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/entrepreneur-support
```

## 🌐 Access Points

Once both servers are running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Business Management
- `GET /api/business/me` - Get current user's business profile
- `POST /api/business` - Create business profile
- `PUT /api/business/:id` - Update business profile
- `GET /api/business` - Get all public business profiles
- `GET /api/business?field=Technology` - Filter profiles by business field

## 📊 Database Schema

### User Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  businessField: String,
  createdAt: Date
}
```

### Business Collection
```javascript
{
  userId: ObjectId (ref: User),
  businessName: String,
  description: String,
  startedAt: Number,
  incomeRecords: [{
    year: Number,
    amount: Number
  }],
  funders: [{
    name: String,
    method: String
  }],
  isPublic: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎯 Usage Instructions

### 1. Register/Login
- Click "Register" to create a new account
- Select your business field from the dropdown
- Login with your credentials

### 2. Create Business Profile
- Go to Dashboard after logging in
- Click "Create Profile"
- Fill in your business details
- Choose to make it public or private

### 3. Track Income
- Click "Add Income Record" in the dashboard
- Enter year and amount
- View your growth chart

### 4. Manage Funders
- Click "Add Funder" to track funding sources
- Select funding type (Grant, Loan, Investment, Donation)

### 5. Explore Profiles
- Visit the "Profiles" section
- Filter by business field
- Click on profiles to view details

## 🐛 Troubleshooting

### Backend Issues
- **Server won't start**: Check if MongoDB is running
- **Database connection error**: Verify MONGODB_URI in .env file
- **Port already in use**: Change PORT in .env or kill process using port 5000

### Frontend Issues
- **API calls failing**: Ensure backend server is running on port 5000
- **CORS errors**: Check if CORS is properly configured in server.js
- **Charts not loading**: Verify Chart.js CDN is accessible

### Common Solutions
```bash
# Kill process on port 5000 (if needed)
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port 3000 (if needed)
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Restart MongoDB (if using local installation)
# Windows
net start MongoDB
```

## 🚀 Development Mode

For development with auto-reload:

**Backend (with nodemon):**
```bash
cd server
npm run dev
```

**Frontend (with cache disabled):**
```bash
cd client
npm run dev
```

## 🚀 Deployment

### Backend Deployment (Render/Railway)
1. Push code to GitHub
2. Connect repository to Render/Railway
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel/Netlify)
1. Update API_BASE_URL in script.js to production backend URL
2. Deploy to Vercel or Netlify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- **FaithJeptoo** - Frontend Development
- **GladysAngela** - Backend Development

## 📞 Support

For support, email support@entrepreneurhub.com or create an issue in the repository.

## 🔄 Running Both Servers

### Method 1: Separate Terminals (Recommended)
1. Open two terminal windows
2. In Terminal 1: `cd server && npm install && npm start`
3. In Terminal 2: `cd client && npm install && npm start`

### Method 2: Batch Files (Windows)
1. Double-click `start-backend.bat` (opens new window)
2. Double-click `start-frontend.bat` (opens new window)

### Method 3: Manual File Opening (Frontend Only)
If you don't want to use http-server for the frontend:
1. Start the backend using Method 1 or 2
2. Navigate to the `client` folder
3. Double-click `index.html` to open in browser

**Note**: Method 3 may have CORS issues depending on your browser settings.

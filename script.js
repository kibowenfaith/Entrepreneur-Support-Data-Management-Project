// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Global variables
let currentUser = null;
let currentBusiness = null;
let incomeChart = null;

// Sample data for demonstration (will be replaced with API calls later)
let sampleProfiles = [
    {
        id: 1,
        businessName: "Green Farm Solutions",
        description: "Sustainable agriculture solutions for small-scale farmers",
        field: "Agriculture",
        startedAt: 2020,
        owner: "John Doe",
        incomeRecords: [
            { year: 2020, amount: 50000 },
            { year: 2021, amount: 75000 },
            { year: 2022, amount: 120000 },
            { year: 2023, amount: 180000 }
        ],
        funders: [
            { name: "AgriBank", method: "Loan" },
            { name: "Green Initiative", method: "Grant" }
        ]
    },
    {
        id: 2,
        businessName: "TechStart Kenya",
        description: "Mobile app development for local businesses",
        field: "Technology",
        startedAt: 2019,
        owner: "Jane Smith",
        incomeRecords: [
            { year: 2019, amount: 30000 },
            { year: 2020, amount: 85000 },
            { year: 2021, amount: 150000 },
            { year: 2022, amount: 220000 },
            { year: 2023, amount: 300000 }
        ],
        funders: [
            { name: "Tech Accelerator", method: "Investment" },
            { name: "Innovation Fund", method: "Grant" }
        ]
    },
    {
        id: 3,
        businessName: "HealthCare Plus",
        description: "Affordable healthcare services for rural communities",
        field: "Healthcare",
        startedAt: 2021,
        owner: "Dr. Mary Johnson",
        incomeRecords: [
            { year: 2021, amount: 40000 },
            { year: 2022, amount: 90000 },
            { year: 2023, amount: 140000 }
        ],
        funders: [
            { name: "Health Foundation", method: "Grant" },
            { name: "Community Bank", method: "Loan" }
        ]
    }
];

// Chatbot responses
const chatbotResponses = {
    "hello": "Hello! Welcome to EntrepreneurHub. How can I help you today?",
    "hi": "Hi there! I'm here to assist you with the platform. What would you like to know?",
    "help": "I can help you with:\n• Creating your business profile\n• Adding income records\n• Managing funders\n• Navigating the platform\n• Finding other entrepreneurs\n\nWhat specific help do you need?",
    "profile": "To create your business profile:\n1. Click 'Register' to create an account\n2. Log in to your account\n3. Go to Dashboard\n4. Click 'Create Profile'\n5. Fill in your business details\n\nWould you like help with any specific step?",
    "income": "To add income records:\n1. Go to your Dashboard\n2. Click 'Add Income Record'\n3. Enter the year and amount\n4. Click 'Add Income'\n\nThis helps track your business growth over time!",
    "funders": "To add funders:\n1. Go to your Dashboard\n2. Click 'Add Funder'\n3. Enter funder name and method\n4. Click 'Add Funder'\n\nYou can track grants, loans, investments, and donations.",
    "register": "To register:\n1. Click the 'Register' button in the top navigation\n2. Fill in your name, email, and password\n3. Select your business field\n4. Click 'Register'\n\nAfter registration, you can log in and start building your profile!",
    "login": "To log in:\n1. Click the 'Login' button\n2. Enter your email and password\n3. Click 'Login'\n\nOnce logged in, you'll have access to your dashboard and can manage your business profile.",
    "default": "I'm not sure about that. You can ask me about:\n• Creating profiles\n• Adding income records\n• Managing funders\n• Registration and login\n• General platform help\n\nOr type 'help' for more options!"
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    setupEventListeners();
    setupNavigation();
    setupModals();
    setupChatbot();
    loadPublicProfiles();
    checkAuthStatus();
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.getElementById('hamburger').addEventListener('click', toggleMobileMenu);
    
    // Auth buttons
    document.getElementById('login-btn').addEventListener('click', () => openModal('login-modal'));
    document.getElementById('register-btn').addEventListener('click', () => openModal('register-modal'));
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // Hero buttons
    document.getElementById('get-started-btn').addEventListener('click', () => {
        if (currentUser) {
            showSection('dashboard');
        } else {
            openModal('register-modal');
        }
    });
    document.getElementById('learn-more-btn').addEventListener('click', () => showSection('about'));
    
    // Dashboard buttons
    document.getElementById('create-profile-btn').addEventListener('click', () => openModal('profile-modal'));
    document.getElementById('edit-profile-btn').addEventListener('click', () => openModal('profile-modal'));
    document.getElementById('add-income-btn').addEventListener('click', () => openModal('income-modal'));
    document.getElementById('add-funder-btn').addEventListener('click', () => openModal('funder-modal'));
    
    // Forms
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('profile-form').addEventListener('submit', handleProfileSave);
    document.getElementById('income-form').addEventListener('submit', handleIncomeAdd);
    document.getElementById('funder-form').addEventListener('submit', handleFunderAdd);
    document.getElementById('contact-form').addEventListener('submit', handleContactForm);
    
    // Filter
    document.getElementById('field-filter').addEventListener('change', filterProfiles);
}

// Setup navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute('href').substring(1);
            showSection(targetSection);
        });
    });
}

// Setup modals
function setupModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close');
    
    closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal.id);
        });
    });
    
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Switch between login and register
    document.getElementById('switch-to-register').addEventListener('click', (e) => {
        e.preventDefault();
        closeModal('login-modal');
        openModal('register-modal');
    });
    
    document.getElementById('switch-to-login').addEventListener('click', (e) => {
        e.preventDefault();
        closeModal('register-modal');
        openModal('login-modal');
    });
}

// Setup chatbot
function setupChatbot() {
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotBody = document.getElementById('chatbot-body');
    const chatbotHeader = document.getElementById('chatbot-header');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotSend = document.getElementById('chatbot-send');
    
    // Initialize chatbot as minimized
    let isMinimized = true;
    chatbotBody.style.display = 'none';
    chatbotToggle.innerHTML = '<i class="fas fa-plus"></i>';
    
    chatbotToggle.addEventListener('click', () => {
        if (isMinimized) {
            chatbotBody.style.display = 'flex';
            chatbotToggle.innerHTML = '<i class="fas fa-minus"></i>';
            isMinimized = false;
        } else {
            chatbotBody.style.display = 'none';
            chatbotToggle.innerHTML = '<i class="fas fa-plus"></i>';
            isMinimized = true;
        }
    });
    
    chatbotSend.addEventListener('click', sendChatMessage);
    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
}

// Navigation functions
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Update dashboard if showing dashboard
        if (sectionId === 'dashboard' && currentUser) {
            updateDashboard();
        }
    }
}

function toggleMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    navMenu.classList.toggle('active');
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    
    // Clear form if it exists
    const form = modal.querySelector('form');
    if (form) {
        form.reset();
    }
    
    // Set profile modal title based on whether editing or creating
    if (modalId === 'profile-modal') {
        const title = document.getElementById('profile-modal-title');
        if (currentBusiness) {
            title.textContent = 'Edit Business Profile';
            populateProfileForm();
        } else {
            title.textContent = 'Create Business Profile';
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Load user's business profile
            await loadUserBusiness();
            
            updateAuthUI();
            closeModal('login-modal');
            showSection('dashboard');
            showMessage('Login successful!', 'success');
        } else {
            showMessage(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const businessField = document.getElementById('register-field').value;
    
    if (!name || !email || !password || !businessField) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password, businessField })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            updateAuthUI();
            closeModal('register-modal');
            showSection('dashboard');
            showMessage('Registration successful! Welcome to EntrepreneurHub!', 'success');
        } else {
            showMessage(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

function logout() {
    currentUser = null;
    currentBusiness = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateAuthUI();
    showSection('home');
    showMessage('Logged out successfully', 'success');
}

// Load user's business profile from API
async function loadUserBusiness() {
    if (!currentUser) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/business/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.business) {
                currentBusiness = data.business;
            }
        }
    } catch (error) {
        console.error('Error loading business profile:', error);
    }
}

// Load public profiles from API
async function loadPublicProfilesFromAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/business`);
        if (response.ok) {
            const data = await response.json();
            return data.businesses || [];
        }
    } catch (error) {
        console.error('Error loading public profiles:', error);
    }
    return [];
}

function updateAuthUI() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutItem = document.getElementById('logout-item');
    const dashboardLink = document.getElementById('dashboard-link');
    
    if (currentUser) {
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        logoutItem.style.display = 'block';
        dashboardLink.style.display = 'block';
    } else {
        loginBtn.style.display = 'block';
        registerBtn.style.display = 'block';
        logoutItem.style.display = 'none';
        dashboardLink.style.display = 'none';
    }
}

function checkAuthStatus() {
    // Check if user is logged in (in a real app, check localStorage or session)
    updateAuthUI();
}

// Business profile functions
function handleProfileSave(e) {
    e.preventDefault();
    const businessName = document.getElementById('business-name').value;
    const description = document.getElementById('business-description').value;
    const startedAt = parseInt(document.getElementById('business-started').value);
    const isPublic = document.getElementById('business-public').checked;
    
    if (businessName && description && startedAt) {
        if (currentBusiness) {
            // Update existing business
            currentBusiness.businessName = businessName;
            currentBusiness.description = description;
            currentBusiness.startedAt = startedAt;
            currentBusiness.isPublic = isPublic;
        } else {
            // Create new business
            currentBusiness = {
                id: Date.now(),
                businessName: businessName,
                description: description,
                startedAt: startedAt,
                owner: currentUser.name,
                field: currentUser.businessField,
                isPublic: isPublic,
                incomeRecords: [],
                funders: []
            };
            
            // Add to sample profiles if public
            if (isPublic) {
                sampleProfiles.push(currentBusiness);
                loadPublicProfiles();
            }
        }
        
        updateDashboard();
        closeModal('profile-modal');
        showMessage('Business profile saved successfully!', 'success');
    } else {
        showMessage('Please fill in all required fields', 'error');
    }
}

function populateProfileForm() {
    if (currentBusiness) {
        document.getElementById('business-name').value = currentBusiness.businessName;
        document.getElementById('business-description').value = currentBusiness.description;
        document.getElementById('business-started').value = currentBusiness.startedAt;
        document.getElementById('business-public').checked = currentBusiness.isPublic;
    }
}

// Income functions
function handleIncomeAdd(e) {
    e.preventDefault();
    const year = parseInt(document.getElementById('income-year').value);
    const amount = parseFloat(document.getElementById('income-amount').value);
    
    if (year && amount && currentBusiness) {
        // Check if income for this year already exists
        const existingIndex = currentBusiness.incomeRecords.findIndex(record => record.year === year);
        
        if (existingIndex >= 0) {
            currentBusiness.incomeRecords[existingIndex].amount = amount;
        } else {
            currentBusiness.incomeRecords.push({ year, amount });
        }
        
        // Sort by year
        currentBusiness.incomeRecords.sort((a, b) => a.year - b.year);
        
        updateDashboard();
        closeModal('income-modal');
        showMessage('Income record added successfully!', 'success');
    } else {
        showMessage('Please fill in all fields', 'error');
    }
}

// Funder functions
function handleFunderAdd(e) {
    e.preventDefault();
    const name = document.getElementById('funder-name').value;
    const method = document.getElementById('funder-method').value;
    
    if (name && method && currentBusiness) {
        currentBusiness.funders.push({ name, method });
        
        updateDashboard();
        closeModal('funder-modal');
        showMessage('Funder added successfully!', 'success');
    } else {
        showMessage('Please fill in all fields', 'error');
    }
}

// Dashboard functions
function updateDashboard() {
    if (!currentUser) return;
    
    updateProfileInfo();
    updateIncomeChart();
    updateFundersList();
}

function updateProfileInfo() {
    const profileInfo = document.getElementById('profile-info');
    
    if (currentBusiness) {
        profileInfo.innerHTML = `
            <div class="profile-summary">
                <h4>${currentBusiness.businessName}</h4>
                <p><strong>Field:</strong> ${currentBusiness.field}</p>
                <p><strong>Started:</strong> ${currentBusiness.startedAt}</p>
                <p><strong>Description:</strong> ${currentBusiness.description}</p>
                <p><strong>Status:</strong> ${currentBusiness.isPublic ? 'Public' : 'Private'}</p>
            </div>
        `;
    } else {
        profileInfo.innerHTML = `
            <p>Complete your business profile to get started</p>
            <button class="btn btn-primary" id="create-profile-btn">Create Profile</button>
        `;
        
        // Re-attach event listener
        document.getElementById('create-profile-btn').addEventListener('click', () => openModal('profile-modal'));
    }
}

function updateIncomeChart() {
    const ctx = document.getElementById('incomeChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (incomeChart) {
        incomeChart.destroy();
    }
    
    if (currentBusiness && currentBusiness.incomeRecords.length > 0) {
        const years = currentBusiness.incomeRecords.map(record => record.year);
        const amounts = currentBusiness.incomeRecords.map(record => record.amount);
        
        incomeChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'Income (KSH)',
                    data: amounts,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'KSH ' + value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    } else {
        // Show empty state
        incomeChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['2020', '2021', '2022', '2023'],
                datasets: [{
                    label: 'No data available',
                    data: [0, 0, 0, 0],
                    borderColor: '#ccc',
                    backgroundColor: 'rgba(204, 204, 204, 0.1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

function updateFundersList() {
    const fundersList = document.getElementById('funders-list');
    
    if (currentBusiness && currentBusiness.funders.length > 0) {
        fundersList.innerHTML = currentBusiness.funders.map(funder => `
            <div class="funder-item">
                <div>
                    <strong>${funder.name}</strong>
                    <span class="funder-method">(${funder.method})</span>
                </div>
            </div>
        `).join('');
    } else {
        fundersList.innerHTML = '<p>No funders added yet</p>';
    }
}

// Public profiles functions
function loadPublicProfiles() {
    const profilesGrid = document.getElementById('profiles-grid');
    const publicProfiles = sampleProfiles.filter(profile => profile.isPublic !== false);
    
    if (publicProfiles.length > 0) {
        profilesGrid.innerHTML = publicProfiles.map(profile => `
            <div class="profile-card">
                <span class="profile-field">${profile.field}</span>
                <h3>${profile.businessName}</h3>
                <p><strong>Owner:</strong> ${profile.owner}</p>
                <p><strong>Started:</strong> ${profile.startedAt}</p>
                <p>${profile.description}</p>
                <div class="profile-stats">
                    <small><strong>Income Records:</strong> ${profile.incomeRecords.length}</small>
                    <small><strong>Funders:</strong> ${profile.funders.length}</small>
                </div>
            </div>
        `).join('');
    } else {
        profilesGrid.innerHTML = '<p class="text-center">No public profiles available yet.</p>';
    }
}

function filterProfiles() {
    const selectedField = document.getElementById('field-filter').value;
    const profilesGrid = document.getElementById('profiles-grid');
    
    let filteredProfiles = sampleProfiles.filter(profile => profile.isPublic !== false);
    
    if (selectedField) {
        filteredProfiles = filteredProfiles.filter(profile => profile.field === selectedField);
    }
    
    if (filteredProfiles.length > 0) {
        profilesGrid.innerHTML = filteredProfiles.map(profile => `
            <div class="profile-card">
                <span class="profile-field">${profile.field}</span>
                <h3>${profile.businessName}</h3>
                <p><strong>Owner:</strong> ${profile.owner}</p>
                <p><strong>Started:</strong> ${profile.startedAt}</p>
                <p>${profile.description}</p>
                <div class="profile-stats">
                    <small><strong>Income Records:</strong> ${profile.incomeRecords.length}</small>
                    <small><strong>Funders:</strong> ${profile.funders.length}</small>
                </div>
            </div>
        `).join('');
    } else {
        profilesGrid.innerHTML = '<p class="text-center">No profiles found for the selected field.</p>';
    }
}

// Contact form
function handleContactForm(e) {
    e.preventDefault();
    showMessage('Thank you for your message! We will get back to you soon.', 'success');
    e.target.reset();
}

// Chatbot functions
function sendChatMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim().toLowerCase();
    
    if (message) {
        addChatMessage(input.value, 'user');
        input.value = '';
        
        // Get bot response
        setTimeout(() => {
            const response = getBotResponse(message);
            addChatMessage(response, 'bot');
        }, 500);
    }
}

function addChatMessage(message, sender) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'user' ? 'user-message' : 'bot-message';
    messageDiv.innerHTML = `<p>${message}</p>`;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function getBotResponse(message) {
    // Check for keywords in the message
    for (const keyword in chatbotResponses) {
        if (message.includes(keyword)) {
            return chatbotResponses[keyword];
        }
    }
    
    return chatbotResponses.default;
}

// Utility functions
function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert at the top of the current section
    const activeSection = document.querySelector('.section.active');
    const container = activeSection.querySelector('.container') || activeSection;
    container.insertBefore(messageDiv, container.firstChild);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Initialize sample data on first load
function initializeSampleData() {
    // This function can be used to set up initial demo data
    // Currently using the sampleProfiles array defined at the top
}

// Profile Picture Functions
function initializeProfilePicture() {
    const profilePicturePreview = document.getElementById('profile-picture-preview');
    const profilePictureInput = document.getElementById('profile-picture');
    
    if (profilePicturePreview && profilePictureInput) {
        profilePicturePreview.addEventListener('click', () => {
            profilePictureInput.click();
        });
        
        profilePictureInput.addEventListener('change', handleProfilePictureChange);
    }
}

function handleProfilePictureChange(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('profile-picture-preview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Profile Picture">`;
            
            // Store the image data for later use
            if (currentBusiness) {
                currentBusiness.profilePicture = e.target.result;
            }
        };
        reader.readAsDataURL(file);
    }
}

// Enhanced Profile Loading with Click Functionality
function loadPublicProfiles() {
    const profilesGrid = document.getElementById('profiles-grid');
    const publicProfiles = sampleProfiles.filter(profile => profile.isPublic !== false);
    
    if (publicProfiles.length > 0) {
        profilesGrid.innerHTML = publicProfiles.map(profile => `
            <div class="profile-card" onclick="showProfileDetails(${profile.id})">
                <span class="profile-field">${profile.field}</span>
                <h3>${profile.businessName}</h3>
                <p><strong>Owner:</strong> ${profile.owner}</p>
                <p><strong>Started:</strong> ${profile.startedAt}</p>
                <p>${profile.description}</p>
                <div class="profile-stats">
                    <small><strong>Income Records:</strong> ${profile.incomeRecords.length}</small>
                    <small><strong>Funders:</strong> ${profile.funders.length}</small>
                </div>
            </div>
        `).join('');
    } else {
        profilesGrid.innerHTML = '<p class="text-center">No public profiles available yet.</p>';
    }
}

// Enhanced Filter with Click Functionality
function filterProfiles() {
    const selectedField = document.getElementById('field-filter').value;
    const profilesGrid = document.getElementById('profiles-grid');
    
    let filteredProfiles = sampleProfiles.filter(profile => profile.isPublic !== false);
    
    if (selectedField) {
        filteredProfiles = filteredProfiles.filter(profile => profile.field === selectedField);
    }
    
    if (filteredProfiles.length > 0) {
        profilesGrid.innerHTML = filteredProfiles.map(profile => `
            <div class="profile-card" onclick="showProfileDetails(${profile.id})">
                <span class="profile-field">${profile.field}</span>
                <h3>${profile.businessName}</h3>
                <p><strong>Owner:</strong> ${profile.owner}</p>
                <p><strong>Started:</strong> ${profile.startedAt}</p>
                <p>${profile.description}</p>
                <div class="profile-stats">
                    <small><strong>Income Records:</strong> ${profile.incomeRecords.length}</small>
                    <small><strong>Funders:</strong> ${profile.funders.length}</small>
                </div>
            </div>
        `).join('');
    } else {
        profilesGrid.innerHTML = '<p class="text-center">No profiles found for the selected field.</p>';
    }
}

// Profile Detail Modal Functions
function showProfileDetails(profileId) {
    const profile = sampleProfiles.find(p => p.id === profileId);
    if (!profile) return;
    
    const modal = document.getElementById('profile-detail-modal');
    const content = document.getElementById('profile-detail-content');
    
    content.innerHTML = `
        <div class="profile-detail-header">
            <div class="profile-detail-avatar">
                ${profile.profilePicture ? 
                    `<img src="${profile.profilePicture}" alt="${profile.businessName}">` : 
                    `<i class="fas fa-user-circle"></i>`
                }
            </div>
            <h2>${profile.businessName}</h2>
            <span class="profile-field">${profile.field}</span>
        </div>
        
        <div class="profile-detail-info">
            <div class="profile-detail-section">
                <h4><i class="fas fa-info-circle"></i> Business Information</h4>
                <p><strong>Owner:</strong> ${profile.owner}</p>
                <p><strong>Started:</strong> ${profile.startedAt}</p>
                <p><strong>Field:</strong> ${profile.field}</p>
                <p><strong>Description:</strong> ${profile.description}</p>
            </div>
            
            <div class="profile-detail-section">
                <h4><i class="fas fa-handshake"></i> Funders</h4>
                <div class="funders-list">
                    ${profile.funders.length > 0 ? 
                        profile.funders.map(funder => `
                            <div class="funder-tag">
                                <span>${funder.name}</span>
                                <span class="funder-method">${funder.method}</span>
                            </div>
                        `).join('') : 
                        '<p>No funders listed</p>'
                    }
                </div>
            </div>
        </div>
        
        ${profile.incomeRecords.length > 0 ? `
            <div class="income-chart-container">
                <h4><i class="fas fa-chart-line"></i> Income Overview</h4>
                <canvas id="profileIncomeChart" width="400" height="300"></canvas>
            </div>
        ` : ''}
    `;
    
    modal.style.display = 'block';
    
    // Create income chart if data exists
    if (profile.incomeRecords.length > 0) {
        setTimeout(() => {
            createProfileIncomeChart(profile.incomeRecords);
        }, 100);
    }
}

function createProfileIncomeChart(incomeRecords) {
    const ctx = document.getElementById('profileIncomeChart');
    if (!ctx) return;
    
    const years = incomeRecords.map(record => record.year);
    const amounts = incomeRecords.map(record => record.amount);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [{
                label: 'Income (KSH)',
                data: amounts,
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: '#667eea',
                borderWidth: 2,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'KSH ' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Enhanced Chart Sizing for Dashboard
function updateIncomeChart() {
    const ctx = document.getElementById('incomeChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (incomeChart) {
        incomeChart.destroy();
    }
    
    // Add chart-card class to the dashboard card
    const chartCard = ctx.closest('.dashboard-card');
    if (chartCard) {
        chartCard.classList.add('chart-card');
    }
    
    if (currentBusiness && currentBusiness.incomeRecords.length > 0) {
        const years = currentBusiness.incomeRecords.map(record => record.year);
        const amounts = currentBusiness.incomeRecords.map(record => record.amount);
        
        incomeChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'Income (KSH)',
                    data: amounts,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'KSH ' + value.toLocaleString();
                            }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                },
                elements: {
                    line: {
                        tension: 0.4
                    }
                }
            }
        });
    } else {
        // Show empty state with better styling
        incomeChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['2020', '2021', '2022', '2023'],
                datasets: [{
                    label: 'Add income records to see your growth',
                    data: [0, 0, 0, 0],
                    borderColor: '#ddd',
                    backgroundColor: 'rgba(221, 221, 221, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100000,
                        ticks: {
                            callback: function(value) {
                                return 'KSH ' + value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }
}

// Initialize Profile Detail Modal
function initializeProfileDetailModal() {
    const modal = document.getElementById('profile-detail-modal');
    const closeBtn = document.getElementById('profile-detail-close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

// Updated initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    initializeProfilePicture();
    initializeProfileDetailModal();
});

// Export functions for potential future use
window.EntrepreneurHub = {
    showSection,
    openModal,
    closeModal,
    currentUser,
    currentBusiness,
    showProfileDetails
};

// Demo Users Database (localStorage)
let users = JSON.parse(localStorage.getItem('roomkhoj_users')) || [
    {
        id: 1,
        name: 'Admin User',
        email: 'admin@roomkhoj.com',
        password: 'admin',
        createdAt: new Date().toISOString()
    }
];

let rooms = JSON.parse(localStorage.getItem('roomkhoj_rooms')) || [
    {
        id: 1,
        name: 'Cozy Studio in Kathmandu',
        budget: 15000,
        createdBy: 1,
        createdAt: new Date().toISOString(),
        description: 'Beautiful studio apartment'
    },
    {
        id: 2,
        name: 'Room in Baneswor',
        budget: 12000,
        createdBy: 1,
        createdAt: new Date().toISOString(),
        description: 'Shared apartment with facilities'
    }
];

let currentUser = JSON.parse(sessionStorage.getItem('roomkhoj_currentUser')) || null;

// Save to localStorage
function saveUsers() {
    localStorage.setItem('roomkhoj_users', JSON.stringify(users));
}

function saveRooms() {
    localStorage.setItem('roomkhoj_rooms', JSON.stringify(rooms));
}

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const tabBtns = document.querySelectorAll('.tab-btn');
const message = document.getElementById('message');
const dashboard = document.getElementById('dashboard');
const container = document.querySelector('.container');
const logoutBtn = document.getElementById('logoutBtn');
const userName = document.getElementById('userName');

// Tab Switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all
        tabBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.form-container').forEach(f => f.classList.remove('active'));

        // Add active to clicked
        btn.classList.add('active');
        const tabName = btn.getAttribute('data-tab');
        document.getElementById(tabName + 'Form').classList.add('active');
        
        // Clear message
        clearMessage();
    });
});

// Show Message
function showMessage(text, type) {
    message.textContent = text;
    message.className = 'message ' + type;
}

function clearMessage() {
    message.textContent = '';
    message.className = 'message';
}

// Validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// LOGIN
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    // Validation
    if (!email || !password) {
        showMessage('Please fill all fields', 'error');
        return;
    }

    if (!validateEmail(email)) {
        showMessage('Invalid email format', 'error');
        return;
    }

    // Check user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        showMessage('Invalid email or password', 'error');
        return;
    }

    // Login Success
    currentUser = { id: user.id, name: user.name, email: user.email };
    sessionStorage.setItem('roomkhoj_currentUser', JSON.stringify(currentUser));
    
    showMessage('Login successful! 🎉', 'success');
    
    setTimeout(() => {
        showDashboard();
    }, 1000);
});

// SIGNUP
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;

    // Validation
    if (!name || !email || !password || !confirm) {
        showMessage('Please fill all fields', 'error');
        return;
    }

    if (name.length < 3) {
        showMessage('Name must be at least 3 characters', 'error');
        return;
    }

    if (!validateEmail(email)) {
        showMessage('Invalid email format', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }

    if (password !== confirm) {
        showMessage('Passwords do not match', 'error');
        return;
    }

    // Check if email exists
    if (users.find(u => u.email === email)) {
        showMessage('Email already registered', 'error');
        return;
    }

    // Create new user
    const newUser = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        name: name,
        email: email,
        password: password,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers();

    showMessage('Account created successfully! 🎉 Please login', 'success');
    
    // Clear form
    signupForm.reset();
    
    setTimeout(() => {
        tabBtns[0].click();
        clearMessage();
    }, 1500);
});

// LOGOUT
logoutBtn.addEventListener('click', () => {
    currentUser = null;
    sessionStorage.removeItem('roomkhoj_currentUser');
    showLoginPage();
    clearMessage();
    loginForm.reset();
    signupForm.reset();
});

// Show Login Page
function showLoginPage() {
    container.style.display = 'flex';
    dashboard.classList.add('hidden');
}

// Show Dashboard
function showDashboard() {
    container.style.display = 'none';
    dashboard.classList.remove('hidden');
    userName.textContent = currentUser.name;
    
    loadRooms();
}

// Check if user already logged in
if (currentUser) {
    showDashboard();
} else {
    showLoginPage();
}

// ========== DASHBOARD FUNCTIONALITY ==========

// Load Rooms
function loadRooms() {
    const myRoomsDiv = document.getElementById('myRooms');
    const allRoomsDiv = document.getElementById('allRooms');
    
    // My Rooms
    const myRooms = rooms.filter(r => r.createdBy === currentUser.id);
    if (myRooms.length === 0) {
        myRoomsDiv.innerHTML = '<div class="empty-message">You haven\'t created any rooms yet</div>';
    } else {
        myRoomsDiv.innerHTML = myRooms.map(room => `
            <div class="room-card">
                <h4>${room.name}</h4>
                <p>${room.description}</p>
                <div class="budget">💰 Rs. ${room.budget}</div>
            </div>
        `).join('');
    }
    
    // All Rooms
    allRoomsDiv.innerHTML = rooms.map(room => `
        <div class="room-card">
            <h4>${room.name}</h4>
            <p>${room.description}</p>
            <div class="budget">💰 Rs. ${room.budget}</div>
        </div>
    `).join('');
}

// Search Room
document.getElementById('searchBtn').addEventListener('click', () => {
    const searchTerm = document.getElementById('roomSearch').value.trim().toLowerCase();
    const resultsDiv = document.getElementById('searchResults');
    
    if (!searchTerm) {
        resultsDiv.innerHTML = '<div class="empty-message">Enter a room name to search</div>';
        return;
    }
    
    const searchResults = rooms.filter(r => 
        r.name.toLowerCase().includes(searchTerm) ||
        r.description.toLowerCase().includes(searchTerm)
    );
    
    if (searchResults.length === 0) {
        resultsDiv.innerHTML = '<div class="empty-message">No rooms found matching your search</div>';
    } else {
        resultsDiv.innerHTML = searchResults.map(room => `
            <div class="result-item">
                <p><strong>${room.name}</strong></p>
                <p>${room.description}</p>
                <p>Budget: <strong>Rs. ${room.budget}</strong></p>
            </div>
        `).join('');
    }
});

// Create Room
document.getElementById('createBtn').addEventListener('click', () => {
    const roomName = document.getElementById('roomName').value.trim();
    const roomBudget = document.getElementById('roomBudget').value.trim();
    
    if (!roomName || !roomBudget) {
        alert('Please fill all fields');
        return;
    }
    
    if (roomName.length < 3) {
        alert('Room name must be at least 3 characters');
        return;
    }
    
    const newRoom = {
        id: Math.max(...rooms.map(r => r.id), 0) + 1,
        name: roomName,
        budget: parseInt(roomBudget),
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
        description: `Room posted by ${currentUser.name}`
    };
    
    rooms.push(newRoom);
    saveRooms();
    
    alert('Room created successfully! 🎉');
    document.getElementById('roomName').value = '';
    document.getElementById('roomBudget').value = '';
    
    loadRooms();
});

// Allow Enter key for search
document.getElementById('roomSearch').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('searchBtn').click();
    }
});

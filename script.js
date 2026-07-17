// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = 'epxpqiq';
const CLOUDINARY_API_KEY = '841912867418458';
const CLOUDINARY_UPLOAD_PRESET = 'room_khoj'; // Create this in Cloudinary

// Demo Users Database (localStorage)
let users = JSON.parse(localStorage.getItem('roomkhoj_users')) || [
    {
        id: 1,
        name: 'Admin User',
        email: 'admin@roomkhoj.com',
        password: 'admin',
        isAdmin: true,
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
        description: 'Beautiful studio apartment',
        mediaUrl: null
    },
    {
        id: 2,
        name: 'Room in Baneswor',
        budget: 12000,
        createdBy: 1,
        createdAt: new Date().toISOString(),
        description: 'Shared apartment with facilities',
        mediaUrl: null
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
const adminModal = document.getElementById('adminModal');
const mediaModal = document.getElementById('mediaModal');

// Tab Switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.form-container').forEach(f => f.classList.remove('active'));

        btn.classList.add('active');
        const tabName = btn.getAttribute('data-tab');
        document.getElementById(tabName + 'Form').classList.add('active');
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

    if (!email || !password) {
        showMessage('Please fill all fields', 'error');
        return;
    }

    if (!validateEmail(email)) {
        showMessage('Invalid email format', 'error');
        return;
    }

    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        showMessage('Invalid email or password', 'error');
        return;
    }

    currentUser = { 
        id: user.id, 
        name: user.name, 
        email: user.email,
        isAdmin: user.isAdmin || false 
    };
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

    if (users.find(u => u.email === email)) {
        showMessage('Email already registered', 'error');
        return;
    }

    const newUser = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        name: name,
        email: email,
        password: password,
        isAdmin: false,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers();

    showMessage('Account created successfully! 🎉 Please login', 'success');
    
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
    
    // Show/Hide admin button
    const adminBtn = document.getElementById('adminPanelBtn');
    adminBtn.style.display = currentUser.isAdmin ? 'block' : 'none';
    
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
                ${room.mediaUrl ? `
                    <img src="${room.mediaUrl}" alt="${room.name}" class="room-media-thumb" onclick="viewMedia('${room.mediaUrl}')">
                ` : ''}
                <div class="budget">💰 Rs. ${room.budget}</div>
            </div>
        `).join('');
    }
    
    // All Rooms
    allRoomsDiv.innerHTML = rooms.map(room => `
        <div class="room-card">
            <h4>${room.name}</h4>
            <p>${room.description}</p>
            ${room.mediaUrl ? `
                <img src="${room.mediaUrl}" alt="${room.name}" class="room-media-thumb" onclick="viewMedia('${room.mediaUrl}')">
            ` : ''}
            <div class="budget">💰 Rs. ${room.budget}</div>
        </div>
    `).join('');
}

// View Media
function viewMedia(mediaUrl) {
    const mediaContent = document.getElementById('mediaContent');
    const isVideo = mediaUrl.includes('.mp4') || mediaUrl.includes('video');
    
    if (isVideo) {
        mediaContent.innerHTML = `<video controls src="${mediaUrl}"></video>`;
    } else {
        mediaContent.innerHTML = `<img src="${mediaUrl}" alt="Room media">`;
    }
    
    mediaModal.classList.remove('hidden');
}

// Close Media Modal
document.getElementById('closeMediaBtn').addEventListener('click', () => {
    mediaModal.classList.add('hidden');
});

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
                ${room.mediaUrl ? `<p><a href="${room.mediaUrl}" target="_blank">View Media</a></p>` : ''}
            </div>
        `).join('');
    }
});

// Upload to Cloudinary
async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
            {
                method: 'POST',
                body: formData
            }
        );

        if (!response.ok) throw new Error('Upload failed');
        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Upload error:', error);
        showMessage('Failed to upload media. Please try again.', 'error');
        return null;
    }
}

// Create Room with Media
document.getElementById('createBtn').addEventListener('click', async () => {
    const roomName = document.getElementById('roomName').value.trim();
    const roomBudget = document.getElementById('roomBudget').value.trim();
    const mediaFile = document.getElementById('roomMedia').files[0];

    if (!roomName || !roomBudget) {
        alert('Please fill all fields');
        return;
    }

    if (roomName.length < 3) {
        alert('Room name must be at least 3 characters');
        return;
    }

    let mediaUrl = null;

    if (mediaFile) {
        showMessage('Uploading media... Please wait', 'success');
        mediaUrl = await uploadToCloudinary(mediaFile);
        
        if (!mediaUrl) return;
    }

    const newRoom = {
        id: Math.max(...rooms.map(r => r.id), 0) + 1,
        name: roomName,
        budget: parseInt(roomBudget),
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
        description: `Room posted by ${currentUser.name}`,
        mediaUrl: mediaUrl
    };

    rooms.push(newRoom);
    saveRooms();

    showMessage('Room created successfully! 🎉', 'success');
    document.getElementById('roomName').value = '';
    document.getElementById('roomBudget').value = '';
    document.getElementById('roomMedia').value = '';

    setTimeout(() => {
        clearMessage();
        loadRooms();
    }, 1500);
});

// Allow Enter key for search
document.getElementById('roomSearch').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('searchBtn').click();
    }
});

// ========== ADMIN PANEL ==========

// Admin Panel Button
document.getElementById('adminPanelBtn').addEventListener('click', () => {
    adminModal.classList.remove('hidden');
    loadAdminData();
});

// Close Admin Modal
document.getElementById('closeAdminBtn').addEventListener('click', () => {
    adminModal.classList.add('hidden');
});

// Admin Tab Switching
document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const tabName = btn.getAttribute('data-admin-tab');
        document.getElementById(tabName + 'Tab').classList.add('active');
    });
});

// Load Admin Data
function loadAdminData() {
    loadUsersTable();
    loadRoomsTable();
}

// Load Users Table
function loadUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="delete-btn" onclick="deleteUser(${user.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Load Rooms Table
function loadRoomsTable() {
    const tbody = document.getElementById('roomsTableBody');
    tbody.innerHTML = rooms.map(room => {
        const creator = users.find(u => u.id === room.createdBy);
        return `
            <tr>
                <td>${room.id}</td>
                <td>${room.name}</td>
                <td>Rs. ${room.budget}</td>
                <td>${creator ? creator.name : 'Unknown'}</td>
                <td>
                    ${room.mediaUrl ? `
                        <button class="view-btn" onclick="viewMedia('${room.mediaUrl}')">View</button>
                    ` : 'No media'}
                </td>
                <td>
                    <button class="delete-btn" onclick="deleteRoom(${room.id})">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Create User (Admin)
document.getElementById('createUserBtn').addEventListener('click', () => {
    const name = document.getElementById('newUserName').value.trim();
    const email = document.getElementById('newUserEmail').value.trim();
    const password = document.getElementById('newUserPassword').value;

    if (!name || !email || !password) {
        alert('Please fill all fields');
        return;
    }

    if (!validateEmail(email)) {
        alert('Invalid email format');
        return;
    }

    if (users.find(u => u.email === email)) {
        alert('Email already exists');
        return;
    }

    const newUser = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        name: name,
        email: email,
        password: password,
        isAdmin: false,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers();

    alert('User created successfully!');
    document.getElementById('newUserName').value = '';
    document.getElementById('newUserEmail').value = '';
    document.getElementById('newUserPassword').value = '';

    loadUsersTable();
});

// Delete User
function deleteUser(userId) {
    if (userId === currentUser.id) {
        alert('Cannot delete your own account');
        return;
    }

    if (confirm('Are you sure you want to delete this user?')) {
        users = users.filter(u => u.id !== userId);
        saveUsers();
        loadUsersTable();
        alert('User deleted successfully');
    }
}

// Delete Room
function deleteRoom(roomId) {
    if (confirm('Are you sure you want to delete this room?')) {
        rooms = rooms.filter(r => r.id !== roomId);
        saveRooms();
        loadRoomsTable();
        loadRooms();
        alert('Room deleted successfully');
    }
}

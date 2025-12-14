const API_URL = window.location.origin;
let currentUser = null;
let authToken = localStorage.getItem('authToken');
let currentPages = { sha256: 1, url: 1, ipport: 1 };

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        loadUserProfile();
    }
    updateAuthUI();
    loadStats();
    showSection('home');
    
    // Navigation
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.getAttribute('href').substring(1);
            if (section) {
                showSection(section);
            }
        });
    });
});

// Show/hide sections
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        
        // Load data for specific sections
        if (sectionId === 'sha256') loadSha256();
        if (sectionId === 'urls') loadUrls();
        if (sectionId === 'ipports') loadIpPorts();
    }
}

// Auth functions
function updateAuthUI() {
    const authLink = document.getElementById('authLink');
    if (currentUser) {
        authLink.textContent = currentUser.username;
        authLink.onclick = () => showSection('authSection');
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.add('hidden');
        document.getElementById('profileSection').classList.remove('hidden');
        document.getElementById('profileUsername').textContent = currentUser.username;
        document.getElementById('profileEmail').textContent = currentUser.email;
        const roleBadge = document.getElementById('profileRole');
        roleBadge.textContent = currentUser.role;
        roleBadge.className = `badge ${currentUser.role}`;
    } else {
        authLink.textContent = 'Login';
        authLink.onclick = () => showSection('authSection');
    }
}

async function loadUserProfile() {
    try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            currentUser = await response.json();
            updateAuthUI();
        } else {
            logout();
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function showLogin() {
    document.getElementById('authTitle').textContent = 'Login';
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('authMessage').classList.add('hidden');
}

function showRegister() {
    document.getElementById('authTitle').textContent = 'Register';
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('authMessage').classList.add('hidden');
}

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            updateAuthUI();
            showMessage('Login successful!', 'success');
            setTimeout(() => showSection('home'), 1500);
        } else {
            showMessage(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('Error connecting to server', 'error');
    }
}

async function register() {
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            updateAuthUI();
            showMessage('Registration successful!', 'success');
            setTimeout(() => showSection('home'), 1500);
        } else {
            showMessage(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        showMessage('Error connecting to server', 'error');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    updateAuthUI();
    showLogin();
    showSection('authSection');
    showMessage('Logged out successfully', 'success');
}

function showMessage(message, type) {
    const messageEl = document.getElementById('authMessage');
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.classList.remove('hidden');
}

// Load stats
async function loadStats() {
    try {
        const [sha256Res, urlRes, ipportRes] = await Promise.all([
            fetch(`${API_URL}/api/sha256?limit=1`),
            fetch(`${API_URL}/api/urls?limit=1`),
            fetch(`${API_URL}/api/ipports?limit=1`)
        ]);
        
        const sha256Data = await sha256Res.json();
        const urlData = await urlRes.json();
        const ipportData = await ipportRes.json();
        
        document.getElementById('sha256Count').textContent = sha256Data.total.toLocaleString();
        document.getElementById('urlCount').textContent = urlData.total.toLocaleString();
        document.getElementById('ipportCount').textContent = ipportData.total.toLocaleString();
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load SHA256 hashes
async function loadSha256() {
    const page = currentPages.sha256;
    const malware = document.getElementById('sha256Search')?.value || '';
    const threatType = document.getElementById('sha256ThreatType')?.value || '';
    
    let url = `${API_URL}/api/sha256?page=${page}&limit=10`;
    if (malware) url += `&malware=${malware}`;
    if (threatType) url += `&threat_type=${threatType}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        displayResults('sha256', data.data);
        document.getElementById('sha256Page').textContent = `Page ${page} of ${Math.ceil(data.total / 10)}`;
    } catch (error) {
        console.error('Error loading SHA256:', error);
    }
}

// Load URLs
async function loadUrls() {
    const page = currentPages.url;
    const malware = document.getElementById('urlSearch')?.value || '';
    const threatType = document.getElementById('urlThreatType')?.value || '';
    
    let url = `${API_URL}/api/urls?page=${page}&limit=10`;
    if (malware) url += `&malware=${malware}`;
    if (threatType) url += `&threat_type=${threatType}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        displayResults('url', data.data);
        document.getElementById('urlPage').textContent = `Page ${page} of ${Math.ceil(data.total / 10)}`;
    } catch (error) {
        console.error('Error loading URLs:', error);
    }
}

// Load IP:Port
async function loadIpPorts() {
    const page = currentPages.ipport;
    const malware = document.getElementById('ipportSearch')?.value || '';
    const threatType = document.getElementById('ipportThreatType')?.value || '';
    
    let url = `${API_URL}/api/ipports?page=${page}&limit=10`;
    if (malware) url += `&malware=${malware}`;
    if (threatType) url += `&threat_type=${threatType}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        displayResults('ipport', data.data);
        document.getElementById('ipportPage').textContent = `Page ${page} of ${Math.ceil(data.total / 10)}`;
    } catch (error) {
        console.error('Error loading IP:Port:', error);
    }
}

// Display results
function displayResults(type, data) {
    const resultsId = type === 'sha256' ? 'sha256Results' : 
                      type === 'url' ? 'urlResults' : 'ipportResults';
    const resultsEl = document.getElementById(resultsId);
    
    if (!data || data.length === 0) {
        resultsEl.innerHTML = '<p>No results found.</p>';
        return;
    }
    
    resultsEl.innerHTML = data.map(item => `
        <div class="result-item">
            <h4>${item.ioc_value}</h4>
            <p><strong>Threat Type:</strong> ${item.threat_type}</p>
            <p><strong>Malware:</strong> ${item.malware_printable || 'Unknown'}</p>
            <p><strong>Confidence:</strong> ${item.confidence_level}%</p>
            <p><strong>First Seen:</strong> ${new Date(item.first_seen_utc).toLocaleDateString()}</p>
            <p><strong>Reporter:</strong> ${item.reporter}</p>
            ${item.tags ? `<div class="tags">${item.tags.split(',').map(tag => `<span class="badge">${tag.trim()}</span>`).join('')}</div>` : ''}
        </div>
    `).join('');
}

// Pagination
function nextPage(type) {
    currentPages[type]++;
    if (type === 'sha256') loadSha256();
    if (type === 'url') loadUrls();
    if (type === 'ipport') loadIpPorts();
}

function prevPage(type) {
    if (currentPages[type] > 1) {
        currentPages[type]--;
        if (type === 'sha256') loadSha256();
        if (type === 'url') loadUrls();
        if (type === 'ipport') loadIpPorts();
    }
}

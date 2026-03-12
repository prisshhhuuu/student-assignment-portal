// State
let mockSubmissions = [
    { id: 1, name: "Rahul Verma", assignment: "DevOps Lab 4: CI/CD Pipelines", link: "https://github.com/rahul/lab4", timestamp: new Date(Date.now() - 2 * 60000) },
    { id: 2, name: "Sneha Iyer", assignment: "Frontend Deployment with Netlify", link: "https://github.com/sneha/deploy", timestamp: new Date(Date.now() - 15 * 60000) },
    { id: 3, name: "Arjun Reddy", assignment: "Docker Containerization", link: "https://github.com/arjun/docker-lab", timestamp: new Date(Date.now() - 45 * 60000) },
    { id: 4, name: "Priya Sharma", assignment: "Google Apps Script API Integration", link: "https://docs.google.com/spreadsheets/d/priya", timestamp: new Date(Date.now() - 120 * 60000) },
    { id: 5, name: "Rahul Verma", assignment: "Terraform Infrastructure as Code", link: "https://github.com/rahul/terraform", timestamp: new Date(Date.now() - 200 * 60000) },
];

gsap.registerPlugin(ScrollToPlugin);

document.addEventListener("DOMContentLoaded", () => {
    initHeroAnimations();
    setupEventListeners();
    fetchData(); // Initial load
});

// Animations
function initHeroAnimations() {
    const tl = gsap.timeline();
    
    // Animate Nav
    tl.from(".top-nav", { y: -20, opacity: 0, duration: 0.8, ease: "power3.out" })
      
      // Animate Hero text staggering
      .from(".hero-title", { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.4")
      .from(".hero-desc", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
      .from(".btn-primary", { scale: 0.9, opacity: 0, duration: 0.6, ease: "back.out(1.5)" }, "-=0.4");
}

function setupEventListeners() {
    const viewBtn = document.getElementById("view-submissions-btn");
    viewBtn.addEventListener("click", () => {
        gsap.to(window, { duration: 1, scrollTo: "#dashboard", ease: "power3.inOut" });
    });

    const refreshBtn = document.getElementById("refresh-data");
    refreshBtn.addEventListener("click", () => {
        gsap.to(refreshBtn, { rotation: "+=360", duration: 0.8, ease: "power2.inOut" });
        fetchData();
    });
}

// Logic: Personalization & Tracking
function trackStudentView(studentName) {
    let views = JSON.parse(localStorage.getItem('studentViews') || '{}');
    views[studentName] = (views[studentName] || 0) + 1;
    localStorage.setItem('studentViews', JSON.stringify(views));
}

function getFrequentStudent() {
    let views = JSON.parse(localStorage.getItem('studentViews') || '{}');
    if (Object.keys(views).length === 0) return null;
    return Object.keys(views).reduce((a, b) => views[a] > views[b] ? a : b);
}

// Data Fetching & Rendering
const API_URL = "https://script.google.com/macros/s/AKfycbwWE1gjvSSe0p2Z8RuT-3-m6W_JZSjj6CnwStWdMv9703ah_n3egWl9CZTLxS6tXHor/exec";

async function fetchData() {
    const grid = document.getElementById("submissions-grid");
    const activity = document.getElementById("activity-list");
    
    // Loading State
    grid.innerHTML = `
        <div class="loading-wrapper">
            <div class="custom-loader"></div>
            <p>Syncing live data from Google Sheets...</p>
        </div>
    `;

    try {
        const response = await fetch(API_URL);
        const rawData = await response.json();
        
        let formattedData = [];
        if (Array.isArray(rawData)) {
            // Map the google sheet responses to our internal format
            formattedData = rawData.map((row, index) => ({
                id: index,
                name: row["Student Name"] || "Unknown Student",
                assignment: row["Assignment Name"] || "Unknown Assignment", // Updated from Google Form Header
                link: row["Submission Link (Google Drive / GitHub Link)"] || "#", // Updated from Google Form Header
                // The timestamp from Google Forms
                timestamp: row["Timestamp"] ? new Date(row["Timestamp"]) : new Date()
            }));
        }

        renderSubmissions(formattedData);
        renderActivity(formattedData);
        
        // Update Sync Status
        const now = new Date();
        document.getElementById("last-updated").innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        // Pulse effect on Sync badge
        gsap.fromTo("#sync-status", 
            { backgroundColor: "rgba(34, 197, 94, 0.2)", borderColor: "#22C55E" },
            { backgroundColor: "rgba(255, 255, 255, 0.03)", borderColor: "rgba(255, 255, 255, 0.1)", duration: 1.5, ease: "power2.out" }
        );

    } catch (error) {
        console.error("Error fetching data:", error);
        grid.innerHTML = `
            <div class="loading-wrapper" style="color: #EF4444;">
                <i class="ph-bold ph-warning" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Failed to load data. Please check if the Google Sheet has data, or check the connection.</p>
                <button class="btn-primary" onclick="fetchData()" style="margin-top: 1rem; padding: 0.5rem 1rem; font-size: 0.875rem;">Retry</button>
            </div>
        `;
    }
}

function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return `${Math.floor(seconds)} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hours ago`;
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function renderSubmissions(data) {
    const grid = document.getElementById("submissions-grid");
    grid.innerHTML = '';
    
    const frequeuntStudent = getFrequentStudent();

    // Sort to bring frequent student to top
    const sortedData = [...data].sort((a, b) => {
        if (a.name === frequeuntStudent) return -1;
        if (b.name === frequeuntStudent) return 1;
        return b.timestamp - a.timestamp; // Then by time
    });

    sortedData.forEach((item, index) => {
        const isHighlight = item.name === frequeuntStudent;
        
        const card = document.createElement('div');
        card.className = `sub-card ${isHighlight ? 'highlight' : ''}`;
        
        card.innerHTML = `
            <div class="card-header">
                <div class="student-info">
                    <div class="avatar">${getInitials(item.name)}</div>
                    <div>
                        <div class="student-name">${item.name}</div>
                        <div class="time-ago">${formatTimeAgo(item.timestamp)}</div>
                    </div>
                </div>
            </div>
            <div class="assignment-title">${item.assignment}</div>
            <div class="card-footer">
                <a href="${item.link}" target="_blank" class="link-btn">
                    Open Assignment <i class="ph ph-arrow-up-right"></i>
                </a>
            </div>
        `;

        // Interaction: Hover Lift
        card.addEventListener('mouseenter', () => {
            gsap.to(card, { y: -8, duration: 0.3, ease: "power2.out" });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { y: 0, duration: 0.3, ease: "power2.out" });
        });

        // Track click
        card.querySelector('.link-btn').addEventListener('click', () => {
            trackStudentView(item.name);
        });

        // Open assignment if clicking the card body (excluding the link itself to prevent double trigger)
        card.addEventListener('click', (e) => {
            if(!e.target.closest('.link-btn')) {
                trackStudentView(item.name);
                window.open(item.link, '_blank');
            }
        });

        grid.appendChild(card);
    });

    // Stagger Reveal Animation
    gsap.from(".sub-card", {
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "all"
    });
}

function renderActivity(data) {
    const actList = document.getElementById("activity-list");
    actList.innerHTML = '';

    // Take top 4 most recent
    const recent = [...data].sort((a, b) => b.timestamp - a.timestamp).slice(0, 4);

    recent.forEach(item => {
        const li = document.createElement('li');
        li.className = 'activity-item';
        li.innerHTML = `
            <div class="act-icon">
                <i class="ph-bold ph-check"></i>
            </div>
            <div class="act-content">
                <p><span>${item.name}</span> uploaded "${item.assignment}"</p>
                <div class="act-time">${formatTimeAgo(item.timestamp)}</div>
            </div>
        `;
        actList.appendChild(li);
    });

    gsap.from(".activity-item", {
        x: -20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out"
    });
}

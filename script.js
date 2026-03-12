// Mock data for initial development (Replace with actual fetch later)
const MOCK_DATA = [
    { name: "Alice Johnson", assignment: "React Router Basics", link: "https://github.com/alice/react-router" },
    { name: "Bob Smith", assignment: "Redux State Management", link: "https://github.com/bob/redux-app" },
    { name: "Charlie Davis", assignment: "CSS Grid Layout", link: "https://github.com/charlie/css-grid" },
    { name: "Diana Prince", assignment: "API Integration", link: "https://github.com/diana/api-fetch" },
];

document.addEventListener("DOMContentLoaded", () => {
    // Initial Animation Sequence
    const tl = gsap.timeline();
    
    tl.from(".sidebar", { x: -50, opacity: 0, duration: 0.6, ease: "power3.out" })
      .from(".top-header", { y: -20, opacity: 0, duration: 0.4, ease: "power2.out" }, "-=0.3")
      .from(".stat-card", { y: 20, opacity: 0, duration: 0.5, stagger: 0.1, ease: "back.out(1.7)" }, "-=0.2")
      .from(".content-section", { y: 20, opacity: 0, duration: 0.5, ease: "power2.out" }, "-=0.3");

    const tBody = document.getElementById("submissions-list");
    const refreshBtn = document.getElementById("refresh-btn");
    
    // Function to render table rows
    function renderTable(data) {
        tBody.innerHTML = '';
        
        if (!data || data.length === 0) {
            tBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; padding: 2rem;">No submissions found.</td>
                </tr>
            `;
            return;
        }

        data.forEach((item, index) => {
            // Get initials
            const initials = item.name ? item.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';
            
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>
                    <div class="student-col">
                        <div class="student-initial">${initials}</div>
                        <span>${item.name || 'Unknown'}</span>
                    </div>
                </td>
                <td>${item.assignment || 'N/A'}</td>
                <td>
                    <a href="${item.link}" target="_blank" class="action-link" title="${item.link}">
                        <i class="ph ph-link"></i> View Link
                    </a>
                </td>
                <td><span class="status-badge">Submitted</span></td>
                <td>
                    <button class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.75rem;" onclick="window.open('${item.link}', '_blank')">
                        Review
                    </button>
                </td>
            `;
            tBody.appendChild(tr);
        });

        // Update Stats
        document.getElementById("total-count").innerText = data.length;
        document.getElementById("latest-assignment").innerText = data[0]?.assignment || 'None';
        
        const now = new Date();
        document.getElementById("last-updated").innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Animate new rows
        gsap.from("#submissions-list tr", {
            y: 10,
            opacity: 0,
            duration: 0.4,
            stagger: 0.05,
            ease: "power2.out"
        });
    }

    // Function to fetch data (Mock for now)
    function fetchData() {
        tBody.innerHTML = `
            <tr>
                <td colspan="5" class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading student submissions...</p>
                </td>
            </tr>
        `;
        
        // Spin the refresh button
        gsap.to("#refresh-btn i", { rotation: "+=360", duration: 1, ease: "power2.inOut" });

        // Simulate network request
        setTimeout(() => {
            renderTable(MOCK_DATA);
        }, 1200);
    }

    // Event Listeners
    refreshBtn.addEventListener("click", fetchData);

    // Initial Load
    fetchData();
});

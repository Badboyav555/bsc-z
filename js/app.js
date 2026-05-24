// Data Configuration
const subjects = ['Physics', 'Chemistry', 'Botany', 'Zoology', 'Maths'];
const units = ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5'];

// State Management
let currentState = {
    view: 'semesters', // semesters, subjects, units
    selectedSem: null,
    selectedSub: null
};

const grid = document.getElementById('content-grid');
const breadcrumbs = document.getElementById('breadcrumbs');
const pageTitle = document.getElementById('page-title');
const pageSubtitle = document.getElementById('page-subtitle');
const backBtn = document.getElementById('back-btn');
const searchInput = document.getElementById('search-input');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderSemesters();
    
    searchInput.addEventListener('input', (e) => {
        handleSearch(e.target.value);
    });
});

// --- Render Functions ---

function renderSemesters() {
    currentState.view = 'semesters';
    currentState.selectedSem = null;
    currentState.selectedSub = null;
    
    updateUI('Select Semester', 'Choose your current semester to view subjects.');
    breadcrumbs.innerHTML = `<span><i class="ri-home-line"></i> Home</span>`;
    backBtn.style.display = 'none';
    
    grid.innerHTML = '';
    
    for (let i = 1; i <= 6; i++) {
        const card = document.createElement('div');
        card.className = 'glass-card';
        card.style.padding = '30px';
        card.style.textAlign = 'center';
        card.innerHTML = `
            <div style="font-size: 2rem; color: var(--primary); margin-bottom: 10px;">
                <i class="ri-calendar-event-line"></i>
            </div>
            <h3 style="font-size: 1.25rem; font-weight: 600;">Semester ${i}</h3>
            <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 5px;">5 Subjects Available</p>
        `;
        card.onclick = () => renderSubjects(i);
        grid.appendChild(card);
    }
}

function renderSubjects(semId) {
    currentState.view = 'subjects';
    currentState.selectedSem = semId;
    
    updateUI(`Semester ${semId}`, 'Select a subject to view unit notes.');
    updateBreadcrumbs([`Semester ${semId}`]);
    backBtn.style.display = 'inline-flex';
    
    grid.innerHTML = '';
    
    subjects.forEach(sub => {
        const card = document.createElement('div');
        card.className = 'glass-card';
        card.style.padding = '24px';
        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 16px;">
                <div style="background: var(--primary-soft); color: var(--primary); width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                    <i class="ri-book-2-line"></i>
                </div>
                <div>
                    <h3 style="font-size: 1.1rem; font-weight: 600;">${sub}</h3>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">5 Units</p>
                </div>
            </div>
        `;
        card.onclick = () => renderUnits(semId, sub);
        grid.appendChild(card);
    });
}

function renderUnits(semId, subName) {
    currentState.view = 'units';
    currentState.selectedSub = subName;
    
    updateUI(`${subName}`, 'Select a unit to start reading.');
    updateBreadcrumbs([`Semester ${semId}`, subName]);
    backBtn.style.display = 'inline-flex';
    
    grid.innerHTML = '';
    
    units.forEach((unit, index) => {
        const unitNum = index + 1;
        const card = document.createElement('div');
        card.className = 'glass-card';
        card.style.padding = '20px';
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600;">${unit}</span>
                <i class="ri-arrow-right-line" style="color: var(--text-muted);"></i>
            </div>
            <div style="height: 4px; width: 100%; background: #f1f5f9; margin-top: 16px; border-radius: 2px; overflow: hidden;">
                <div style="height: 100%; width: ${Math.random() * 60 + 20}%; background: var(--secondary); opacity: 0.5;"></div>
            </div>
        `;
        card.onclick = () => openNote(semId, subName.toLowerCase(), `unit${unitNum}`);
        grid.appendChild(card);
    });
}

// --- Helper Functions ---

function openNote(sem, subject, unit) {
    // Navigate to notes.html with query params
    const url = `notes.html?sem=${sem}&subject=${subject}&note=${unit}`;
    window.location.href = url;
}

function goBack() {
    if (currentState.view === 'units') {
        renderSubjects(currentState.selectedSem);
    } else if (currentState.view === 'subjects') {
        renderSemesters();
    }
}

function updateUI(title, subtitle) {
    // Fade out
    grid.style.opacity = '0';
    pageTitle.style.opacity = '0';
    
    setTimeout(() => {
        pageTitle.innerText = title;
        pageSubtitle.innerText = subtitle;
        
        // Fade in
        grid.style.opacity = '1';
        pageTitle.style.opacity = '1';
        grid.style.transition = 'opacity 0.3s ease';
    }, 200);
}

function updateBreadcrumbs(items) {
    let html = `<span onclick="renderSemesters()" style="cursor: pointer; hover:underline;"><i class="ri-home-line"></i> Home</span>`;
    items.forEach((item, index) => {
        html += ` <i class="ri-arrow-right-s-line"></i> <span>${item}</span>`;
    });
    breadcrumbs.innerHTML = html;
}

function handleSearch(query) {
    const lowerQuery = query.toLowerCase();
    const cards = Array.from(grid.children);
    
    cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        if (text.includes(lowerQuery)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

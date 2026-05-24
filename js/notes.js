// Configuration
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase if keys exist
let supabase = null;
if (SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// State
let currentLang = 'en';
let isUnlocked = false;
let noteData = { sem: '', subject: '', title: '' };

// DOM Elements
const contentDiv = document.getElementById('markdown-content');
const loader = document.getElementById('loader');
const errorDiv = document.getElementById('error-state');
const overlay = document.getElementById('lock-overlay');
const form = document.getElementById('unlock-form');
const progressBar = document.getElementById('reading-progress');
const tocList = document.getElementById('toc-list');

// On Load
window.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const sem = params.get('sem');
    const subject = params.get('subject');
    const note = params.get('note');

    noteData = { sem, subject, title: note };

    if (!sem || !subject || !note) {
        showError();
        return;
    }

    // Check LocalStorage for unlock
    const unlockKey = `unlocked_${sem}_${subject}_${note}`;
    if (localStorage.getItem(unlockKey)) {
        isUnlocked = true;
        document.body.classList.add('unlocked');
    }

    await loadNote(sem, subject, note);
});

// Load Markdown
async function loadNote(sem, subject, note) {
    try {
        // Construct file path based on language
        const langSuffix = currentLang === 'en' ? '' : `-${currentLang}`;
        const filePath = `notes/sem${sem}/${subject}/${note}${langSuffix}.md`;

        const response = await fetch(filePath);
        
        if (!response.ok) {
            // Fallback to English if localized version not found
            if (currentLang !== 'en') {
                const fallbackPath = `notes/sem${sem}/${subject}/${note}.md`;
                const fallbackRes = await fetch(fallbackPath);
                if (!fallbackRes.ok) throw new Error('File not found');
                const text = await fallbackRes.text();
                renderMarkdown(text);
            } else {
                throw new Error('File not found');
            }
        } else {
            const text = await response.text();
            renderMarkdown(text);
        }
    } catch (err) {
        console.error(err);
        // For demo purposes, if fetch fails (running locally without server), show sample text
        renderMarkdown(`# ${note.replace('unit', 'Unit ')}: Sample Content\n\nThis is a sample note because the markdown file could not be fetched. \n\n## Features\n\n- **Glassmorphism UI**\n- Mobile Optimized\n- Supabase Integration\n\n> "Education is the most powerful weapon which you can use to change the world."\n\n### Code Example\n\n\`\`\`javascript\nconsole.log("Hello World");\n\`\`\`\n\n[Back to Dashboard](index.html)`);
    }
}

function renderMarkdown(markdownText) {
    loader.style.display = 'none';
    contentDiv.style.display = 'block';
    contentDiv.innerHTML = marked.parse(markdownText);
    
    generateTOC();
}

function showError() {
    loader.style.display = 'none';
    errorDiv.style.display = 'block';
}

// Table of Contents
function generateTOC() {
    const headings = contentDiv.querySelectorAll('h2, h3');
    tocList.innerHTML = '';
    
    headings.forEach(heading => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = heading.textContent;
        a.href = `#${heading.id}`; // Marked auto-generates IDs
        // Note: Marked might not generate IDs by default without config, 
        // but for simplicity we rely on standard behavior or simple anchor jumping if IDs exist.
        // If IDs are missing, we can generate them:
        if(!heading.id) {
            heading.id = heading.textContent.toLowerCase().replace(/\s+/g, '-');
            a.href = `#${heading.id}`;
        }
        
        li.appendChild(a);
        tocList.appendChild(li);
    });
}

// Reading Progress
window.onscroll = function() {
    let winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    let scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + "%";
};

// Unlock Form Submit
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    const originalText = btn.innerHTML;
    
    const name = document.getElementById('lead-name').value;
    const mobile = document.getElementById('lead-mobile').value;

    btn.innerHTML = '<div class="spinner" style="width:16px; height:16px; border-width:2px;"></div>';
    btn.disabled = true;

    // Save to Supabase
    if (supabase) {
        try {
            const { error } = await supabase
                .from('leads')
                .insert([{
                    name: name,
                    mobile: mobile,
                    semester: noteData.sem,
                    subject: noteData.subject,
                    note_title: noteData.title,
                    created_at: new Date()
                }]);

            if (error) throw error;
        } catch (err) {
            console.error('Supabase Error:', err);
            alert('Saved locally (Backend connection failed)');
        }
    }

    // Success: Unlock UI
    const unlockKey = `unlocked_${noteData.sem}_${noteData.subject}_${noteData.title}`;
    localStorage.setItem(unlockKey, 'true');
    isUnlocked = true;
    document.body.classList.add('unlocked');
});

// Language Toggle
document.getElementById('lang-toggle').addEventListener('click', (e) => {
    const btn = e.target;
    if (currentLang === 'en') {
        currentLang = 'hi';
        btn.textContent = 'HI';
    } else {
        currentLang = 'en';
        btn.textContent = 'EN';
    }
    // Reload note
    loader.style.display = 'flex';
    contentDiv.style.display = 'none';
    loadNote(noteData.sem, noteData.subject, noteData.title);
});

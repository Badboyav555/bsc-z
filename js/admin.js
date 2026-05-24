const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const tbody = document.getElementById('leads-body');

async function fetchLeads() {
    if (!supabase) return;

    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching leads:', error);
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">Error loading leads. Check console.</td></tr>`;
        return;
    }

    renderLeads(data);
}

function renderLeads(leads) {
    tbody.innerHTML = '';
    
    if (leads.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No leads found yet.</td></tr>`;
        return;
    }

    leads.forEach(lead => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${lead.name}</td>
            <td>${lead.mobile}</td>
            <td><span class="badge">Sem ${lead.semester}</span></td>
            <td>${lead.subject}</td>
            <td>${lead.note_title}</td>
            <td style="font-size:0.85rem; color:var(--text-muted);">${new Date(lead.created_at).toLocaleDateString()}</td>
            <td>
                <button onclick="deleteLead('${lead.id}')" class="btn btn-outline btn-sm" style="color: #ef4444; border-color: #fca5a5;">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function deleteLead(id) {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    const { error } = await supabase.from('leads').delete().eq('id', id);

    if (error) {
        alert('Failed to delete');
    } else {
        fetchLeads(); // Refresh table
    }
}

function exportCSV() {
    const rows = Array.from(tbody.querySelectorAll('tr'));
    if (!rows.length) return alert('No data to export');

    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add Headers
    csvContent += "Name,Mobile,Semester,Subject,Note,Date\n";

    // Add Rows (Simulated extraction from DOM for simplicity in this demo, 
    // ideally use the 'leads' data array directly)
    rows.forEach(row => {
        const cols = row.querySelectorAll('td');
        let rowData = [];
        cols.forEach((col, index) => {
            if (index < 6) { // Skip action column
                rowData.push(col.innerText.replace(/,/g, '')); // Remove commas
            }
        });
        csvContent += rowData.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize
fetchLeads();

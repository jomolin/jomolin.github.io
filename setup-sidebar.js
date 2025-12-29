// ============================================
// SETTINGS SIDEBAR
// ============================================

document.addEventListener('DOMContentLoaded', () => {

// Load existing config from localStorage
function loadSidebarConfig() {
    const config = JSON.parse(localStorage.getItem('newtab_config') || '{}');
    
    document.getElementById('sidebar-username').value = config.username || '';
    document.getElementById('sidebar-city').value = config.city || '';
    document.getElementById('sidebar-imood-user').value = config.imoodUser || '';
    
    if (config.speedDial) {
        document.getElementById('sidebar-speed-dial').value = config.speedDial
            .map(item => `${item.name}|${item.url}`)
            .join('\n');
    }
    
    if (config.rss) {
        document.getElementById('sidebar-rss-feeds').value = config.rss.join('\n');
    }
    
    document.getElementById('sidebar-calendar-api-key').value = config.calendarApiKey || '';
    if (config.calendarIds) {
        document.getElementById('sidebar-calendar-ids').value = config.calendarIds.join('\n');
    }
    if (config.calendarPublicUrls) {
        document.getElementById('sidebar-calendar-public-urls').value = config.calendarPublicUrls.join('\n');
    }
    
    if (config.radio) {
        document.getElementById('sidebar-radio-stations').value = config.radio
            .map(item => `${item.name}|${item.url}`)
            .join('\n');
    }
}

// Open/close sidebar
const settingsBtn = document.getElementById('settings-btn');
const sidebar = document.getElementById('settings-sidebar');
const closeSidebar = document.getElementById('close-sidebar');

settingsBtn.addEventListener('click', () => {
    sidebar.classList.add('open');
    loadSidebarConfig();
});

closeSidebar.addEventListener('click', () => {
    sidebar.classList.remove('open');
});

sidebar.addEventListener('click', (e) => {
    if (e.target === sidebar) {
        sidebar.classList.remove('open');
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
    }
});

// Save config
const saveBtn = document.getElementById('save-btn');

saveBtn.addEventListener('click', () => {
    const config = {
        username: document.getElementById('sidebar-username')?.value?.trim() || '',
        city: document.getElementById('sidebar-city')?.value?.trim() || '',
        imoodUser: document.getElementById('sidebar-imood-user')?.value?.trim() || '',
        
        speedDial: (document.getElementById('sidebar-speed-dial')?.value || '')
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
                if (!line.includes('|')) return null;
                const parts = line.split('|');
                const name = parts[0]?.trim();
                const url = parts[1]?.trim();
                if (!name || !url) return null;
                return { name, url };
            })
            .filter(item => item !== null),
        
        rss: (document.getElementById('sidebar-rss-feeds')?.value || '')
            .split('\n')
            .filter(line => line.trim()),
        
        calendarApiKey: document.getElementById('sidebar-calendar-api-key')?.value?.trim() || '',
        calendarIds: (document.getElementById('sidebar-calendar-ids')?.value || '')
            .split('\n')
            .filter(line => line.trim()),
        calendarPublicUrls: (document.getElementById('sidebar-calendar-public-urls')?.value || '')
            .split('\n')
            .filter(line => line.trim()),
        
        radio: (document.getElementById('sidebar-radio-stations')?.value || '')
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
                if (!line.includes('|')) return null;
                const parts = line.split('|');
                const name = parts[0]?.trim();
                const url = parts[1]?.trim();
                if (!name || !url) return null;
                return { name, url };
            })
            .filter(item => item !== null)
    };
    
    localStorage.setItem('newtab_config', JSON.stringify(config));
    location.reload();
});

// Export config
document.getElementById('export-btn').addEventListener('click', () => {
    const config = localStorage.getItem('newtab_config') || '{}';
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newtab-config.json';
    a.click();
    URL.revokeObjectURL(url);
});

// Import config
document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-file').click();
});

document.getElementById('import-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const config = JSON.parse(event.target.result);
            localStorage.setItem('newtab_config', JSON.stringify(config));
            loadSidebarConfig();
            alert('✓ Configuration imported successfully!');
        } catch (error) {
            alert('Error importing config: ' + error.message);
        }
    };
    reader.readAsText(file);
});

// Clear all data
document.getElementById('clear-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all configuration data?')) {
        localStorage.removeItem('newtab_config');
        location.reload();
    }
});

}); // End DOMContentLoaded

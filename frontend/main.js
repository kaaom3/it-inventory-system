// ===================================================================
// Frontend Logic for IT Inventory System (Full Complete Version)
// Merged with: Render.com Cloud URL + Disposal Evidence + Fixed Data Mapping
// ===================================================================

// 🌟 ล็อก URL ไปที่เซิร์ฟเวอร์บน Cloud ของคุณ 100%
const API_BASE_URL = 'https://it-inventory-system-ncd9.onrender.com';

// --- Definition of Available Fields for Custom Menus ---
const AVAILABLE_FIELDS = [
    { id: 'ItemName', label: 'Item Name / Device Name', required: true, type: 'text', group: 'Core Identity' },
    { id: 'ComputerName', label: 'Computer Name', type: 'text', group: 'Core Identity' },
    { id: 'DeviceName', label: 'Device Name', type: 'text', group: 'Core Identity' },
    { id: 'Name', label: 'Name (Printer/General)', type: 'text', group: 'Core Identity' },
    { id: 'PartName', label: 'Part Name', type: 'text', group: 'Core Identity' },
    { id: 'SoftwareName', label: 'Software Name', type: 'text', group: 'Core Identity' },
    { id: 'SerialNumber', label: 'Serial Number', required: true, type: 'text', group: 'Core Identity' },
    { id: 'MonitorSerial', label: 'Monitor Serial', type: 'text', group: 'Core Identity' },
    { id: 'Status', label: 'Status (Active/Repair/Storage)', required: true, type: 'dropdown', group: 'Core Identity' },
    
    { id: 'Type', label: 'Type / Category', type: 'dropdown', group: 'Hardware & Specs' },
    { id: 'Category', label: 'Category (Spare Parts)', type: 'dropdown', group: 'Hardware & Specs' },
    { id: 'AccessoryType', label: 'Accessory Type', type: 'dropdown', group: 'Hardware & Specs' },
    { id: 'Manufacturer', label: 'Manufacturer / Brand', required: false, type: 'text', group: 'Hardware & Specs' },
    { id: 'Model', label: 'Model', required: false, type: 'text', group: 'Hardware & Specs' },
    { id: 'CPU', label: 'CPU', type: 'text', group: 'Hardware & Specs' },
    { id: 'RAM_GB', label: 'RAM (GB)', type: 'number', group: 'Hardware & Specs' },
    { id: 'DiskSize_GB', label: 'Disk Size (GB/TB)', type: 'text', group: 'Hardware & Specs' },
    { id: 'OS', label: 'Operating System', type: 'text', group: 'Hardware & Specs' },
    { id: 'Capacity', label: 'Capacity (Storage)', type: 'text', group: 'Hardware & Specs' },
    { id: 'Resolution', label: 'Resolution', type: 'text', group: 'Hardware & Specs' },
    { id: 'LampHours', label: 'Lamp Hours', type: 'number', group: 'Hardware & Specs' },
    { id: 'Version', label: 'Software Version', type: 'text', group: 'Hardware & Specs' },
    
    { id: 'IPAddress', label: 'IP Address', required: false, type: 'text', group: 'Network & Connectivity' },
    { id: 'MacAddress', label: 'MAC Address', required: false, type: 'text', group: 'Network & Connectivity' },
    { id: 'PhoneNumber', label: 'Phone Number', type: 'text', group: 'Network & Connectivity' },
    { id: 'IMEI', label: 'IMEI', type: 'text', group: 'Network & Connectivity' },
    { id: 'PortName', label: 'Port Name', type: 'text', group: 'Network & Connectivity' },
    { id: 'DriverName', label: 'Driver Name', type: 'text', group: 'Network & Connectivity' },
    
    { id: 'UserName', label: 'Assigned User (Staff)', required: false, type: 'text', group: 'Assignment & Location' },
    { id: 'Location', label: 'Location / Room', required: false, type: 'text', group: 'Assignment & Location' },
    { id: 'AssignedComputer', label: 'Assigned Computer', type: 'text', group: 'Assignment & Location' },
    
    { id: 'Supplier', label: 'Supplier / Vendor', required: false, type: 'text', group: 'Purchase & Warranty' },
    { id: 'PurchaseDate', label: 'Purchase Date', required: false, type: 'date', group: 'Purchase & Warranty' },
    { id: 'WarrantyStartDate', label: 'Warranty Start', required: false, type: 'date', group: 'Purchase & Warranty' },
    { id: 'WarrantyEndDate', label: 'Warranty End', required: false, type: 'date', group: 'Purchase & Warranty' },
    { id: 'Price', label: 'Price / Cost', required: false, type: 'number', group: 'Purchase & Warranty' },
    
    { id: 'Quantity', label: 'Quantity (Stock)', required: false, type: 'number', group: 'Inventory & Notes' },
    { id: 'MinimumStock', label: 'Minimum Stock', required: false, type: 'number', group: 'Inventory & Notes' },
    { id: 'Description', label: 'Description / Notes', required: false, type: 'textarea', group: 'Inventory & Notes' }
];

// --- Global State Variables ---
let allData = {};
let currentEdit = { mode: null, collection: null, id: null };
let currentStaffEdit = { mode: null, id: null };
let statusChart = null;
let categoryChart = null;
let paginationState = {};
let handoverCart = [];
let returnCart = [];
let pingIntervalId = null; 
let currentImportCollection = null;
let selectedItems = {}; 
let collectionConfigs = {};

// ==========================================
// 1. Initialization & Core Logic
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user'));

    if (token && user) {
        if(document.getElementById('user-email-display')) {
            document.getElementById('user-email-display').textContent = user.email;
        }
        initTheme();
        initPrintStyles(); 
        initializeAppLogic();
    } else {
        window.location.replace('login.html');
    }
});

async function initializeAppLogic() {
    const success = await refreshAllData();
    if (success) {
        const loadingState = document.getElementById('loading-state');
        const appContainer = document.getElementById('app-container');
        
        if (loadingState) loadingState.style.display = 'none';
        if (appContainer) appContainer.classList.remove('hidden');

        renderSidebarDynamic(); 
        generateDynamicPages();
        window.updateDashboard();
        window.loadPage('Dashboard');
        
        runPeriodicPing();

        if (pingIntervalId) clearInterval(pingIntervalId);
        pingIntervalId = setInterval(async () => { 
            await runPeriodicPing();
            await refreshAllData();
            const visiblePage = document.querySelector('.page-content.active');
            if (visiblePage && visiblePage.id !== 'dashboard-page') {
                const colName = visiblePage.id.replace('-page', '');
                const realKey = Object.keys(collectionConfigs).find(k => k.toLowerCase() === colName);
                if(realKey) window.buildTable(realKey);
            }
        }, 60000); 
    }
}

window.logout = function() { 
    localStorage.removeItem('authToken'); 
    localStorage.removeItem('user'); 
    window.location.replace('login.html'); 
};

// --- API Helper ---
async function apiRequest(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('authToken');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        if (response.status === 401 || response.status === 403) { window.logout(); return; }
        if (!response.ok) {
            let errorMessage = `API Error ${response.status}`;
            try { const errorData = await response.json(); errorMessage = errorData.message || errorMessage; } catch (e) {}
            throw new Error(errorMessage);
        }
        if (response.status === 204) return null;
        return await response.json();
    } catch (error) {
        console.error(`API Request Error [${endpoint}]:`, error);
        throw error;
    }
}

// --- Data Refresh & Config Builder (🌟 แก้ไขการจับคู่ข้อมูล) ---
async function refreshAllData() {
    try {
        // รับค่ามาแบบตรงๆ เพื่อป้องกันข้อมูลโครงสร้างเปลี่ยน
        allData = await apiRequest('/api/inventory/all');
        
        const defaultConfigs = {
            Computers: { displayName: 'Computers', headers: ['Last Seen', 'ComputerName', 'SerialNumber', 'UserName', 'Status'], formFields: ['ComputerName', 'Manufacturer', 'Model', 'Type', 'SerialNumber', 'CPU', 'RAM_GB', 'DiskSize_GB', 'OS', 'IPAddress', 'MacAddress', 'UserName', 'Location', 'PurchaseDate', 'WarrantyEndDate', 'Status', 'Description'], nameField: 'ComputerName', serialField: 'SerialNumber', icon: 'fa-laptop', dropdowns: { Status: ['Active', 'On Loan', 'Repair', 'Storage', 'Damaged', 'Disposed'], Type: ['Desktop', 'Laptop', 'MacBook', 'Tablet', 'POS', 'Server', 'Other'] }, isCustom: false },
            Monitors: { displayName: 'Monitors', headers: ['Manufacturer', 'Model', 'MonitorSerial', 'UserName', 'Status'], formFields: ['Manufacturer', 'Model', 'MonitorSerial', 'UserName', 'Location', 'AssignedComputer', 'PurchaseDate', 'WarrantyEndDate', 'Status', 'Description'], nameField: 'Model', serialField: 'MonitorSerial', icon: 'fa-desktop', dropdowns: { Status: ['Active', 'On Loan', 'Repair', 'Storage', 'Damaged', 'Disposed'] }, isCustom: false },
            Accessory: { displayName: 'Accessories', headers: ['AccessoryType', 'Model', 'SerialNumber', 'UserName', 'Status'], formFields: ['AccessoryType', 'Manufacturer', 'Model', 'SerialNumber', 'UserName', 'Location', 'AssignedComputer', 'PurchaseDate', 'Status', 'Description'], nameField: 'Model', serialField: 'SerialNumber', icon: 'fa-keyboard', dropdowns: { Status: ['Active', 'On Loan', 'Repair', 'Storage', 'Damaged', 'Disposed'], AccessoryType: ['Mouse', 'Keyboard', 'Webcam', 'Docking', 'Adapter', 'Other'] }, isCustom: false },
            Printers: { displayName: 'Printers', headers: ['Name', 'Model', 'SerialNumber', 'IPAddress', 'Status'], formFields: ['Name', 'Manufacturer', 'Model', 'SerialNumber', 'IPAddress', 'MacAddress', 'Location', 'PurchaseDate', 'Status', 'Description'], nameField: 'Name', serialField: 'SerialNumber', icon: 'fa-print', dropdowns: { Status: ['Active', 'On Loan', 'Repair', 'Storage', 'Damaged', 'Disposed'] }, isCustom: false },
            Network: { displayName: 'Network Devices', headers: ['Last Seen', 'DeviceName', 'Model', 'IPAddress', 'Status'], formFields: ['DeviceName', 'Manufacturer', 'Model', 'SerialNumber', 'Type', 'IPAddress', 'MacAddress', 'Location', 'PurchaseDate', 'Status', 'Description'], nameField: 'DeviceName', serialField: 'SerialNumber', icon: 'fa-network-wired', dropdowns: { Status: ['Active', 'On Loan', 'Repair', 'Storage', 'Damaged', 'Disposed'], Type: ['Router', 'Switch', 'Access Point', 'Firewall', 'Other'] }, isCustom: false }
        };
        
        collectionConfigs = { ...defaultConfigs };
        const customMenus = allData.CustomMenus || [];

        customMenus.forEach(menu => {
            if (!menu.fields || !Array.isArray(menu.fields) || menu.fields.length === 0) return;
            const headerFields = menu.fields.slice(0, 5).map(f => f.id);
            if (!headerFields.includes('Status')) {
                 if (headerFields.length >= 5) headerFields[4] = 'Status';
                 else headerFields.push('Status');
            }

            const hasIP = menu.fields.some(f => f.id === 'IPAddress');
            const isComputer = menu.name === 'Computers';
            if ((hasIP || isComputer) && !headerFields.includes('Last Seen')) headerFields.unshift('Last Seen');

            const nameFieldObj = menu.fields.find(f => ['ComputerName', 'DeviceName', 'ItemName', 'PartName', 'Name', 'SoftwareName', 'Model'].includes(f.id));
            const nameField = nameFieldObj ? nameFieldObj.id : menu.fields[0].id;
            const serialFieldObj = menu.fields.find(f => ['SerialNumber', 'MonitorSerial'].includes(f.id));
            const serialField = serialFieldObj ? serialFieldObj.id : 'SerialNumber';

            collectionConfigs[menu.name] = {
                displayName: menu.displayName || menu.name,
                headers: headerFields,
                formFields: menu.fields.map(f => f.id),
                nameField: nameField,
                serialField: serialField,
                icon: menu.icon || 'fa-box',
                dropdowns: { 
                    Status: ['Active', 'On Loan', 'Repair', 'Storage', 'Damaged', 'Disposed'],
                    Type: ['Desktop', 'Laptop', 'MacBook', 'Tablet', 'POS', 'Server', 'Other'],
                    AccessoryType: ['Mouse', 'Keyboard', 'Webcam', 'Docking', 'Adapter', 'Other']
                },
                isCustom: true
            };
        });

        // 🌟 ดึง Collections ที่มีในฐานข้อมูลแต่ไม่มีใน Config ใส่ให้อัตโนมัติ (กันหน้าขาว)
        const skipKeys = ['Staff', 'CustomMenus', 'TransactionHistory', 'LoanHistory', 'Maintenance Log', 'admins'];
        Object.keys(allData).forEach(key => {
            if (!skipKeys.includes(key) && Array.isArray(allData[key]) && !collectionConfigs[key]) {
                collectionConfigs[key] = {
                    displayName: key,
                    headers: ['SerialNumber', 'Status'],
                    formFields: ['SerialNumber', 'Status', 'Description'],
                    nameField: 'SerialNumber',
                    serialField: 'SerialNumber',
                    icon: 'fa-box',
                    dropdowns: { Status: ['Active', 'On Loan', 'Repair', 'Storage', 'Damaged', 'Disposed'] },
                    isCustom: false
                };
            }
        });

        Object.keys(collectionConfigs).forEach(collectionName => {
            if (!paginationState[collectionName]) {
                paginationState[collectionName] = { currentPage: 1, rowsPerPage: 10, filterText: '', categoryFilter: null, statusFilter: '' };
            }
            if (!selectedItems[collectionName]) selectedItems[collectionName] = [];
        });

        return true;
    } catch (error) {
        const loadingDiv = document.getElementById('loading-state');
        if(loadingDiv) {
            loadingDiv.innerHTML = `<div class="text-center p-6"><i class="fas fa-exclamation-triangle text-5xl text-red-500 mb-4"></i><h3 class="text-xl font-bold text-gray-800 dark:text-white">Connection Failed</h3><p class="text-gray-500 dark:text-gray-400 mt-2">${error.message}</p><button onclick="location.reload()" class="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">Retry</button></div>`;
        }
        return false;
    }
}

// ==========================================
// 2. DISPOSAL SYSTEM HELPERS (แทงจำหน่าย)
// ==========================================
async function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

window.viewDisposalEvidence = function(base64Data) {
    if (!base64Data) return alert("ไม่พบเอกสารแนบในระบบ");
    if (base64Data.startsWith('data:application/pdf')) {
        const newWindow = window.open();
        newWindow.document.write(`<iframe src="${base64Data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
    } else {
        const newWindow = window.open();
        newWindow.document.write(`<div style="display:flex; justify-content:center; align-items:center; min-height:100vh; background:#333;"><img src="${base64Data}" style="max-width:100%; max-height:100vh; box-shadow:0 0 20px rgba(0,0,0,0.5);" /></div>`);
    }
};

window.renderDisposedAssets = function() {
    const tbody = document.getElementById('disposedTableBody');
    if (!tbody) return;
    let html = '';
    let disposedCount = 0;

    for (const [collection, items] of Object.entries(allData)) {
        if (['Staff', 'CustomMenus', 'TransactionHistory', 'admins', 'LoanHistory', 'Maintenance Log'].includes(collection)) continue;
        if (!Array.isArray(items)) continue; // ป้องกันบั๊กถ้า items ไม่ใช่ Array
        
        const disposedItems = items.filter(i => i.Status === 'Disposed');
        disposedItems.forEach(item => {
            disposedCount++;
            const config = collectionConfigs[collection];
            const nameField = config ? config.nameField : 'SerialNumber';
            const name = item[nameField] || item.ComputerName || item.ItemName || 'Unknown Device';
            const serial = item.SerialNumber || item.MonitorSerial || 'N/A';
            const date = item.DisposalDate ? new Date(item.DisposalDate).toLocaleDateString('th-TH') : '-';
            
            let evidenceBtn = '<span class="text-gray-400 text-xs italic">ไม่มีเอกสาร</span>';
            if (item.DisposalEvidence) {
                evidenceBtn = `<button onclick="window.viewDisposalEvidence(this.getAttribute('data-file'))" data-file="${item.DisposalEvidence}" class="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-xs font-bold shadow-sm transition"><i class="fas fa-file-pdf mr-1"></i> ดูเอกสาร</button>`;
            }

            html += `
                <tr class="hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        <i class="fas fa-box text-red-400 mr-2"></i> ${name}
                        <div class="text-xs text-gray-500 font-normal ml-6 mt-1">From: ${collection}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">${serial}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">${date}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">${evidenceBtn}</td>
                </tr>
            `;
        });
    }

    if (disposedCount === 0) html = `<tr><td colspan="4" class="px-6 py-10 text-center text-gray-500">ยังไม่มีรายการอุปกรณ์ที่ถูกแทงจำหน่าย</td></tr>`;
    tbody.innerHTML = html;
};

// --- THEME LOGIC ---
function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const darkIcon = document.getElementById('theme-icon');

    if (!themeToggleBtn) return;

    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            if (darkIcon) { darkIcon.classList.remove('fa-moon', 'text-gray-600'); darkIcon.classList.add('fa-sun', 'text-yellow-400'); }
            const text = document.getElementById('theme-text');
            if(text) text.textContent = 'Light Mode';
        } else {
            document.documentElement.classList.remove('dark');
            if (darkIcon) { darkIcon.classList.remove('fa-sun', 'text-yellow-400'); darkIcon.classList.add('fa-moon', 'text-gray-600'); }
            const text = document.getElementById('theme-text');
            if(text) text.textContent = 'Dark Mode';
        }
        localStorage.setItem('color-theme', theme);
    }

    const savedTheme = localStorage.getItem('color-theme');
    const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && sysDark)) applyTheme('dark');
    else applyTheme('light');

    themeToggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.contains('dark');
        applyTheme(isDark ? 'light' : 'dark');
    });
}

// --- PRINT STYLES ---
function initPrintStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
        @media print {
            body * { visibility: hidden; }
            #print-area, #print-area * { visibility: visible; }
            #print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; border: none !important; }
            .label-page { 
                page-break-after: always; page-break-inside: avoid; margin: 0; padding: 0; box-sizing: border-box; background-color: white;
            }
            .label-page.preview-border { border: none !important; box-shadow: none !important; }
            .no-print { display: none !important; }
        }
    `;
    document.head.appendChild(style);
}

// ==========================================
// --- PERIODIC PING FUNCTION ---
// ==========================================
async function runPeriodicPing() {
    const pingPromises = [];
    Object.keys(collectionConfigs).forEach(colName => {
        const items = allData[colName] || [];
        const config = collectionConfigs[colName];
        
        const hasIP = config.formFields.includes('IPAddress');
        const isComputers = colName === 'Computers';
        
        if (hasIP || isComputers) {
            items.forEach(item => {
                let target = null;
                if (isComputers && item.ComputerName && item.ComputerName.trim() !== '') target = item.ComputerName;
                else if (item.IPAddress && item.IPAddress !== 'N/A' && item.IPAddress.trim() !== '') target = item.IPAddress;
                
                if (target) {
                    pingPromises.push(apiRequest(`/api/ping/${target}?collection=${colName}`).catch(e => null));
                }
            });
        }
    });
    await Promise.allSettled(pingPromises);
}

window.formatTimeAgo = (dateString) => {
    if (!dateString) return "ไม่ทราบ";
    const date = new Date(dateString);
    const diffMins = Math.floor((new Date() - date) / 60000);
    if (diffMins < 1) return "เมื่อสักครู่";
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} ชั่วโมงที่แล้ว`;
    if (diffMins < 10080) return `${Math.floor(diffMins / 1440)} วันที่แล้ว`;
    return date.toLocaleDateString('th-TH');
};

// ==========================================
// --- RECURSIVE SIDEBAR & MENU SYSTEM ---
// ==========================================
function renderSidebarDynamic() {
    const container = document.getElementById('sidebar-menu-container');
    if (!container) return;
    container.innerHTML = ''; 

    const dashboardNode = { id: 'Dashboard', name: 'Dashboard', icon: 'fa-tachometer-alt', children: [], isSystem: true, clickAction: "window.loadPage('Dashboard', this)" };
    
    const assetChildren = [
        { id: 'Computers', name: 'Computers', icon: 'fa-laptop', isSystem: true, clickAction: "window.loadPage('Computers', this)" },
        { id: 'Monitors', name: 'Monitors', icon: 'fa-desktop', isSystem: true, clickAction: "window.loadPage('Monitors', this)" },
        { id: 'Accessory', name: 'Accessories', icon: 'fa-keyboard', isSystem: true, clickAction: "window.loadPage('Accessory', this)" },
        { id: 'Printers', name: 'Printers', icon: 'fa-print', isSystem: true, clickAction: "window.loadPage('Printers', this)" },
        { id: 'Network', name: 'Network', icon: 'fa-network-wired', isSystem: true, clickAction: "window.loadPage('Network', this)" }
    ];
    
    const managementChildren = [
        { 
            id: 'Transactions', name: 'Transactions', icon: 'fa-tasks', isSystem: true,
            children: [
                { id: 'Handover', name: 'Handover / Return', icon: 'fa-dolly-flatbed', isSystem: true, clickAction: "window.loadPage('Handover', this)" },
                { id: 'LoanPage', name: 'Loan Page (for User)', icon: 'fa-external-link-alt', isSystem: true, clickAction: "window.open('loan.html', '_blank')" }
            ]
        },
        { 
            id: 'Reports', name: 'Reports', icon: 'fa-file-alt', isSystem: true,
            children: [
                { id: 'LoanHistory', name: 'Loan History', icon: 'fa-history', isSystem: true, clickAction: "window.loadPage('LoanHistory', this)" },
                { id: 'Maintenance', name: 'Maintenance History', icon: 'fa-tools', isSystem: true, clickAction: "window.loadPage('Maintenance', this)" },
                { id: 'AssetsByUser', name: 'Assets by User', icon: 'fa-user-tag', isSystem: true, clickAction: "window.loadPage('AssetsByUser', this)" },
                { id: 'DisposedAssets', name: 'Disposed Assets', icon: 'fa-trash-alt', isSystem: true, clickAction: "window.loadPage('DisposedAssets', this)" }
            ]
        },
        { 
            id: 'UserSettings', name: 'System Settings', icon: 'fa-cogs', isSystem: true,
            children: [
                { id: 'StaffManagement', name: 'Staff Management', icon: 'fa-users', isSystem: true, clickAction: "window.loadPage('StaffManagement', this)" },
                { id: 'AdminManagement', name: 'Admin Management', icon: 'fa-user-shield', isSystem: true, clickAction: "window.loadPage('AdminManagement', this)" },
                { id: 'LabelPrinter', name: 'Label Printer', icon: 'fa-tags', isSystem: true, clickAction: "window.loadPage('LabelPrinter', this)" },
                { id: 'Settings', name: 'Custom Categories', icon: 'fa-sliders-h', isSystem: true, clickAction: "window.loadPage('Settings', this)" }
            ]
        }
    ];

    const customMenus = allData.CustomMenus || [];
    const customNodes = customMenus
        .filter(m => collectionConfigs[m.name] && m.name !== 'Computers' && m.name !== 'Monitors' && m.name !== 'Accessory' && m.name !== 'Printers' && m.name !== 'Network')
        .sort((a, b) => (a.order || 0) - (b.order || 0) || a.displayName.localeCompare(b.displayName))
        .map(m => ({
            id: m.name, name: m.displayName, icon: m.icon, isSystem: false, parentId: m.parentId, clickAction: `window.loadPage('${m.name}', this)`, allowDelete: true, allowEdit: true, order: m.order
        }));

    // เพิ่มหมวดหมู่ที่ตรวจพบใหม่เข้าไปในเมนูซ้ายอัตโนมัติ
    const existingSidebarIds = ['Computers', 'Monitors', 'Accessory', 'Printers', 'Network'];
    const customIds = customNodes.map(n => n.id);
    const allKnown = [...existingSidebarIds, ...customIds];
    Object.keys(collectionConfigs).forEach(key => {
        if (!allKnown.includes(key)) {
            customNodes.push({ id: key, name: collectionConfigs[key].displayName, icon: 'fa-box', isSystem: false, parentId: null, clickAction: `window.loadPage('${key}', this)`, allowDelete: false, allowEdit: true, order: 99 });
        }
    });

    const rootNodes = [dashboardNode];
    rootNodes.push({ type: 'header', label: 'Assets' });
    
    rootNodes.push(...assetChildren, ...customNodes.filter(n => !n.parentId));
    rootNodes.push({ type: 'header', label: 'Management' });
    rootNodes.push(...managementChildren);

    const nodeMap = {};
    [...rootNodes, ...customNodes].forEach(n => { if(n.id) nodeMap[n.id] = n; });
    customNodes.forEach(node => {
        if (node.parentId && nodeMap[node.parentId]) {
            if (!nodeMap[node.parentId].children) nodeMap[node.parentId].children = [];
            if (!nodeMap[node.parentId].children.find(c => c.id === node.id)) {
                nodeMap[node.parentId].children.push(node);
                nodeMap[node.parentId].children.sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name));
            }
        }
    });

    function createMenuHTML(node) {
        if (node.type === 'header') return `<li class="pt-4"><div class="px-4 text-xs font-semibold uppercase text-gray-400 mb-1">${node.label}</div></li>`;
        
        const hasChildren = node.children && node.children.length > 0;
        const editBtn = node.allowEdit ? `<button onclick="window.openEditMenuModal('${node.id}', event)" class="ml-2 text-xs text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"><i class="fas fa-edit"></i></button>` : '';
        const deleteBtn = node.allowDelete ? `<button onclick="window.deleteCustomMenu('${node.id}', event)" class="ml-2 text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><i class="fas fa-trash"></i></button>` : '';

        let textColor = node.id === 'DisposedAssets' ? 'text-red-500 dark:text-red-400' : 'text-gray-600 dark:text-gray-300';

        if (hasChildren) {
            return `<li><details class="group nav-group"><summary class="nav-link flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"><div class="flex items-center space-x-3"><i class="fas ${node.icon} w-5 text-center"></i><span>${node.name}</span></div><div class="flex items-center">${editBtn}${deleteBtn}<i class="fas fa-chevron-right text-xs transform group-open:rotate-90 transition-transform ml-2"></i></div></summary><ul class="pl-4 pt-1 space-y-1 border-l-2 border-gray-100 dark:border-gray-700 ml-6">${node.children.map(createMenuHTML).join('')}</ul></details></li>`;
        }
        return `<li><a href="#" id="nav-${node.id}" onclick="${node.clickAction}; return false;" class="nav-link flex items-center space-x-3 px-4 py-2.5 rounded-lg ${textColor} group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><i class="fas ${node.icon} w-5 text-center"></i><span class="flex-1">${node.name}</span>${editBtn}${deleteBtn}</a></li>`;
    }

    rootNodes.forEach(node => { if (node.type === 'header' || !node.parentId) container.insertAdjacentHTML('beforeend', createMenuHTML(node)); });
}

function generateDynamicPages() {
    const container = document.getElementById('dynamic-pages-container');
    if (!container) return;
    container.innerHTML = ''; 

    Object.keys(collectionConfigs).forEach(colName => {
        const config = collectionConfigs[colName];
        if (!config) return;
        const pageId = `${colName.toLowerCase()}-page`;
        const displayName = config.displayName || colName;
        const statusOptions = config.dropdowns.Status ? config.dropdowns.Status.map(s => `<option value="${s}">${s}</option>`).join('') : '';
        
        container.innerHTML += `
        <div id="${pageId}" class="page-content hidden">
            <div class="flex flex-wrap justify-between items-center gap-2 mb-6">
                <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">${displayName}</h2>
                <div class="flex gap-2">
                    <button onclick="window.openImportModal('${colName}')" class="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 shadow-sm"><i class="fas fa-file-import mr-2"></i>Import CSV</button>
                    <button onclick="window.openModal('add', '${colName}')" class="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 shadow-sm"><i class="fas fa-plus mr-2"></i>Add New</button>
                </div>
            </div>
            
            <div class="mb-4 flex flex-col md:flex-row gap-2">
                <div class="w-full md:w-1/4">
                    <select onchange="window.handleStatusFilter('${colName}', this.value)" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                        <option value="">All Statuses</option>
                        ${statusOptions}
                    </select>
                </div>
                <div class="w-full md:w-3/4">
                    <input type="text" id="${colName.toLowerCase()}SearchInput" onkeyup="window.handleSearch('${colName}', this.value)" placeholder="Search ${displayName}..." class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400">
                </div>
            </div>

            <div id="${colName}BulkActions" class="hidden mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg flex items-center justify-between">
                <div class="text-indigo-800 dark:text-indigo-200 text-sm font-semibold">
                    <i class="fas fa-check-square mr-1"></i> <span class="selected-count">0 item(s) selected</span>
                </div>
                <div class="flex space-x-2">
                    <button onclick="window.openBulkEditModal('${colName}')" class="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 shadow-sm"><i class="fas fa-edit mr-1"></i>Bulk Edit</button>
                    <button onclick="window.bulkDelete('${colName}')" class="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 shadow-sm"><i class="fas fa-trash mr-1"></i>Bulk Delete</button>
                </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                <div class="overflow-x-auto"><table id="${colName}Table" class="min-w-full table-fixed"></table></div>
            </div>
            <div id="${colName}Pagination" class="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-300"></div>
        </div>`;
    });
}

// ==========================================
// --- PAGE LOAD & SWITCHING ---
// ==========================================
window.loadPage = function(pageName, navElement) {
    document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.remove('bg-indigo-50', 'text-indigo-600', 'dark:bg-gray-700', 'dark:text-white', 'font-semibold');
        l.classList.add('text-gray-600', 'dark:text-gray-300');
    });

    document.querySelectorAll('.page-content').forEach(p => {
        p.classList.remove('active');
        p.classList.add('hidden');
        p.style.display = 'none';
    });

    let targetNav = navElement || document.getElementById(`nav-${pageName}`);
    if (targetNav) {
        targetNav.classList.remove('text-gray-600', 'dark:text-gray-300');
        targetNav.classList.add('bg-indigo-50', 'text-indigo-600', 'dark:bg-gray-700', 'dark:text-white', 'font-semibold');
        const parentDetails = targetNav.closest('details');
        if (parentDetails) parentDetails.setAttribute('open', 'true');
    }

    const pageId = `${pageName.toLowerCase()}-page`;
    let pageDiv = document.getElementById(pageId);
    
    if (pageName === 'LabelPrinter' && !pageDiv) {
        pageDiv = document.createElement('div'); 
        pageDiv.id = pageId; 
        pageDiv.className = 'page-content hidden';
        document.getElementById('main-content').appendChild(pageDiv);
    }

    if (pageDiv) {
        pageDiv.classList.remove('hidden');
        pageDiv.classList.add('active');
        pageDiv.style.display = 'block';

        if (pageName === 'Dashboard') window.updateDashboard();
        else if (pageName === 'LoanHistory') window.buildLoanHistoryCards();
        else if (pageName === 'Maintenance') window.buildMaintenancePage();
        else if (pageName === 'AssetsByUser') window.buildAssetsByUserPage();
        else if (pageName === 'Handover') window.buildHandoverReturnPage();
        else if (pageName === 'StaffManagement') window.buildStaffManagementPage();
        else if (pageName === 'AdminManagement') window.buildAdminManagementPage();
        else if (pageName === 'DisposedAssets') window.renderDisposedAssets();
        else if (pageName === 'Settings') window.renderSettings();
        else if (pageName === 'LabelPrinter') window.buildLabelPrinterPage(); // โชว์หน้าปริ้น
        else if (collectionConfigs[pageName]) {
            if (paginationState[pageName]) {
                paginationState[pageName].filterText = '';
                const searchInput = document.getElementById(`${pageName.toLowerCase()}SearchInput`);
                if (searchInput) searchInput.value = '';
                window.buildTable(pageName);
            }
        }
    }
    
    if (window.innerWidth < 768) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if(sidebar) sidebar.classList.add('-translate-x-full');
        if(overlay) overlay.classList.add('hidden');
    }
};

// ==========================================
// --- CUSTOM MENU MODAL LOGIC & SETTINGS ---
// ==========================================
window.renderSettings = function() {
    const area = document.getElementById('settings-content-area');
    if (!area) return;

    let html = `
        <div class="mb-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4"><i class="fas fa-plus-circle text-indigo-500 mr-2"></i>Create Custom Category</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div><label class="block text-xs text-gray-500 uppercase tracking-wider mb-1">Database ID (e.g. Projectors)</label><input type="text" id="newMenuIdSettings" placeholder="No spaces" class="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700"></div>
                <div><label class="block text-xs text-gray-500 uppercase tracking-wider mb-1">Display Name</label><input type="text" id="newMenuNameSettings" placeholder="Display Name" class="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700"></div>
                <div><label class="block text-xs text-gray-500 uppercase tracking-wider mb-1">Icon (FontAwesome Class)</label><input type="text" id="newMenuIconSettings" placeholder="e.g., fa-video" class="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700"></div>
            </div>
            <button onclick="window.openAddMenuModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition shadow-sm">
                Advanced Configuration / Create
            </button>
        </div>

        <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">Existing Custom Categories</h3>
        <ul class="space-y-3">
    `;

    const customMenus = allData.CustomMenus || [];
    if (customMenus.length === 0) {
        html += `<p class="text-gray-500 text-sm">No custom categories created yet.</p>`;
    } else {
        customMenus.forEach(menu => {
            html += `
                <li class="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div class="flex items-center">
                        <div class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4"><i class="fas ${menu.icon || 'fa-box'}"></i></div>
                        <div>
                            <strong class="text-gray-800 dark:text-white block">${menu.displayName}</strong>
                            <span class="text-xs text-gray-500">ID: ${menu.name} • Fields: ${menu.fields ? menu.fields.length : 0}</span>
                        </div>
                    </div>
                    <div>
                        <button onclick="window.openEditMenuModal('${menu.name}', event)" class="text-blue-500 hover:text-blue-700 mr-3 p-2"><i class="fas fa-edit"></i></button>
                        <button onclick="window.deleteCustomMenu('${menu.name}')" class="text-red-500 hover:text-red-700 p-2"><i class="fas fa-trash"></i></button>
                    </div>
                </li>
            `;
        });
    }

    html += `</ul>`;
    area.innerHTML = html;
};

window.openAddMenuModal = function() {
    const form = document.getElementById('addMenuForm');
    if (form) form.reset();
    document.getElementById('addMenuModalTitle').textContent = "Create Custom Menu";
    document.getElementById('editMenuMode').value = "create";
    
    const idInput = document.getElementById('newMenuIdSettings');
    const nameInput = document.getElementById('newMenuNameSettings');
    const iconInput = document.getElementById('newMenuIconSettings');
    if(idInput && idInput.value) document.getElementById('newMenuId').value = idInput.value;
    if(nameInput && nameInput.value) document.getElementById('newMenuDisplay').value = nameInput.value;
    if(iconInput && iconInput.value) document.getElementById('newMenuIcon').value = iconInput.value;

    document.getElementById('newMenuId').disabled = false;
    document.getElementById('newMenuId').classList.remove('bg-gray-200', 'cursor-not-allowed');
    window.populateParentDropdown();
    
    document.querySelectorAll('.col-checkbox').forEach(cb => { if(!cb.disabled) cb.checked = true; });
    document.getElementById('addMenuModal').classList.remove('opacity-0', 'pointer-events-none');
};

window.openEditMenuModal = function(menuName, event) {
    if (event) event.stopPropagation();
    const menu = allData.CustomMenus.find(m => m.name === menuName);
    if (!menu) return;

    document.getElementById('addMenuModalTitle').textContent = "Edit Custom Menu";
    document.getElementById('editMenuMode').value = "edit";
    document.getElementById('newMenuId').value = menu.name;
    document.getElementById('newMenuId').disabled = true;
    document.getElementById('newMenuId').classList.add('bg-gray-200', 'cursor-not-allowed');
    document.getElementById('newMenuDisplay').value = menu.displayName;
    document.getElementById('newMenuIcon').value = menu.icon || 'fa-box';
    document.getElementById('newMenuOrder').value = menu.order || 0;
    window.populateParentDropdown(menu.parentId); 
    
    document.querySelectorAll('.col-checkbox').forEach(cb => cb.checked = false);
    if (menu.fields && Array.isArray(menu.fields)) {
        menu.fields.forEach(f => {
            const cb = document.getElementById(`field_${f.id}`);
            if(cb) cb.checked = true;
        });
    }

    document.getElementById('addMenuModal').classList.remove('opacity-0', 'pointer-events-none');
};

window.populateParentDropdown = function(selectedParentId = null) {
    const parentSelect = document.getElementById('newMenuParent');
    if (!parentSelect) return;
    parentSelect.innerHTML = '<option value="">(None - Root Level)</option>';
    const currentEditingId = document.getElementById('newMenuId').value;
    (allData.CustomMenus || []).forEach(menu => {
        if(collectionConfigs[menu.name] && menu.name !== currentEditingId) {
            const selected = menu.name === selectedParentId ? 'selected' : '';
            parentSelect.innerHTML += `<option value="${menu.name}" ${selected}>${menu.displayName}</option>`;
        }
    });
};

function initColumnSelector() {
    const colContainer = document.getElementById('column-selector-container');
    if(!colContainer) return;
    colContainer.innerHTML = '';
    
    const groups = {};
    AVAILABLE_FIELDS.forEach(field => {
        const grp = field.group || 'Other';
        if (!groups[grp]) groups[grp] = [];
        groups[grp].push(field);
    });

    let html = '';
    for (const [groupName, fields] of Object.entries(groups)) {
        html += `<div class="col-span-full mt-3 mb-1 border-b dark:border-gray-700 pb-1"><h4 class="text-sm font-bold text-indigo-600 dark:text-indigo-400">${groupName}</h4></div>`;
        fields.forEach(field => {
            const isRequired = field.id === 'SerialNumber' || field.id === 'ItemName' || field.id === 'Status'; 
            html += `<div class="flex items-center space-x-2"><input type="checkbox" id="field_${field.id}" value="${field.id}" ${isRequired?'checked disabled':'checked'} class="col-checkbox rounded text-indigo-600 focus:ring-indigo-500"><label for="field_${field.id}" class="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">${field.label} ${isRequired?'<span class="text-xs text-red-500 ml-1">*Required</span>':''}</label></div>`;
        });
    }
    colContainer.innerHTML = html;
}
setTimeout(initColumnSelector, 1000);

window.saveCustomMenu = async function() {
    const mode = document.getElementById('editMenuMode').value;
    const idInput = document.getElementById('newMenuId').value.trim();
    const displayInput = document.getElementById('newMenuDisplay').value.trim();
    const iconInput = document.getElementById('newMenuIcon').value;
    const parentInput = document.getElementById('newMenuParent').value;
    const orderInput = document.getElementById('newMenuOrder').value;
    
    if (!idInput || !displayInput) return showNotificationModal('warning', 'Missing Info', 'Please fill Menu Name and Display Name.');
    if (mode === 'create' && !/^[a-zA-Z0-9]+$/.test(idInput)) return showNotificationModal('warning', 'Invalid Name', 'Menu ID must only contain letters and numbers.');

    const selectedFields = [];
    document.querySelectorAll('.col-checkbox').forEach(cb => {
        if(cb.checked || cb.disabled) selectedFields.push(AVAILABLE_FIELDS.find(f => f.id === cb.value) || { id: cb.value, label: cb.value, type: 'text' });
    });

    const payload = { name: idInput, displayName: displayInput, icon: iconInput, parentId: parentInput || null, order: orderInput, fields: selectedFields };

    try {
        if (mode === 'edit') await apiRequest(`/api/custom-menus/${idInput}`, 'PUT', payload);
        else await apiRequest('/api/custom-menus', 'POST', payload);
        showNotificationModal('success', 'Menu Updated', `Custom menu saved.`);
        window.hideModal('addMenuModal');
        await initializeAppLogic(); 
        if(document.getElementById('settings-page').style.display === 'block') window.renderSettings();
    } catch (error) { showNotificationModal('warning', 'Error', error.message); }
};

window.deleteCustomMenu = async function(menuName, event) {
    if (event) event.stopPropagation();
    if (!confirm(`Delete menu "${menuName}"? Data will NOT be deleted.`)) return;
    try {
        await apiRequest(`/api/custom-menus/${menuName}`, 'DELETE');
        showNotificationModal('success', 'Deleted', `Menu deleted.`);
        await initializeAppLogic();
        if(document.getElementById('settings-page').style.display === 'block') window.renderSettings();
    } catch (error) { showNotificationModal('warning', 'Cannot Delete', error.message); }
};

// ==========================================
// --- BULK SELECTION & MANAGEMENT ---
// ==========================================
window.toggleSelectAll = function(collectionName, checkbox) {
    const isChecked = checkbox.checked;
    const checkboxes = document.querySelectorAll(`.${collectionName}-row-cb`);
    selectedItems[collectionName] = selectedItems[collectionName] || [];
    checkboxes.forEach(cb => {
        cb.checked = isChecked;
        if (isChecked && !selectedItems[collectionName].includes(cb.value)) selectedItems[collectionName].push(cb.value);
        else if (!isChecked) selectedItems[collectionName] = selectedItems[collectionName].filter(id => id !== cb.value);
    });
    window.updateBulkActionBar(collectionName);
};

window.toggleSelectItem = function(collectionName, checkbox) {
    selectedItems[collectionName] = selectedItems[collectionName] || [];
    if (checkbox.checked) { if (!selectedItems[collectionName].includes(checkbox.value)) selectedItems[collectionName].push(checkbox.value); } 
    else { selectedItems[collectionName] = selectedItems[collectionName].filter(id => id !== checkbox.value); document.getElementById(`selectAll_${collectionName}`).checked = false; }
    window.updateBulkActionBar(collectionName);
};

window.updateBulkActionBar = function(collectionName) {
    const count = (selectedItems[collectionName] || []).length;
    const bar = document.getElementById(`${collectionName}BulkActions`);
    if (!bar) return;
    if (count > 0) { bar.classList.remove('hidden'); bar.querySelector('.selected-count').textContent = `${count} item(s) selected`; } 
    else { bar.classList.add('hidden'); document.getElementById(`selectAll_${collectionName}`).checked = false; }
};

window.bulkDelete = async function(collectionName) {
    const ids = selectedItems[collectionName] || [];
    if (ids.length === 0) return;
    if (!confirm(`Are you sure you want to permanently delete ${ids.length} selected item(s)?`)) return;
    try {
        await apiRequest(`/api/inventory/${collectionName}/bulk-delete`, 'POST', { ids });
        showNotificationModal('success', 'Bulk Delete Successful', `Deleted ${ids.length} item(s).`);
        selectedItems[collectionName] = []; 
        await refreshAllData(); window.buildTable(collectionName); window.updateDashboard();
    } catch (error) { showNotificationModal('warning', 'Bulk Delete Failed', error.message); }
};

window.openBulkEditModal = function(collectionName) {
    const ids = selectedItems[collectionName] || [];
    if (ids.length === 0) return;
    document.getElementById('bulkEditForm').reset();
    document.getElementById('bulkEditCollection').value = collectionName;
    document.getElementById('bulkEditCount').textContent = ids.length;
    document.getElementById('bulkEditModal').classList.remove('opacity-0', 'pointer-events-none');
};

window.saveBulkEdit = async function() {
    const collectionName = document.getElementById('bulkEditCollection').value;
    const ids = selectedItems[collectionName] || [];
    const updateData = {};
    const status = document.getElementById('bulkEditStatus').value;
    const location = document.getElementById('bulkEditLocation').value.trim();
    const user = document.getElementById('bulkEditUser').value.trim();
    if (status) updateData.Status = status; if (location) updateData.Location = location; if (user !== '') updateData.UserName = user; 
    
    if (Object.keys(updateData).length === 0) { window.hideModal('bulkEditModal'); return; }
    try {
        await apiRequest(`/api/inventory/${collectionName}/bulk-update`, 'PUT', { ids, updateData });
        showNotificationModal('success', 'Bulk Update Successful', `Updated ${ids.length} item(s).`);
        window.hideModal('bulkEditModal'); selectedItems[collectionName] = []; 
        await refreshAllData(); window.buildTable(collectionName); window.updateDashboard();
    } catch (error) { showNotificationModal('warning', 'Bulk Update Failed', error.message); }
};

// --- Table Building Logic ---
window.buildTable = function(collectionName) {
    const table = document.getElementById(collectionName + 'Table');
    if (!table) return;
    const state = paginationState[collectionName];
    const fullData = allData[collectionName] || [];
    const config = collectionConfigs[collectionName];
    
    let filteredData = fullData.filter(i => i.Status !== 'Disposed');
    if (state.statusFilter) filteredData = filteredData.filter(i => i.Status === state.statusFilter);
    if (state.categoryFilter && config.categoryFilterField) filteredData = filteredData.filter(item => item[config.categoryFilterField] === state.categoryFilter);
    if (state.filterText) filteredData = filteredData.filter(i => JSON.stringify(Object.values(i)).toUpperCase().includes(state.filterText.toUpperCase()));
    
    const totalRows = filteredData.length;
    const startIndex = (state.currentPage - 1) * state.rowsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + state.rowsPerPage);
    
    let html = `<thead class="bg-gray-50 dark:bg-gray-700"><tr><th class="px-4 py-3 w-12 text-center"><input type="checkbox" id="selectAll_${collectionName}" onclick="window.toggleSelectAll('${collectionName}', this)" class="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"></th>`;

    config.headers.forEach(h => {
        const fieldDef = AVAILABLE_FIELDS.find(f => f.id === h);
        html += `<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">${fieldDef ? fieldDef.label : h}</th>`
    });
    html += `<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th></tr></thead><tbody class="divide-y divide-gray-200 dark:divide-gray-700">`;
    
    if (paginatedData.length === 0) html += `<tr><td colspan="${config.headers.length + 2}" class="px-6 py-4 text-center text-gray-500">No data found.</td></tr>`;
    else {
        let allCurrentPageSelected = true;
        paginatedData.forEach(item => {
            const id = item._id || item.id;
            const isChecked = (selectedItems[collectionName] || []).includes(id);
            if (!isChecked) allCurrentPageSelected = false;

            html += `<tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"><td class="px-4 py-3 text-center"><input type="checkbox" value="${id}" onclick="window.toggleSelectItem('${collectionName}', this)" class="${collectionName}-row-cb rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer" ${isChecked ? 'checked' : ''}></td>`;

            config.headers.forEach(header => {
                let val = item[header] || '';
                if (header === 'Status') {
                   let color = 'gray'; if (val === 'Active') color = 'green'; else if (val === 'On Loan') color = 'yellow'; else if (val === 'Repair') color = 'orange'; else if (val === 'Storage') color = 'blue'; else if (val === 'Damaged') color = 'red';
                   val = `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${color}-100 text-${color}-800 dark:bg-${color}-900/50 dark:text-${color}-300">${val}</span>`; 
                } else if (header === 'Last Seen') {
                     if (item.lastSeenOnline) {
                        const diffMins = (new Date() - new Date(item.lastSeenOnline)) / 60000;
                        if (diffMins <= 15) val = `<div class="flex items-center space-x-2"><div class="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e] animate-pulse"></div><span class="font-medium text-green-600 dark:text-green-400">Online</span></div>`;
                        else val = `<div class="flex flex-col"><div class="flex items-center space-x-2"><div class="h-2.5 w-2.5 rounded-full bg-gray-400"></div><span class="text-gray-500">Offline</span></div><span class="text-[10px] text-gray-400 mt-0.5" title="${new Date(item.lastSeenOnline).toLocaleString('th-TH')}">ล่าสุด: ${window.formatTimeAgo(item.lastSeenOnline)}</span></div>`;
                     } else {
                        val = `<div class="flex items-center space-x-2"><div class="h-2.5 w-2.5 rounded-full bg-yellow-400"></div><span class="text-gray-500">Unknown</span></div>`;
                     }
                }
                html += `<td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap max-w-xs truncate" title="${String(val).replace(/<[^>]*>?/gm, '')}">${val}</td>`;
            });
            html += `<td class="px-6 py-4 text-sm font-medium space-x-3 whitespace-nowrap"><button onclick="window.openModal('edit', '${collectionName}', '${id}')" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"><i class="fas fa-edit"></i></button><button onclick="window.deleteItem('${collectionName}', '${id}')" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><i class="fas fa-trash"></i></button><button onclick="window.showQrModal('${item[config.serialField] || id}', '${item[config.nameField] || 'Asset'}')" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"><i class="fas fa-qrcode"></i></button></td></tr>`;
        });
        setTimeout(() => { const selectAllCb = document.getElementById(`selectAll_${collectionName}`); if (selectAllCb) selectAllCb.checked = paginatedData.length > 0 && allCurrentPageSelected; }, 10);
    }
    table.innerHTML = html + `</tbody>`;
    window.renderPaginationControls(collectionName, totalRows);
    window.updateBulkActionBar(collectionName);
};

window.renderPaginationControls = function(collectionName, totalRows) {
    const container = document.getElementById(collectionName + 'Pagination');
    if (!container) return;
    const state = paginationState[collectionName];
    const totalPages = Math.ceil(totalRows / state.rowsPerPage);
    const startItem = totalRows > 0 ? (state.currentPage - 1) * state.rowsPerPage + 1 : 0;
    const endItem = Math.min(state.currentPage * state.rowsPerPage, totalRows);
    container.innerHTML = `<div class="text-sm">Showing <span class="font-semibold">${startItem}</span> to <span class="font-semibold">${endItem}</span> of <span class="font-semibold">${totalRows}</span> results</div><div class="flex items-center space-x-2"><label class="text-sm font-medium">Rows:</label><select onchange="window.changeRowsPerPage('${collectionName}', this)" class="rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-sm"><option value="10" ${state.rowsPerPage == 10 ? 'selected' : ''}>10</option><option value="25" ${state.rowsPerPage == 25 ? 'selected' : ''}>25</option><option value="50" ${state.rowsPerPage == 50 ? 'selected' : ''}>50</option></select><button onclick="window.changePage('${collectionName}', -1)" ${state.currentPage===1?'disabled':''} class="px-2 py-1 border rounded disabled:opacity-50 bg-white dark:bg-gray-700"><i class="fas fa-chevron-left"></i></button><span class="text-sm">Page ${state.currentPage} / ${totalPages || 1}</span><button onclick="window.changePage('${collectionName}', 1)" ${state.currentPage>=totalPages?'disabled':''} class="px-2 py-1 border rounded disabled:opacity-50 bg-white dark:bg-gray-700"><i class="fas fa-chevron-right"></i></button></div>`;
};

// ==========================================
// --- NEW REDESIGNED CRUD MODAL ---
// ==========================================
window.openModal = function(mode, collectionName, id = null) {
    currentEdit = { mode, collection: collectionName, id };
    const form = document.getElementById('editForm');
    if (!form) return;
    form.innerHTML = '';
    const config = collectionConfigs[collectionName];
    const itemData = (mode === 'edit' && allData[collectionName]) ? allData[collectionName].find(i => i._id === id || i.id === id) || {} : {};
    
    const actionText = mode === 'edit' ? 'Edit' : 'Add New';
    const actionIcon = mode === 'edit' ? 'fa-edit' : 'fa-plus-circle';
    document.getElementById('editModalTitle').innerHTML = `
        <div class="flex items-center">
            <div class="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-4 shadow-inner">
                <i class="fas ${actionIcon} text-indigo-600 dark:text-indigo-400 text-xl"></i>
            </div>
            <div>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white leading-tight">${actionText} <span class="text-indigo-600 dark:text-indigo-400">${config.displayName || collectionName}</span></h3>
                <p class="text-xs text-gray-500 font-medium mt-1 uppercase tracking-widest">${mode === 'edit' ? 'System ID: ' + (itemData[config.serialField] || id) : 'Fill in the specification details'}</p>
            </div>
        </div>
    `;
    
    const groups = { 'Core Identity': [], 'Hardware & Specs': [], 'Network & Connectivity': [], 'Assignment & Location': [], 'Purchase & Warranty': [], 'Inventory & Notes': [], 'Other': [] };
    config.formFields.forEach(fieldId => { const fieldDef = AVAILABLE_FIELDS.find(f => f.id === fieldId) || { label: fieldId, type: 'text', group: 'Other' }; const grp = fieldDef.group || 'Other'; if(!groups[grp]) groups[grp] = []; groups[grp].push({ id: fieldId, def: fieldDef }); });

    const groupIcons = {
        'Core Identity': 'fa-id-badge text-blue-500',
        'Hardware & Specs': 'fa-microchip text-purple-500',
        'Network & Connectivity': 'fa-network-wired text-green-500',
        'Assignment & Location': 'fa-map-marker-alt text-red-500',
        'Purchase & Warranty': 'fa-file-invoice-dollar text-yellow-500',
        'Inventory & Notes': 'fa-clipboard-list text-teal-500',
        'Other': 'fa-layer-group text-gray-500'
    };

    let formHtml = '';
    
    for (const [groupName, fields] of Object.entries(groups)) {
        if (fields.length === 0) continue;
        const iconClass = groupIcons[groupName] || 'fa-folder';

        formHtml += `
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div class="px-5 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex items-center">
                <i class="fas ${iconClass} mr-2"></i>
                <h4 class="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">${groupName}</h4>
            </div>
            <div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        `;
        
        fields.forEach(f => {
            const fieldId = f.id; const fieldDef = f.def; let val = itemData[fieldId] !== undefined ? itemData[fieldId] : ''; const dropdown = config.dropdowns && config.dropdowns[fieldId];
            
            formHtml += `<div class="col-span-1 relative">`;
            const requiredHtml = (fieldDef.required || ['SerialNumber', 'ItemName', 'Status'].includes(fieldId)) ? `<span class="text-red-500 ml-1">*</span>` : '';
            formHtml += `<label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">${fieldDef.label}${requiredHtml}</label>`;
            
            const inputClasses = `w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block dark:bg-gray-700/50 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all duration-200 hover:border-indigo-300`;

            if (dropdown) {
                formHtml += `<select name="${fieldId}" id="edit-${fieldId}" class="${inputClasses} appearance-none"><option value="">-- Select --</option>${dropdown.map(opt => `<option value="${opt}" ${val === opt ? 'selected' : ''}>${opt}</option>`).join('')}</select>`;
                formHtml += `<div class="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center px-4 text-gray-500"><i class="fas fa-chevron-down text-xs"></i></div>`;
            } else if (fieldDef.type === 'date') { 
                const d = new Date(val); if(!isNaN(d) && val) val = d.toISOString().split('T')[0]; 
                formHtml += `<input type="date" name="${fieldId}" id="edit-${fieldId}" value="${val}" class="${inputClasses}">`; 
            } else if (fieldDef.type === 'number') {
                formHtml += `<input type="number" name="${fieldId}" id="edit-${fieldId}" value="${val}" class="${inputClasses}">`;
            } else if (fieldDef.type === 'textarea') { 
                formHtml += `<textarea name="${fieldId}" id="edit-${fieldId}" rows="2" class="${inputClasses}">${val}</textarea>`;
            } else { 
                formHtml += `<input type="text" name="${fieldId}" id="edit-${fieldId}" value="${val}" class="${inputClasses}">`;
            }
            formHtml += `</div>`;
        });
        formHtml += `</div></div>`;
    }
    
    form.innerHTML = formHtml;
    
    const disposalSection = document.getElementById('disposal-evidence-section');
    const existingEvidenceBox = document.getElementById('existingEvidenceBox');
    const fileInput = document.getElementById('disposalFileInput');
    const hiddenBase64 = document.getElementById('hiddenEvidenceBase64');
    if (fileInput) fileInput.value = '';
    if (hiddenBase64) hiddenBase64.value = '';
    
    if (itemData.Status === 'Disposed') {
        if(disposalSection) disposalSection.classList.remove('hidden');
        if (itemData.DisposalEvidence && existingEvidenceBox && hiddenBase64) { existingEvidenceBox.classList.remove('hidden'); hiddenBase64.value = itemData.DisposalEvidence; } 
        else if (existingEvidenceBox) existingEvidenceBox.classList.add('hidden');
    } else {
        if(disposalSection) disposalSection.classList.add('hidden');
        if(existingEvidenceBox) existingEvidenceBox.classList.add('hidden');
    }

    const tabBtn = document.querySelector('#modal-tabs .tab-button');
    if (tabBtn) window.switchModalTab('details', tabBtn);
    window.buildMaintenanceLogInModal(itemData);
    
    const modal = document.getElementById('editModal');
    modal.classList.remove('opacity-0', 'pointer-events-none');
    if (modal.querySelector('.modal-content')) {
        modal.querySelector('.modal-content').classList.remove('scale-95');
        modal.querySelector('.modal-content').classList.add('scale-100');
    }
};

document.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'edit-Status') {
        const disposalSection = document.getElementById('disposal-evidence-section');
        if (!disposalSection) return;
        if (e.target.value === 'Disposed') { disposalSection.classList.remove('hidden'); disposalSection.classList.add('animate-pulse'); setTimeout(() => disposalSection.classList.remove('animate-pulse'), 1000); } 
        else disposalSection.classList.add('hidden');
    }
});

window.saveData = async function() {
    const formData = new FormData(document.getElementById('editForm'));
    const data = Object.fromEntries(formData.entries());
    const { mode, collection, id } = currentEdit;

    const statusInput = document.getElementById('edit-Status');
    const fileInput = document.getElementById('disposalFileInput');
    const hiddenBase64 = document.getElementById('hiddenEvidenceBase64');

    if (statusInput && statusInput.value === 'Disposed') {
        if (fileInput && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            if (file.size > 2 * 1024 * 1024) return alert("ไฟล์เอกสารต้องมีขนาดไม่เกิน 2MB");
            try { data.DisposalEvidence = await convertFileToBase64(file); data.DisposalDate = new Date().toISOString(); } 
            catch (err) { return alert("เกิดข้อผิดพลาดในการอ่านไฟล์"); }
        } 
        else if (hiddenBase64 && hiddenBase64.value) data.DisposalEvidence = hiddenBase64.value;
        else {
            if (!confirm("คุณกำลังเปลี่ยนสถานะเป็น 'Disposed' แต่ไม่ได้แนบเอกสาร ต้องการดำเนินการต่อหรือไม่?")) return;
            data.DisposalDate = new Date().toISOString();
        }
    } else if (statusInput && statusInput.value !== 'Disposed') {
        data.DisposalEvidence = null; data.DisposalDate = null;
    }

    try {
        if (mode === 'edit') await apiRequest(`/api/inventory/${collection}/${id}`, 'PUT', data);
        else await apiRequest(`/api/inventory/${collection}`, 'POST', data);
        showNotificationModal('success', 'Success', `Data saved successfully.`);
        window.hideModal('editModal'); await refreshAllData(); window.buildTable(collection); window.updateDashboard();
    } catch (error) { showNotificationModal('warning', 'Save Failed', error.message); }
};

window.deleteItem = async function(collectionName, id) {
    if (confirm(`Are you sure you want to delete this item?`)) {
        try {
            await apiRequest(`/api/inventory/${collectionName}/${id}`, 'DELETE');
            showNotificationModal('success', 'Deleted', 'The item has been deleted.');
            await refreshAllData(); window.buildTable(collectionName); window.updateDashboard();
        } catch (error) {}
    }
};

// ==========================================
// --- Dashboard ---
// ==========================================
window.updateDashboard = function() {
    let total = 0, active = 0, storage = 0, issues = 0;
    const skipKeys = ['Staff', 'CustomMenus', 'TransactionHistory', 'LoanHistory', 'Maintenance Log', 'admins'];
    const allItems = [];

    for (const [key, items] of Object.entries(allData)) {
        if (skipKeys.includes(key)) continue;
        if (Array.isArray(items)) allItems.push(...items);
    }

    if(document.getElementById('stat-total')) {
        document.getElementById('stat-total').innerText = allItems.length;
        document.getElementById('stat-active').innerText = allItems.filter(i=>i.Status==='Active' || i.Status==='On Loan').length;
        document.getElementById('stat-storage').innerText = allItems.filter(i=>i.Status==='Storage').length;
        document.getElementById('stat-issues').innerText = allItems.filter(i=>['Repair','Damaged','Disposed'].includes(i.Status)).length;
    }
    const statusCounts = {}; allItems.forEach(i => { statusCounts[i.Status] = (statusCounts[i.Status] || 0) + 1; });
    window.renderStatusChart(statusCounts);
    
    const categoryCounts = {}; 
    for (const [key, items] of Object.entries(allData)) {
        if (skipKeys.includes(key)) continue;
        if (Array.isArray(items)) categoryCounts[key] = items.length;
    }
    window.renderCategoryChart(categoryCounts);
};

window.renderStatusChart = function(data) {
    const ctx = document.getElementById('statusChart');
    if(!ctx) return;
    if(statusChart) { statusChart.data.labels = Object.keys(data); statusChart.data.datasets[0].data = Object.values(data); statusChart.update(); }
    else { statusChart = new Chart(ctx, { type: 'doughnut', data: { labels: Object.keys(data), datasets: [{ data: Object.values(data), backgroundColor: ['#22c55e', '#eab308', '#f97316', '#3b82f6', '#ef4444', '#9ca3af'] }] }, options: { responsive: true, maintainAspectRatio: false } }); }
};

window.renderCategoryChart = function(data) {
    const ctx = document.getElementById('categoryChart');
    if(!ctx) return;
    if(categoryChart) { categoryChart.data.labels = Object.keys(data); categoryChart.data.datasets[0].data = Object.values(data); categoryChart.update(); }
    else { categoryChart = new Chart(ctx, { type: 'bar', data: { labels: Object.keys(data), datasets: [{ label: 'Assets', data: Object.values(data), backgroundColor: '#6366f1' }] }, options: { responsive: true, maintainAspectRatio: false } }); }
};

// --- Modals ---
window.hideModal = function(id) { 
    const modal = document.getElementById(id);
    modal.classList.add('opacity-0', 'pointer-events-none'); 
    if (modal.querySelector('.modal-content')) {
        modal.querySelector('.modal-content').classList.remove('scale-100');
        modal.querySelector('.modal-content').classList.add('scale-95');
    }
};

function showNotificationModal(type, title, msg) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = msg;
    const icon = document.getElementById('modalIcon');
    if(type === 'success') icon.innerHTML = '<i class="fas fa-check-circle text-4xl text-green-500"></i>';
    else if(type === 'warning') icon.innerHTML = '<i class="fas fa-exclamation-triangle text-4xl text-yellow-500"></i>';
    else icon.innerHTML = '<i class="fas fa-info-circle text-4xl text-blue-500"></i>';
    document.getElementById('notificationModal').classList.remove('opacity-0', 'pointer-events-none');
}

// ==========================================
// --- Management Logic (Handover, Staff, Admin, Maintenance) ---
// ==========================================
window.buildHandoverReturnPage = function() {
    const handoverTab = document.getElementById('handover-tab-content');
    if(handoverTab) {
        handoverTab.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div><h3 class="font-semibold mb-2">1. Select Staff</h3><input type="text" onkeyup="window.filterStaffList(this, 'handoverStaffList')" placeholder="Search staff..." class="w-full p-2 border rounded mb-2 dark:bg-gray-700 dark:border-gray-600"><div id="handoverStaffList" class="max-h-48 overflow-y-auto border rounded p-2 dark:border-gray-600"></div><h3 class="font-semibold mb-2 mt-4">2. Select Device</h3><input type="text" onkeyup="window.filterDeviceList(this, 'handoverDeviceList')" placeholder="Search storage..." class="w-full p-2 border rounded mb-2 dark:bg-gray-700 dark:border-gray-600"><div id="handoverDeviceList" class="max-h-64 overflow-y-auto border rounded p-2 dark:border-gray-600"></div></div>
                <div><h3 class="font-semibold mb-2">3. Cart</h3><p class="text-sm mb-2">Staff: <span id="selectedHandoverStaff" class="font-bold">None</span></p><div id="handoverCartList" class="border rounded p-2 min-h-[200px] bg-gray-50 dark:bg-gray-700 space-y-2"><p class="text-center text-gray-400 p-4">Empty</p></div><button id="confirmHandoverBtn" onclick="window.confirmHandover()" class="mt-4 w-full bg-indigo-600 text-white font-bold py-3 rounded disabled:bg-gray-400" disabled>Confirm</button></div>
            </div>`;
        window.populateStaffLists('handoverStaffList', 'selectedHandoverStaff'); window.populateHandoverDeviceList();
    }
    const returnTab = document.getElementById('return-tab-content');
    if(returnTab) {
        returnTab.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div><h3 class="font-semibold mb-2">1. Find Staff</h3><input type="text" onkeyup="window.filterStaffList(this, 'returnStaffList')" placeholder="Search staff..." class="w-full p-2 border rounded mb-2 dark:bg-gray-700 dark:border-gray-600"><div id="returnStaffList" class="max-h-48 overflow-y-auto border rounded p-2 dark:border-gray-600"></div></div>
                <div><h3 class="font-semibold mb-2">2. Return Devices</h3><p class="text-sm mb-2">Assets of: <span id="selectedReturnStaff" class="font-bold">None</span></p><div id="returnDeviceList" class="border rounded p-2 min-h-[200px] bg-gray-50 dark:bg-gray-700 space-y-2"><p class="text-center text-gray-400 p-4">Select staff first.</p></div><button id="confirmReturnBtn" onclick="window.confirmReturn()" class="mt-4 w-full bg-green-600 text-white font-bold py-3 rounded disabled:bg-gray-400" disabled>Confirm Return</button></div>
            </div>`;
        window.populateStaffLists('returnStaffList', 'selectedReturnStaff', true);
    }
};

window.populateStaffLists = function(listId, labelId, isReturn = false) {
    const list = document.getElementById(listId);
    if (!list) return;
    const staff = allData.Staff || [];
    if (staff.length === 0) { list.innerHTML = `<p class="p-2 text-center text-gray-500">No staff found.</p>`; return; }
    list.innerHTML = staff.map(s => `<div class="staff-item p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer rounded" onclick="window.selectStaff('${s.UserName}', '${listId}', '${labelId}', ${isReturn})">${s.FirstName || s.UserName} ${s.LastName || ''}</div>`).join('');
};

window.selectStaff = function(name, listId, labelId, isReturn) {
    document.getElementById(labelId).textContent = name;
    document.querySelectorAll(`#${listId} .staff-item`).forEach(el => el.classList.remove('bg-indigo-100', 'dark:bg-indigo-900'));
    event.target.classList.add('bg-indigo-100', 'dark:bg-indigo-900');
    if (isReturn) {
        const allDevices = Object.keys(collectionConfigs).flatMap(cat => (allData[cat] || []).map(d => ({ ...d, collection: cat })));
        const userDevices = allDevices.filter(d => d.UserName === name && d.Status !== 'Storage');
        const returnList = document.getElementById('returnDeviceList');
        if(userDevices.length === 0) returnList.innerHTML = `<p class="text-center text-gray-400 p-4">No assets.</p>`;
        else {
            returnList.innerHTML = userDevices.map(d => {
                const config = collectionConfigs[d.collection];
                return `<div class="p-2 bg-white dark:bg-gray-800 rounded border flex items-center space-x-3"><input type="checkbox" class="return-checkbox rounded" value="${d._id || d.id}" data-col="${d.collection}"><div><p class="font-semibold text-sm">${d[config.nameField]}</p><p class="text-xs text-gray-400">${d[config.serialField]}</p></div></div>`;
            }).join('');
            document.querySelectorAll('.return-checkbox').forEach(cb => cb.addEventListener('change', () => document.getElementById('confirmReturnBtn').disabled = !document.querySelector('.return-checkbox:checked')));
        }
    } else { window.updateHandoverButtonState(); }
};

window.populateHandoverDeviceList = function() {
    const list = document.getElementById('handoverDeviceList');
    const allDevices = Object.keys(collectionConfigs).flatMap(cat => (allData[cat] || []).map(d => ({ ...d, collection: cat })));
    const available = allDevices.filter(d => d.Status === 'Storage');
    if (available.length === 0) { list.innerHTML = `<p class="text-center text-gray-400 p-4">No devices in storage.</p>`; return; }
    list.innerHTML = available.map(d => {
        const config = collectionConfigs[d.collection];
        return `<div class="device-item p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex justify-between items-center" onclick="window.addDeviceToHandoverCart('${d._id || d.id}', '${d.collection}')"><div><p class="font-semibold text-sm">${d[config.nameField]}</p><p class="text-xs text-gray-400">${d[config.serialField]}</p></div><i class="fas fa-plus text-green-500"></i></div>`;
    }).join('');
};

window.addDeviceToHandoverCart = function(id, col) {
    if(!handoverCart.some(i => (i._id === id || i.id === id))) {
        const item = allData[col].find(i => (i._id === id || i.id === id));
        handoverCart.push({...item, collection: col}); window.renderHandoverCart(); window.updateHandoverButtonState();
    }
};

window.renderHandoverCart = function() {
    const list = document.getElementById('handoverCartList');
    if(handoverCart.length===0) list.innerHTML = `<p class="text-center text-gray-400 p-4">Select items.</p>`;
    else {
        list.innerHTML = handoverCart.map(d => {
            const config = collectionConfigs[d.collection];
            const id = d._id || d.id;
            return `<div class="p-2 bg-white dark:bg-gray-800 rounded border flex justify-between"><div><p class="font-semibold text-sm">${d[config.nameField]}</p><p class="text-xs text-gray-400">${d[config.serialField]}</p></div><button onclick="window.removeHandoverItem('${id}')" class="text-red-500"><i class="fas fa-times"></i></button></div>`;
        }).join('');
    }
};

window.removeHandoverItem = function(id) { handoverCart = handoverCart.filter(i => (i._id !== id && i.id !== id)); window.renderHandoverCart(); window.updateHandoverButtonState(); };
window.updateHandoverButtonState = function() { 
    const staffSelected = document.getElementById('selectedHandoverStaff').textContent !== 'None';
    document.getElementById('confirmHandoverBtn').disabled = !(staffSelected && handoverCart.length > 0); 
};

window.confirmHandover = async function() {
    const staff = document.getElementById('selectedHandoverStaff').textContent;
    if(confirm(`Handover ${handoverCart.length} items to ${staff}?`)) {
        await apiRequest('/api/transactions/handover', 'POST', { staffUserName: staff, devices: handoverCart });
        handoverCart = []; window.renderHandoverCart(); window.populateHandoverDeviceList(); showNotificationModal('success', 'Success', 'Items assigned.');
    }
};

window.confirmReturn = async function() {
    const items = Array.from(document.querySelectorAll('.return-checkbox:checked')).map(cb => ({ id: cb.value, collection: cb.dataset.col }));
    if(confirm(`Return ${items.length} items?`)) {
        await apiRequest('/api/transactions/return', 'POST', { devices: items });
        document.getElementById('returnDeviceList').innerHTML = ''; showNotificationModal('success', 'Success', 'Items returned.');
    }
};

window.buildStaffManagementPage = function() {
    const page = document.getElementById('staffmanagement-page');
    page.innerHTML = `
        <div class="flex justify-between items-center mb-6"><h2 class="text-2xl font-bold dark:text-white">Staff Management</h2><button onclick="window.openStaffModal('add')" class="bg-indigo-600 text-white px-4 py-2 rounded">Add Staff</button></div>
        <div class="bg-white dark:bg-gray-800 rounded shadow overflow-x-auto"><table class="min-w-full"><thead class="bg-gray-50 dark:bg-gray-700"><tr><th class="px-6 py-3 text-left text-xs uppercase text-gray-500">Username</th><th class="px-6 py-3 text-left text-xs uppercase text-gray-500">Name</th><th class="px-6 py-3 text-left text-xs uppercase text-gray-500">Dept</th><th class="px-6 py-3"></th></tr></thead><tbody id="staffTableBody" class="divide-y divide-gray-200 dark:divide-gray-700"></tbody></table></div>`;
    window.renderStaffTable();
};

window.renderStaffTable = function() {
    const tbody = document.getElementById('staffTableBody');
    const staff = allData.Staff || [];
    if(staff.length === 0) tbody.innerHTML = `<tr><td colspan="4" class="text-center p-4 text-gray-500">No staff found.</td></tr>`;
    else tbody.innerHTML = staff.map(s => {
        const id = s._id || s.id;
        return `<tr><td class="px-6 py-4">${s.UserName}</td><td class="px-6 py-4">${s.FirstName||''} ${s.LastName||''}</td><td class="px-6 py-4">${s.Department||''}</td><td class="px-6 py-4 text-right"><button onclick="window.openStaffModal('edit','${id}')" class="text-indigo-600 mr-2"><i class="fas fa-edit"></i></button><button onclick="window.deleteStaff('${id}')" class="text-red-600"><i class="fas fa-trash"></i></button></td></tr>`;
    }).join('');
};

window.openStaffModal = function(mode, id) {
    currentStaffEdit = { mode, id };
    const modal = document.getElementById('editStaffModal');
    const form = document.getElementById('editStaffForm');
    form.reset();
    document.getElementById('editStaffModalTitle').textContent = mode === 'edit' ? 'Edit Staff' : 'Add Staff';
    if (mode === 'edit') {
        const s = allData.Staff.find(i => i._id === id || i.id === id);
        if(s) {
            document.getElementById('editStaffUserName').value = s.UserName; document.getElementById('editStaffFirstName').value = s.FirstName;
            document.getElementById('editStaffLastName').value = s.LastName; document.getElementById('editStaffDepartment').value = s.Department;
        }
    }
    modal.classList.remove('opacity-0', 'pointer-events-none');
};

window.saveStaffChanges = async function() {
    const data = { UserName: document.getElementById('editStaffUserName').value, FirstName: document.getElementById('editStaffFirstName').value, LastName: document.getElementById('editStaffLastName').value, Department: document.getElementById('editStaffDepartment').value };
    if(!data.UserName) return alert("Username required");
    const { mode, id } = currentStaffEdit;
    if (mode === 'edit') await apiRequest(`/api/staff/${id}`, 'PUT', data); else await apiRequest('/api/staff', 'POST', data);
    window.hideModal('editStaffModal'); await refreshAllData(); window.renderStaffTable();
};

window.deleteStaff = async function(id) { if(confirm("Delete this staff?")) { await apiRequest(`/api/staff/${id}`, 'DELETE'); await refreshAllData(); window.renderStaffTable(); } };

window.buildAdminManagementPage = function() {
    const page = document.getElementById('adminmanagement-page');
    page.innerHTML = `
        <div class="flex justify-between items-center mb-6"><h2 class="text-2xl font-bold dark:text-white">Admin Management</h2><button onclick="window.openAddUserModal()" class="bg-indigo-600 text-white px-4 py-2 rounded">Add Admin</button></div>
        <div class="bg-white dark:bg-gray-800 rounded shadow overflow-x-auto"><table class="min-w-full"><thead class="bg-gray-50 dark:bg-gray-700"><tr><th class="px-6 py-3 text-left text-xs uppercase text-gray-500">Email</th><th class="px-6 py-3 text-left text-xs uppercase text-gray-500">ID</th><th class="px-6 py-3"></th></tr></thead><tbody id="adminTableBody" class="divide-y divide-gray-200 dark:divide-gray-700"><tr><td colspan="3" class="text-center p-4">Loading...</td></tr></tbody></table></div>`;
    window.renderAdminTable();
};

window.renderAdminTable = async function() {
    const res = await apiRequest('/api/admins/list');
    const tbody = document.getElementById('adminTableBody');
    if(!res || !res.users) return;
    tbody.innerHTML = res.users.map(u => `<tr><td class="px-6 py-4">${u.email}</td><td class="px-6 py-4 text-xs text-gray-500">${u._id}</td><td class="px-6 py-4 text-right"><button onclick="window.deleteAdmin('${u._id}')" class="text-red-600"><i class="fas fa-trash"></i></button></td></tr>`).join('');
};

window.openAddUserModal = function() { document.getElementById('addUserModal').classList.remove('opacity-0', 'pointer-events-none'); };
window.deleteAdmin = async function(id) { if(confirm("Delete admin?")) { await apiRequest('/api/admins/delete', 'DELETE', { uid: id }); window.renderAdminTable(); } };

window.buildMaintenanceLogInModal = function(item) {
    const list = document.getElementById('maintenanceLogList');
    if(!list) return;
    list.innerHTML = '';
    const logs = (allData['Maintenance Log'] || []).filter(l => l.deviceId === item._id || l.deviceId === item.id);
    if(logs.length === 0) list.innerHTML = '<p class="text-xs text-gray-500">No logs.</p>';
    logs.forEach(l => { list.innerHTML += `<div class="border-b py-2 dark:border-gray-700"><p class="text-sm font-semibold dark:text-gray-200">${new Date(l.logDate).toLocaleDateString()}</p><p class="text-sm dark:text-gray-400">${l.description}</p></div>`; });
};

window.addMaintenanceLog = function() {
    const { collection, id } = currentEdit;
    const desc = document.getElementById('newLogDescription').value; const date = document.getElementById('newLogDate').value; const cost = document.getElementById('newLogCost').value; const tech = document.getElementById('newLogTechnician').value;
    if(!desc || !date) return alert("Date and Description required");
    apiRequest('/api/inventory/maintenance', 'POST', { deviceId: id, deviceCollection: collection, description: desc, logDate: date, cost: cost, technician: tech }).then(() => {
        alert("Log added"); document.getElementById('maintenanceLogForm').reset(); refreshAllData();
    });
};

window.openImportModal = function(collectionName) {
    currentImportCollection = collectionName;
    document.getElementById('importModalTitle').textContent = `Import CSV to ${collectionName}`;
    const config = collectionConfigs[collectionName];
    if (config) document.getElementById('importHeadersExample').textContent = config.formFields.join(', ');
    document.getElementById('importModal').classList.remove('opacity-0', 'pointer-events-none');
};

window.downloadCsvTemplate = function() {
    if(!currentImportCollection) return;
    const config = collectionConfigs[currentImportCollection];
    const headers = config.formFields.join(',');
    const blob = new Blob(["\uFEFF" + headers], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = `${currentImportCollection}_template.csv`; link.click();
};

window.processCsvImport = function() {
    const file = document.getElementById('csvFileInput').files[0];
    if (!file) { showNotificationModal('warning', 'No File', 'Please select a file.'); return; }
    Papa.parse(file, { header: true, skipEmptyLines: true, encoding: document.getElementById('csvEncoding').value, complete: async (results) => {
        try {
            if(results.data.length === 0) throw new Error("Empty CSV");
            await apiRequest(`/api/inventory/${currentImportCollection}/bulk`, 'POST', results.data);
            showNotificationModal('success', 'Imported', `Imported ${results.data.length} items.`);
            window.hideModal('importModal'); refreshAllData();
        } catch (e) { showNotificationModal('warning', 'Error', e.message); }
    }});
};

window.showQrModal = function(sn, name) {
    document.getElementById('qrModalTitle').innerText = name;
    QRCode.toCanvas(document.getElementById('qrCanvas'), `${window.location.origin}/details.html?sn=${sn}`, { width: 200 });
    document.getElementById('qrModal').classList.remove('opacity-0', 'pointer-events-none');
};

window.buildLoanHistoryCards = function() {
    const container = document.getElementById('LoanHistoryContainer');
    if(!container) return;
    container.innerHTML = '';
    const loans = allData.LoanHistory || [];
    if(loans.length === 0) { container.innerHTML = '<p class="text-center text-gray-500">No history found.</p>'; return; }
    const grouped = {};
    loans.forEach(l => { if(!grouped[l.LoanGroupID]) grouped[l.LoanGroupID] = { ...l, items: [] }; grouped[l.LoanGroupID].items.push(l); });
    Object.values(grouped).sort((a,b) => new Date(b.LoanDate) - new Date(a.LoanDate)).forEach(g => {
        container.innerHTML += `<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-3 border-l-4 ${g.Status==='Returned'?'border-green-500':'border-yellow-500'}"><div class="flex justify-between items-center cursor-pointer" onclick="this.nextElementSibling.classList.toggle('hidden')"><div><h4 class="font-bold text-gray-800 dark:text-white">${g.BorrowerName}</h4><p class="text-xs text-gray-500">${new Date(g.LoanDate).toLocaleDateString()} - ${g.LoanGroupID}</p></div><span class="px-2 py-1 rounded text-xs font-semibold ${g.Status==='Returned'?'bg-green-100 text-green-800':'bg-yellow-100 text-yellow-800'}">${g.Status}</span></div><div class="hidden mt-3 pt-3 border-t dark:border-gray-700"><ul class="text-sm space-y-1">${g.items.map(i => `<li class="flex justify-between"><span>${i.DeviceSerial} (${i.DeviceType})</span><span class="${i.Status==='Returned'?'text-green-500':'text-yellow-500'}">${i.Status}</span></li>`).join('')}</ul></div></div>`;
    });
};

window.buildMaintenancePage = function() {
    const container = document.getElementById('MaintenanceContainer');
    if(!container) return;
    container.innerHTML = '';
    const logs = allData['Maintenance Log'] || [];
    logs.sort((a,b) => new Date(b.logDate) - new Date(a.logDate)).forEach(log => {
        container.innerHTML += `<div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-3"><div class="flex justify-between"><span class="font-bold text-gray-800 dark:text-white">${log.deviceCollection} (ID: ${log.deviceId})</span><span class="text-sm text-gray-500">${new Date(log.logDate).toLocaleDateString()}</span></div><p class="text-gray-600 dark:text-gray-300 mt-1">${log.description}</p><div class="mt-2 text-xs text-gray-400 flex justify-between"><span>Tech: ${log.technician || '-'}</span><span>Cost: ${log.cost || 0}</span></div></div>`;
    });
};

window.buildAssetsByUserPage = function() {
    const container = document.getElementById('AssetsByUserContainer');
    if(!container) return;
    container.innerHTML = '';
    const byUser = {};
    const skipKeys = ['Staff', 'CustomMenus', 'TransactionHistory', 'LoanHistory', 'Maintenance Log', 'admins'];
    Object.keys(allData).forEach(key => { 
        if (skipKeys.includes(key)) return;
        (allData[key] || []).forEach(item => { const u = item.UserName || 'Unassigned'; if(!byUser[u]) byUser[u] = []; byUser[u].push({...item, type: key}); }); 
    });
    Object.keys(byUser).sort().forEach(user => {
        if(user === 'Unassigned') return;
        const assets = byUser[user];
        container.innerHTML += `<details class="group bg-white dark:bg-gray-800 rounded-lg shadow mb-3"><summary class="p-4 flex justify-between items-center cursor-pointer list-none"><span class="font-bold text-gray-800 dark:text-white"><i class="fas fa-user mr-2"></i>${user}</span><span class="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">${assets.length} items</span></summary><div class="p-4 border-t dark:border-gray-700"><ul class="text-sm space-y-2">${assets.map(a => `<li class="flex justify-between items-center"><span>${a.ComputerName || a.DeviceName || a.ItemName || a.Model} <span class="text-xs text-gray-500">(${a.type})</span></span><span class="text-xs font-mono">${a.SerialNumber || a.MonitorSerial || '-'}</span></li>`).join('')}</ul></div></details>`;
    });
};

// ==========================================
// --- LABEL PRINTER SYSTEM (FIXED) ---
// ==========================================
window.buildLabelPrinterPage = function() {
    const pageId = 'labelprinter-page';
    let pageDiv = document.getElementById(pageId);
    if (!pageDiv) return;

    pageDiv.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Label Printer</h2>
            <button onclick="window.printLabel()" class="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 shadow-md flex items-center">
                <i class="fas fa-print mr-2"></i> Print Label
            </button>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-4 space-y-6">
                <div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 class="font-semibold text-lg border-b dark:border-gray-700 pb-2 mb-4 text-gray-800 dark:text-white">1. Select Assets</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                            <select id="labelCategorySelect" onchange="window.updateLabelItemDropdown()" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500"><option value="">-- Select Category --</option></select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex justify-between"><span>Items to Print</span><span class="text-indigo-600 dark:text-indigo-400 text-xs font-bold" id="selectedLabelCount">0 selected</span></label>
                            <div class="mb-2 px-1"><label class="inline-flex items-center cursor-pointer"><input type="checkbox" id="selectAllLabelItemsCb" onchange="window.toggleAllLabelItems(this.checked)" class="rounded text-indigo-600 focus:ring-indigo-500" disabled><span class="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">Select All</span></label></div>
                            <div id="labelItemList" class="max-h-48 overflow-y-auto space-y-1 border rounded-md p-2 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50"><p class="text-sm text-gray-500 text-center py-2">Select category first</p></div>
                        </div>
                    </div>
                </div>
                <div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 class="font-semibold text-lg border-b dark:border-gray-700 pb-2 mb-4 text-gray-800 dark:text-white">2. Label Dimensions</h3>
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Width (mm)</label><input type="number" id="labelWidth" value="50" onchange="window.updateLabelPreview()" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500"></div>
                        <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Height (mm)</label><input type="number" id="labelHeight" value="30" onchange="window.updateLabelPreview()" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500"></div>
                    </div>
                    <label class="flex items-center space-x-2 cursor-pointer bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800"><input type="checkbox" id="labelSplitMode" onchange="window.updateLabelPreview()" class="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"><span class="text-sm font-bold text-indigo-800 dark:text-indigo-200">Split Label (Top/Bottom - 2 items)</span></label>
                </div>
                <div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 class="font-semibold text-lg border-b dark:border-gray-700 pb-2 mb-4 text-gray-800 dark:text-white">3. Data to Print</h3>
                    <div id="labelFieldsContainer" class="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar"><p class="text-sm text-gray-500 text-center">Select category first</p></div>
                </div>
            </div>
            <div class="lg:col-span-8">
                <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex flex-col items-center justify-center min-h-[500px] border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <h3 class="text-gray-400 dark:text-gray-500 mb-6 font-bold tracking-widest uppercase">Live Preview</h3>
                    <div class="bg-gray-100 dark:bg-gray-900 p-6 rounded-lg overflow-auto max-w-full max-h-[600px] custom-scrollbar"><div id="print-area" class="flex flex-col gap-4 items-center"><div class="text-[10px] text-gray-400 text-center py-10 font-medium">No Items Selected</div></div></div>
                    <p class="text-xs text-gray-500 mt-6 max-w-md text-center"><i class="fas fa-info-circle mr-1 text-indigo-500"></i> When printing, make sure to set <strong>Margins to "None"</strong> and disable headers/footers in your browser's print dialog.</p>
                </div>
            </div>
        </div>
    `;
    const catSelect = document.getElementById('labelCategorySelect');
    
    // 🌟 แสดงชื่อหมวดหมู่ที่ดึงมาจากฐานข้อมูลจริงๆ ไม่ใช่แค่ใน Config
    const skipKeys = ['Staff', 'CustomMenus', 'TransactionHistory', 'LoanHistory', 'Maintenance Log', 'admins'];
    Object.keys(allData).forEach(cat => { 
        if (!skipKeys.includes(cat) && Array.isArray(allData[cat])) {
            const displayName = collectionConfigs[cat] ? collectionConfigs[cat].displayName : cat;
            catSelect.innerHTML += `<option value="${cat}">${displayName}</option>`; 
        }
    });
};

let currentLabelItems = []; 
let currentLabelCategory = null;

window.updateLabelItemDropdown = function() {
    const cat = document.getElementById('labelCategorySelect').value;
    currentLabelCategory = cat; currentLabelItems = [];
    document.getElementById('selectedLabelCount').textContent = `0 selected`;
    window.updateLabelPreview(); 
    if (!cat) return;

    const items = allData[cat] || []; 
    // ถ้าไม่มี Config ให้ใช้ค่าเริ่มต้นในการแสดงผล
    const config = collectionConfigs[cat] || { nameField: 'SerialNumber', serialField: 'SerialNumber', formFields: ['SerialNumber', 'Status'] }; 
    
    document.getElementById('selectAllLabelItemsCb').disabled = false; document.getElementById('selectAllLabelItemsCb').checked = false;
    
    document.getElementById('labelItemList').innerHTML = items.length === 0 ? '<p class="text-sm text-gray-500 text-center py-2">No items found</p>' : items.map(item => {
        const name = item[config.nameField] || item.ComputerName || item.DeviceName || item.ItemName || item.Model || 'Unnamed'; 
        const serial = item[config.serialField] || item.SerialNumber || item._id;
        const id = item._id || item.id;
        return `<label class="flex items-center space-x-2 cursor-pointer p-1.5 hover:bg-white dark:hover:bg-gray-600 rounded border border-transparent hover:border-gray-200 dark:hover:border-gray-500 transition-colors"><input type="checkbox" class="label-item-cb rounded text-indigo-600 focus:ring-indigo-500" value="${id}" onchange="window.toggleLabelItem('${id}', this.checked)"><span class="text-sm text-gray-700 dark:text-gray-300 truncate w-full" title="${name} (${serial})"><span class="font-medium">${name}</span> <span class="text-xs text-gray-500 ml-1">(${serial})</span></span></label>`;
    }).join('');

    document.getElementById('labelFieldsContainer').innerHTML = '';
    config.formFields.forEach(field => {
        const isChecked = field === config.nameField || field === config.serialField ? 'checked' : '';
        document.getElementById('labelFieldsContainer').innerHTML += `<label class="flex items-center space-x-2 cursor-pointer p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"><input type="checkbox" class="label-field-cb rounded text-indigo-600 focus:ring-indigo-500" value="${field}" ${isChecked} onchange="window.updateLabelPreview()"><span class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">${field}</span></label>`;
    });
};

window.toggleLabelItem = function(id, isChecked) {
    if (isChecked) { if (!currentLabelItems.includes(id)) currentLabelItems.push(id); } 
    else { currentLabelItems = currentLabelItems.filter(i => i !== id); document.getElementById('selectAllLabelItemsCb').checked = false; }
    document.getElementById('selectedLabelCount').textContent = `${currentLabelItems.length} selected`; window.updateLabelPreview();
};

window.toggleAllLabelItems = function(isChecked) {
    currentLabelItems = []; document.querySelectorAll('.label-item-cb').forEach(cb => { cb.checked = isChecked; if (isChecked) currentLabelItems.push(cb.value); });
    document.getElementById('selectedLabelCount').textContent = `${currentLabelItems.length} selected`; window.updateLabelPreview();
};

function generateLabelHTML(item, isSplit) {
    if (!item) return `<div class="w-full ${isSplit ? 'h-1/2' : 'h-full'} bg-white"></div>`; 
    const checkedFields = Array.from(document.querySelectorAll('.label-field-cb:checked')).map(cb => cb.value);
    let textHtml = '';
    let fontSizeClass = isSplit ? 'text-[6pt] leading-[7pt]' : 'text-[7pt] leading-[8pt]';
    if(checkedFields.length <= 2) fontSizeClass = isSplit ? 'text-[8pt] leading-[9pt] font-bold' : 'text-[10pt] leading-[11pt] font-bold';
    else if(checkedFields.length <= 4) fontSizeClass = isSplit ? 'text-[7pt] leading-[8pt]' : 'text-[8pt] leading-[9pt]';

    checkedFields.forEach((field, index) => { const val = item[field] || '-'; const extraClass = index === 0 ? 'font-bold' : ''; textHtml += `<div class="${fontSizeClass} ${extraClass} truncate text-black font-sans" style="max-width: 100%;">${val}</div>`; });
    
    // 🌟 ดึง Serial สำหรับสร้าง QR Code ให้แม่นยำขึ้น
    const config = collectionConfigs[currentLabelCategory] || {};
    const serial = item[config.serialField] || item.SerialNumber || item._id;

    return `<div class="w-full flex p-1 box-border bg-white ${isSplit ? 'h-1/2' : 'h-full'}"><div class="h-full flex flex-col items-center justify-center pr-1 shrink-0" style="width: 35%;"><canvas data-serial="${serial}" class="qr-render-target max-w-full max-h-full"></canvas></div><div class="h-full w-full pl-1 flex flex-col justify-center overflow-hidden border-l border-gray-300 bg-white">${textHtml}</div></div>`;
}

window.updateLabelPreview = function() {
    const printArea = document.getElementById('print-area');
    const w = document.getElementById('labelWidth').value || 50; const h = document.getElementById('labelHeight').value || 30;
    const isSplit = document.getElementById('labelSplitMode').checked;

    if (currentLabelItems.length === 0) { printArea.innerHTML = '<div class="text-[10px] text-gray-400 text-center py-10 font-medium">No Items Selected</div>'; return; }

    let previewHtml = '';
    // 🌟 แก้ไขการค้นหา item ด้วย _id ให้ถูกต้อง
    const itemsData = currentLabelItems.map(id => allData[currentLabelCategory].find(i => i._id === id || i.id === id)).filter(Boolean);

    if (isSplit) {
        for (let i = 0; i < itemsData.length; i += 2) {
            previewHtml += `<div class="label-page preview-border relative box-border bg-white text-black flex flex-col overflow-hidden" style="width: ${w}mm; height: ${h}mm; border: 1px solid #ccc; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">${generateLabelHTML(itemsData[i], true)}${itemsData[i+1] ? `<div style="border-top: 1px dashed #999; width: 100%;"></div>` : ''}${generateLabelHTML(itemsData[i+1], true)}</div>`;
        }
    } else {
        itemsData.forEach(item => { previewHtml += `<div class="label-page preview-border relative box-border bg-white text-black flex overflow-hidden" style="width: ${w}mm; height: ${h}mm; border: 1px solid #ccc; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">${generateLabelHTML(item, false)}</div>`; });
    }

    printArea.innerHTML = previewHtml;
    printArea.querySelectorAll('.qr-render-target').forEach(canvas => {
        QRCode.toCanvas(canvas, `${window.location.origin.replace(/\/$/, '')}/details.html?sn=${canvas.dataset.serial}`, { width: 256, margin: 0, color: { dark: '#000000', light: '#ffffff' } });
    });
};

window.printLabel = function() {
    if (currentLabelItems.length === 0) return showNotificationModal('warning', 'No Items Selected', 'Please select at least one item to print.');
    const w = document.getElementById('labelWidth').value || 50; const h = document.getElementById('labelHeight').value || 30;
    let dynamicStyle = document.getElementById('dynamic-print-style');
    if (!dynamicStyle) { dynamicStyle = document.createElement('style'); dynamicStyle.id = 'dynamic-print-style'; document.head.appendChild(dynamicStyle); }
    dynamicStyle.innerHTML = `@media print { @page { size: ${w}mm ${h}mm; margin: 0mm; } }`;
    window.print();
};

// ==========================================
// --- Global Utilities (UI Control) ---
// ==========================================
window.switchModalTab = function(tab, btn) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(tab+'-tab').classList.add('active');
    
    document.querySelectorAll('.tab-button').forEach(b => {
        b.classList.remove('active', 'bg-white', 'dark:bg-gray-700', 'text-indigo-600', 'dark:text-indigo-400', 'shadow-sm');
        b.classList.add('text-gray-500');
    });
    
    btn.classList.remove('text-gray-500');
    btn.classList.add('active', 'bg-white', 'dark:bg-gray-700', 'text-indigo-600', 'dark:text-indigo-400', 'shadow-sm');
};

window.changeRowsPerPage = function(col, el) { paginationState[col].rowsPerPage = parseInt(el.value); paginationState[col].currentPage=1; window.buildTable(col); };
window.changePage = function(col, dir) { paginationState[col].currentPage += dir; window.buildTable(col); };
window.handleSearch = function(col, val) { paginationState[col].filterText = val; paginationState[col].currentPage=1; window.buildTable(col); };
window.handleStatusFilter = function(col, val) { paginationState[col].statusFilter = val; paginationState[col].currentPage=1; window.buildTable(col); };
window.filterLoanHistory = function(val) { const term=val.toUpperCase(); document.querySelectorAll('#LoanHistoryContainer > div').forEach(el => el.style.display = el.textContent.toUpperCase().includes(term)?'':'none'); };
window.filterMaintenanceHistory = function(val) { const term=val.toUpperCase(); document.querySelectorAll('#MaintenanceContainer > div').forEach(el => el.style.display = el.textContent.toUpperCase().includes(term)?'':'none'); };
window.filterAssetsByUser = function(val) { const term=val.toUpperCase(); document.querySelectorAll('#AssetsByUserContainer > details').forEach(el => el.style.display = el.textContent.toUpperCase().includes(term)?'':'none'); };
window.filterStaffList = function(input, listId) { const term = input.value.toUpperCase(); document.querySelectorAll(`#${listId} .staff-item`).forEach(el => el.style.display = el.textContent.toUpperCase().includes(term) ? '' : 'none'); };
window.filterDeviceList = function(input, listId) { const term = input.value.toUpperCase(); document.querySelectorAll(`#${listId} .device-item`).forEach(el => el.style.display = el.textContent.toUpperCase().includes(term) ? '' : 'none'); };
window.switchHandoverTab = function(tab, btn) {
    document.getElementById('handover-tab-content').style.display = tab==='handover'?'block':'none';
    document.getElementById('return-tab-content').style.display = tab==='return'?'block':'none';
    document.querySelectorAll('#handover-tabs button').forEach(b => { b.classList.remove('border-indigo-600', 'text-indigo-600', 'dark:text-indigo-400'); b.classList.add('border-transparent', 'text-gray-500'); });
    btn.classList.add('border-indigo-600', 'text-indigo-600', 'dark:text-indigo-400'); btn.classList.remove('border-transparent', 'text-gray-500');
};
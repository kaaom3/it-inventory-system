// ===================================================================
// Frontend Logic for IT Inventory System (Full Complete Version)
// Merged with: Render.com Cloud URL + Disposal Evidence System
// ===================================================================

// 🌟 ล็อก URL ไปที่เซิร์ฟเวอร์บน Cloud ของคุณ 100%
const API_BASE_URL = 'https://it-inventory-system-ncd9.onrender.com';

// --- Definition of Available Fields for Custom Menus ---
// มีการเพิ่ม 'group' เพื่อใช้จัดหมวดหมู่ใน Popup หน้าแก้ไขข้อมูล
const AVAILABLE_FIELDS = [
    // Core Identity
    { id: 'ItemName', label: 'Item Name / Device Name', required: true, type: 'text', group: 'Core Identity' },
    { id: 'ComputerName', label: 'Computer Name', type: 'text', group: 'Core Identity' },
    { id: 'DeviceName', label: 'Device Name', type: 'text', group: 'Core Identity' },
    { id: 'Name', label: 'Name (Printer/General)', type: 'text', group: 'Core Identity' },
    { id: 'PartName', label: 'Part Name', type: 'text', group: 'Core Identity' },
    { id: 'SoftwareName', label: 'Software Name', type: 'text', group: 'Core Identity' },
    { id: 'SerialNumber', label: 'Serial Number', required: true, type: 'text', group: 'Core Identity' },
    { id: 'MonitorSerial', label: 'Monitor Serial', type: 'text', group: 'Core Identity' },
    { id: 'Status', label: 'Status (Active/Repair/Storage)', required: true, type: 'dropdown', group: 'Core Identity' },

    // Hardware & Specs
    { id: 'Type', label: 'Type / Category', type: 'dropdown', group: 'Hardware & Specs' },
    { id: 'Category', label: 'Category (Spare Parts)', type: 'dropdown', group: 'Hardware & Specs' },
    { id: 'AccessoryType', label: 'Accessory Type', type: 'dropdown', group: 'Hardware & Specs' },
    { id: 'Manufacturer', label: 'Manufacturer / Brand', required: false, type: 'text', group: 'Hardware & Specs' },
    { id: 'Model', label: 'Model', required: false, type: 'text', group: 'Hardware & Specs' },
    { id: 'Capacity', label: 'Capacity (Storage)', type: 'text', group: 'Hardware & Specs' },
    { id: 'Resolution', label: 'Resolution', type: 'text', group: 'Hardware & Specs' },
    { id: 'LampHours', label: 'Lamp Hours', type: 'number', group: 'Hardware & Specs' },
    { id: 'Version', label: 'Software Version', type: 'text', group: 'Hardware & Specs' },
    
    // Network & Connectivity
    { id: 'IPAddress', label: 'IP Address', required: false, type: 'text', group: 'Network & Connectivity' },
    { id: 'MacAddress', label: 'MAC Address', required: false, type: 'text', group: 'Network & Connectivity' },
    { id: 'PhoneNumber', label: 'Phone Number', type: 'text', group: 'Network & Connectivity' },
    { id: 'IMEI', label: 'IMEI', type: 'text', group: 'Network & Connectivity' },
    { id: 'PortName', label: 'Port Name', type: 'text', group: 'Network & Connectivity' },
    { id: 'DriverName', label: 'Driver Name', type: 'text', group: 'Network & Connectivity' },

    // Assignment & Location
    { id: 'UserName', label: 'Assigned User (Staff)', required: false, type: 'text', group: 'Assignment & Location' },
    { id: 'Location', label: 'Location / Room', required: false, type: 'text', group: 'Assignment & Location' },
    { id: 'AssignedComputer', label: 'Assigned Computer', type: 'text', group: 'Assignment & Location' },

    // Purchase & Warranty
    { id: 'Supplier', label: 'Supplier / Vendor', required: false, type: 'text', group: 'Purchase & Warranty' },
    { id: 'PurchaseDate', label: 'Purchase Date', required: false, type: 'date', group: 'Purchase & Warranty' },
    { id: 'WarrantyStartDate', label: 'Warranty Start', required: false, type: 'date', group: 'Purchase & Warranty' },
    { id: 'WarrantyEndDate', label: 'Warranty End', required: false, type: 'date', group: 'Purchase & Warranty' },
    { id: 'Price', label: 'Price / Cost', required: false, type: 'number', group: 'Purchase & Warranty' },

    // Inventory & Notes
    { id: 'Quantity', label: 'Quantity (Stock)', required: false, type: 'number', group: 'Inventory & Notes' },
    { id: 'MinimumStock', label: 'Minimum Stock', required: false, type: 'number', group: 'Inventory & Notes' },
    { id: 'Description', label: 'Description / Notes', required: false, type: 'textarea', group: 'Inventory & Notes' }
];

// --- Global State Variables ---
let allData = { 
    Computers: [], Monitors: [], Audio: [], Accessory: [], Printers: [], 
    Network: [], Mobile: [], Storage: [], Projector: [], SpareParts: [], 
    LoanHistory: [], Software: [], Location: [], 'Maintenance Log': [], 
    TransactionHistory: [], Staff: [], CustomMenus: [] 
};

let currentEdit = { mode: null, collection: null, id: null };
let currentStaffEdit = { mode: null, id: null };
let statusChart = null;
let categoryChart = null;
let paginationState = {};
let handoverCart = [];
let returnCart = [];
let pingIntervalId = null; 
let currentImportCollection = null;

// Bulk Management State
let selectedItems = {}; 

// --- Default Collection Configs ---
let collectionConfigs = {};

// ==========================================
// 1. Initialization & Data Fetching
// ==========================================
async function initApp() {
    await fetchData();
    setupEventListeners();
    
    // 🌟 เพิ่ม 2 บรรทัดนี้ เพื่อซ่อนหน้า Loading และแสดงหน้า Dashboard เมื่อดึงข้อมูลเสร็จ
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('app-container').classList.remove('hidden');
}

async function fetchData() {
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

// --- API Helper ---
async function apiRequest(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('authToken');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        if (response.status === 401 || response.status === 403) { logout(); return; }
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

// --- Data Refresh & Config Builder ---
async function refreshAllData() {
    try {
        const data = await apiRequest('/api/inventory/all');
        
        for (const key in data) {
            if (Array.isArray(data[key])) {
                allData[key] = data[key].map(item => ({...item, id: item._id }));
            }
        }
        
        const customMenus = data.CustomMenus || [];
        allData.CustomMenus = customMenus;
        collectionConfigs = {}; 

        customMenus.forEach(menu => {
            if (!menu.fields || !Array.isArray(menu.fields) || menu.fields.length === 0) return;

            const headerFields = menu.fields.slice(0, 5).map(f => f.id);
            if (!headerFields.includes('Status')) {
                 if (headerFields.length >= 5) headerFields[4] = 'Status';
                 else headerFields.push('Status');
            }

            const hasIP = menu.fields.some(f => f.id === 'IPAddress');
            const isComputer = menu.name === 'Computers';
            if ((hasIP || isComputer) && !headerFields.includes('Last Seen')) {
                headerFields.unshift('Last Seen');
            }

            const nameFieldObj = menu.fields.find(f => 
                ['ComputerName', 'DeviceName', 'ItemName', 'PartName', 'Name', 'SoftwareName', 'Model'].includes(f.id)
            );
            const nameField = nameFieldObj ? nameFieldObj.id : menu.fields[0].id;
            
            const serialFieldObj = menu.fields.find(f => ['SerialNumber', 'MonitorSerial'].includes(f.id));
            const serialField = serialFieldObj ? serialFieldObj.id : 'SerialNumber';

            collectionConfigs[menu.name] = {
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

        // Init Pagination & Bulk Selection state
        Object.keys(collectionConfigs).forEach(collectionName => {
            if (!paginationState[collectionName]) {
                paginationState[collectionName] = { currentPage: 1, rowsPerPage: 10, filterText: '', categoryFilter: null, statusFilter: '' };
            }
            if (!selectedItems[collectionName]) {
                selectedItems[collectionName] = [];
            }
        });

        return true;
    } catch (error) {
        const loadingDiv = document.getElementById('loading-state');
        if(loadingDiv) {
            loadingDiv.innerHTML = `<div class="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg"><h3 class="text-lg font-bold text-red-600 dark:text-red-400">Connection Failed</h3><p class="text-gray-600 dark:text-gray-300">${error.message}</p><button onclick="location.reload()" class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Retry</button></div>`;
        }
        return false;
    }
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user'));

    if (token && user) {
        document.getElementById('auth-loading').style.display = 'none';
        document.getElementById('app-container').classList.remove('hidden');
        document.getElementById('userInfo').textContent = `Logged in as: ${user.email}`;
        
        initTheme();
        initPrintStyles(); 
        
        initializeAppLogic();
    } else {
        window.location.replace('login.html');
    }
});

// --- THEME LOGIC ---
function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');

    if (!themeToggleBtn) return;

    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            lightIcon.classList.remove('hidden');
            darkIcon.classList.add('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            lightIcon.classList.add('hidden');
            darkIcon.classList.remove('hidden');
        }
        localStorage.setItem('color-theme', theme);
    }

    const savedTheme = localStorage.getItem('color-theme');
    const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && sysDark)) {
         applyTheme('dark');
    } else {
         applyTheme('light');
    }

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
                page-break-after: always; 
                page-break-inside: avoid; 
                margin: 0; 
                padding: 0;
                box-sizing: border-box;
                background-color: white;
            }
            .label-page.preview-border {
                border: none !important;
                box-shadow: none !important;
            }
            .no-print { display: none !important; }
        }
    `;
    document.head.appendChild(style);
}

async function initializeAppLogic() {
    const success = await refreshAllData();
    if (success) {
        document.getElementById('loading-state').style.display = 'none';
        renderSidebarDynamic(); 
        generateDynamicPages();
        updateDashboard();
        loadPage('Dashboard', document.getElementById('nav-dashboard'));
        
        runPeriodicPing();

        if (pingIntervalId) clearInterval(pingIntervalId);
        pingIntervalId = setInterval(async () => { 
            await runPeriodicPing();
            await refreshAllData();
            const visiblePage = document.querySelector('.page-content[style="display: block;"]');
            if (visiblePage && visiblePage.id !== 'dashboard-page') {
                const colName = visiblePage.id.replace('-page', '');
                const realKey = Object.keys(collectionConfigs).find(k => k.toLowerCase() === colName);
                if(realKey) buildTable(realKey);
            }
        }, 60000); 
    }
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
                if (isComputers && item.ComputerName && item.ComputerName.trim() !== '') {
                    target = item.ComputerName;
                } else if (item.IPAddress && item.IPAddress !== 'N/A' && item.IPAddress.trim() !== '') {
                    target = item.IPAddress;
                }
                
                if (target) {
                    pingPromises.push(
                        apiRequest(`/api/ping/${target}?collection=${colName}`).catch(e => null)
                    );
                }
            });
        }
    });

    await Promise.allSettled(pingPromises);
}

// ==========================================
// --- FORMAT TIME AGO ---
// ==========================================
window.formatTimeAgo = (dateString) => {
    if (!dateString) return "ไม่ทราบ";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 1) return "เมื่อสักครู่";
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    if (diffHrs < 24) return `${diffHrs} ชั่วโมงที่แล้ว`;
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
    return date.toLocaleDateString('th-TH');
};

// ==========================================
// --- RECURSIVE SIDEBAR & MENU SYSTEM ---
// ==========================================

function renderSidebarDynamic() {
    const container = document.getElementById('sidebar-menu-container');
    if (!container) return;
    container.innerHTML = ''; 

    const dashboardNode = { id: 'Dashboard', name: 'Dashboard', icon: 'fa-tachometer-alt', children: [], isSystem: true, clickAction: "loadPage('Dashboard', this)" };
    const assetChildren = []; 
    
    const managementChildren = [
        { 
            id: 'Transactions', name: 'Transactions', icon: 'fa-tasks', isSystem: true,
            children: [
                { id: 'Handover', name: 'Handover / Return', icon: 'fa-dolly-flatbed', isSystem: true, clickAction: "loadPage('Handover', this)" },
                { id: 'LoanPage', name: 'Loan Page (for User)', icon: 'fa-external-link-alt', isSystem: true, clickAction: "window.open('loan.html', '_blank')" }
            ]
        },
        { 
            id: 'Reports', name: 'Reports', icon: 'fa-file-alt', isSystem: true,
            children: [
                { id: 'LoanHistory', name: 'Loan History', icon: 'fa-history', isSystem: true, clickAction: "loadPage('LoanHistory', this)" },
                { id: 'Maintenance', name: 'Maintenance History', icon: 'fa-tools', isSystem: true, clickAction: "loadPage('Maintenance', this)" },
                { id: 'AssetsByUser', name: 'Assets by User', icon: 'fa-user-tag', isSystem: true, clickAction: "loadPage('AssetsByUser', this)" }
            ]
        },
        { 
            id: 'UserSettings', name: 'User Settings', icon: 'fa-users-cog', isSystem: true,
            children: [
                { id: 'StaffManagement', name: 'Staff Management', icon: 'fa-users', isSystem: true, clickAction: "loadPage('StaffManagement', this)" },
                { id: 'AdminManagement', name: 'Admin Management', icon: 'fa-user-shield', isSystem: true, clickAction: "loadPage('AdminManagement', this)" },
                { id: 'LabelPrinter', name: 'Label Printer', icon: 'fa-tags', isSystem: true, clickAction: "loadPage('LabelPrinter', this)" } 
            ]
        }
    ];

    const customMenus = allData.CustomMenus || [];
    const customNodes = customMenus
        .filter(m => collectionConfigs[m.name])
        .sort((a, b) => (a.order || 0) - (b.order || 0) || a.displayName.localeCompare(b.displayName))
        .map(m => ({
            id: m.name, name: m.displayName, icon: m.icon, isSystem: false, parentId: m.parentId, clickAction: `loadPage('${m.name}', this)`, allowDelete: true, allowEdit: true, order: m.order
        }));

    const rootNodes = [dashboardNode];
    rootNodes.push({ type: 'header', label: 'Assets' });
    
    // 🌟 เพิ่มเมนู Disposed Assets เข้าไปในกลุ่ม Assets
    assetChildren.push({ id: 'DisposedAssets', name: 'Disposed Assets', icon: 'fa-trash-alt', isSystem: true, clickAction: "loadPage('DisposedAssets', this)" });
    
    rootNodes.push(...assetChildren.map(c => ({...c, clickAction: `loadPage('${c.id}', this)`})), ...customNodes.filter(n => !n.parentId));
    
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
        const editBtn = node.allowEdit ? `<button onclick="openEditMenuModal('${node.id}', event)" class="ml-2 text-xs text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"><i class="fas fa-edit"></i></button>` : '';
        const deleteBtn = node.allowDelete ? `<button onclick="deleteCustomMenu('${node.id}', event)" class="ml-2 text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><i class="fas fa-trash"></i></button>` : '';

        // Highlight red for disposed menu
        let textColor = node.id === 'DisposedAssets' ? 'text-red-500 dark:text-red-400' : 'text-gray-600 dark:text-gray-300';

        if (hasChildren) {
            return `<li><details class="group nav-group"><summary class="nav-link flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"><div class="flex items-center space-x-3"><i class="fas ${node.icon} w-5 text-center"></i><span>${node.name}</span></div><div class="flex items-center">${editBtn}${deleteBtn}<i class="fas fa-chevron-right text-xs transform group-open:rotate-90 transition-transform ml-2"></i></div></summary><ul class="pl-4 pt-1 space-y-1 border-l-2 border-gray-100 dark:border-gray-700 ml-6">${node.children.map(createMenuHTML).join('')}</ul></details></li>`;
        }
        return `<li><a href="#" id="nav-${node.id}" onclick="${node.clickAction}; return false;" class="nav-link flex items-center space-x-3 px-4 py-2.5 rounded-lg ${textColor} group hover:bg-gray-100 dark:hover:bg-gray-700"><i class="fas ${node.icon} w-5 text-center"></i><span class="flex-1">${node.name}</span>${editBtn}${deleteBtn}</a></li>`;
    }

    rootNodes.forEach(node => { if (node.type === 'header' || !node.parentId) container.insertAdjacentHTML('beforeend', createMenuHTML(node)); });
    
    container.insertAdjacentHTML('beforeend', `
        <li class="mt-4 pt-4 border-t dark:border-gray-700">
            <a href="#" onclick="openAddMenuModal(); return false;" class="nav-link flex items-center space-x-3 px-4 py-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-dashed border-indigo-300 dark:border-indigo-700">
                <i class="fas fa-plus w-5 text-center"></i>
                <span class="text-sm font-semibold">Add Custom Menu</span>
            </a>
        </li>
    `);
}

function generateDynamicPages() {
    const container = document.getElementById('dynamic-pages-container');
    if (!container) return;
    container.innerHTML = ''; 
    const overviewGrid = document.getElementById('category-overview-grid');
    if(overviewGrid) overviewGrid.innerHTML = '';

    (allData.CustomMenus || []).forEach(menu => {
        const config = collectionConfigs[menu.name];
        if (!config) return;
        const pageId = `${menu.name.toLowerCase()}-page`;
        const statusOptions = config.dropdowns.Status.map(s => `<option value="${s}">${s}</option>`).join('');
        
        container.innerHTML += `
        <div id="${pageId}" class="page-content" style="display:none;">
            <div class="flex flex-wrap justify-between items-center gap-2 mb-6">
                <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">${menu.displayName}</h2>
                <div class="flex gap-2">
                    <button onclick="openImportModal('${menu.name}')" class="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700"><i class="fas fa-file-import mr-2"></i>Import CSV</button>
                    <button onclick="openModal('add', '${menu.name}')" class="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700"><i class="fas fa-plus mr-2"></i>Add New</button>
                </div>
            </div>
            
            <div class="mb-4 flex flex-col md:flex-row gap-2">
                <div class="w-full md:w-1/4">
                    <select onchange="window.handleStatusFilter('${menu.name}', this.value)" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                        <option value="">All Statuses</option>
                        ${statusOptions}
                    </select>
                </div>
                <div class="w-full md:w-3/4">
                    <input type="text" id="${menu.name.toLowerCase()}SearchInput" onkeyup="handleSearch('${menu.name}', this.value)" placeholder="Search ${menu.displayName}..." class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400">
                </div>
            </div>

            <!-- Bulk Actions Bar -->
            <div id="${menu.name}BulkActions" class="hidden mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg flex items-center justify-between">
                <div class="text-indigo-800 dark:text-indigo-200 text-sm font-semibold">
                    <i class="fas fa-check-square mr-1"></i> <span class="selected-count">0 item(s) selected</span>
                </div>
                <div class="flex space-x-2">
                    <button onclick="openBulkEditModal('${menu.name}')" class="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 shadow-sm"><i class="fas fa-edit mr-1"></i>Bulk Edit</button>
                    <button onclick="bulkDelete('${menu.name}')" class="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 shadow-sm"><i class="fas fa-trash mr-1"></i>Bulk Delete</button>
                </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div class="overflow-x-auto"><table id="${menu.name}Table" class="min-w-full table-fixed"></table></div>
            </div>
            <div id="${menu.name}Pagination" class="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-300"></div>
        </div>`;
        
        if(overviewGrid) overviewGrid.innerHTML += `<div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" onclick="loadPage('${menu.name}', null)"><div class="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full"><i class="fas ${menu.icon} text-xl text-indigo-500"></i></div><div><p class="text-xs text-gray-500 truncate">${menu.displayName}</p><p class="text-lg font-bold">${(allData[menu.name] || []).length}</p></div></div>`;
    });
}

// ==========================================
// --- CUSTOM MENU MODAL LOGIC ---
// ==========================================

function openAddMenuModal() {
    const form = document.getElementById('addMenuForm');
    if (form) form.reset();
    document.getElementById('addMenuModalTitle').textContent = "Create Custom Menu";
    document.getElementById('editMenuMode').value = "create";
    document.getElementById('newMenuId').disabled = false;
    document.getElementById('newMenuId').classList.remove('bg-gray-200', 'cursor-not-allowed');
    populateParentDropdown();
    
    document.querySelectorAll('.col-checkbox').forEach(cb => {
        if(!cb.disabled) cb.checked = true; 
    });
    
    document.getElementById('addMenuModal').classList.remove('opacity-0', 'pointer-events-none');
}

function openEditMenuModal(menuName, event) {
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
    populateParentDropdown(menu.parentId); 
    
    document.querySelectorAll('.col-checkbox').forEach(cb => cb.checked = false);
    if (menu.fields && Array.isArray(menu.fields)) {
        menu.fields.forEach(f => {
            const cb = document.getElementById(`field_${f.id}`);
            if(cb) cb.checked = true;
        });
    }

    document.getElementById('addMenuModal').classList.remove('opacity-0', 'pointer-events-none');
}

function populateParentDropdown(selectedParentId = null) {
    const parentSelect = document.getElementById('newMenuParent');
    parentSelect.innerHTML = '<option value="">(None - Root Level)</option>';
    const currentEditingId = document.getElementById('newMenuId').value;
    (allData.CustomMenus || []).forEach(menu => {
        if(collectionConfigs[menu.name] && menu.name !== currentEditingId) {
            const selected = menu.name === selectedParentId ? 'selected' : '';
            parentSelect.innerHTML += `<option value="${menu.name}" ${selected}>${menu.displayName}</option>`;
        }
    });
}

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
        html += `<div class="col-span-full mt-3 mb-1 border-b dark:border-gray-700 pb-1">
                    <h4 class="text-sm font-bold text-indigo-600 dark:text-indigo-400">${groupName}</h4>
                 </div>`;
        fields.forEach(field => {
            const isRequired = field.id === 'SerialNumber' || field.id === 'ItemName' || field.id === 'Status'; 
            html += `<div class="flex items-center space-x-2">
                        <input type="checkbox" id="field_${field.id}" value="${field.id}" ${isRequired?'checked disabled':'checked'} class="col-checkbox rounded text-indigo-600 focus:ring-indigo-500">
                        <label for="field_${field.id}" class="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">${field.label} ${isRequired?'<span class="text-xs text-red-500 ml-1">*Required</span>':''}</label>
                     </div>`;
        });
    }
    colContainer.innerHTML = html;
}
setTimeout(initColumnSelector, 1000);

async function saveCustomMenu() {
    const mode = document.getElementById('editMenuMode').value;
    const idInput = document.getElementById('newMenuId').value.trim();
    const displayInput = document.getElementById('newMenuDisplay').value.trim();
    const iconInput = document.getElementById('newMenuIcon').value;
    const parentInput = document.getElementById('newMenuParent').value;
    const orderInput = document.getElementById('newMenuOrder').value;
    
    if (!idInput || !displayInput) { showNotificationModal('warning', 'Missing Info', 'Please fill Menu Name and Display Name.'); return; }
    if (mode === 'create' && !/^[a-zA-Z0-9]+$/.test(idInput)) { showNotificationModal('warning', 'Invalid Name', 'Menu ID must only contain letters and numbers.'); return; }

    const getFieldObj = (id) => {
        const base = AVAILABLE_FIELDS.find(f => f.id === id);
        return base || { id: id, label: id, type: 'text' };
    };

    const selectedFields = [];
    document.querySelectorAll('.col-checkbox').forEach(cb => {
        if(cb.checked || cb.disabled) selectedFields.push(getFieldObj(cb.value));
    });

    const payload = { 
        name: idInput, 
        displayName: displayInput, 
        icon: iconInput, 
        parentId: parentInput || null, 
        order: orderInput,
        fields: selectedFields 
    };

    try {
        if (mode === 'edit') {
            await apiRequest(`/api/custom-menus/${idInput}`, 'PUT', payload);
            showNotificationModal('success', 'Menu Updated', `Custom menu updated.`);
        } else {
            await apiRequest('/api/custom-menus', 'POST', payload);
            showNotificationModal('success', 'Menu Created', `Custom menu created.`);
        }
        hideModal('addMenuModal');
        await initializeAppLogic(); 
    } catch (error) { showNotificationModal('warning', 'Error', error.message); }
}

async function deleteCustomMenu(menuName, event) {
    if (event) event.stopPropagation();
    if (!confirm(`Delete menu "${menuName}"? Data will NOT be deleted, only the menu.`)) return;
    try {
        await apiRequest(`/api/custom-menus/${menuName}`, 'DELETE');
        showNotificationModal('success', 'Deleted', `Menu deleted.`);
        await initializeAppLogic();
    } catch (error) { showNotificationModal('warning', 'Cannot Delete', error.message); }
}

// ==========================================
// --- PAGE LOAD & SWITCHING ---
// ==========================================

function logout() { localStorage.removeItem('authToken'); localStorage.removeItem('user'); window.location.replace('login.html'); }

function loadPage(pageName, navElement) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.page-content').forEach(p => p.style.display = 'none');

    if (navElement) {
        navElement.classList.add('active');
        const parentDetails = navElement.closest('details');
        if (parentDetails) parentDetails.setAttribute('open', 'true');
    } else {
        const el = document.getElementById(`nav-${pageName}`);
        if(el) {
            el.classList.add('active');
            const parentDetails = el.closest('details');
            if (parentDetails) parentDetails.setAttribute('open', 'true');
        }
    }

    const pageId = `${pageName.toLowerCase()}-page`;
    let pageDiv = document.getElementById(pageId);
    
    if (pageName === 'LabelPrinter' && !pageDiv) {
        pageDiv = document.createElement('div');
        pageDiv.id = pageId;
        pageDiv.className = 'page-content';
        document.getElementById('main-content').appendChild(pageDiv);
        buildLabelPrinterPage();
    }

    if (pageDiv) {
        pageDiv.style.display = 'block';
        if (pageName === 'Dashboard') updateDashboard();
        else if (pageName === 'Software') buildSoftwareCards();
        else if (pageName === 'LoanHistory') buildLoanHistoryCards();
        else if (pageName === 'Maintenance') buildMaintenancePage();
        else if (pageName === 'AssetsByUser') buildAssetsByUserPage();
        else if (pageName === 'Handover') buildHandoverReturnPage();
        else if (pageName === 'StaffManagement') buildStaffManagementPage();
        else if (pageName === 'AdminManagement') buildAdminManagementPage();
        else if (pageName === 'DisposedAssets') renderDisposedAssets(); // 🌟 หน้าเฉพาะ Disposed Assets
        else if (collectionConfigs[pageName]) {
            const state = paginationState[pageName];
            state.filterText = '';
            const searchInput = document.getElementById(`${pageName.toLowerCase()}SearchInput`);
            if (searchInput) searchInput.value = '';
            buildTable(pageName);
        }
    }
    if (window.innerWidth < 768) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if(sidebar) sidebar.classList.add('-translate-x-full');
        if(overlay) overlay.classList.add('hidden');
    }
}

// ==========================================
// --- BULK SELECTION & MANAGEMENT ---
// ==========================================

window.toggleSelectAll = (collectionName, checkbox) => {
    const isChecked = checkbox.checked;
    const checkboxes = document.querySelectorAll(`.${collectionName}-row-cb`);
    selectedItems[collectionName] = selectedItems[collectionName] || [];
    
    checkboxes.forEach(cb => {
        cb.checked = isChecked;
        if (isChecked && !selectedItems[collectionName].includes(cb.value)) {
            selectedItems[collectionName].push(cb.value);
        } else if (!isChecked) {
            selectedItems[collectionName] = selectedItems[collectionName].filter(id => id !== cb.value);
        }
    });
    updateBulkActionBar(collectionName);
};

window.toggleSelectItem = (collectionName, checkbox) => {
    selectedItems[collectionName] = selectedItems[collectionName] || [];
    if (checkbox.checked) {
        if (!selectedItems[collectionName].includes(checkbox.value)) {
            selectedItems[collectionName].push(checkbox.value);
        }
    } else {
        selectedItems[collectionName] = selectedItems[collectionName].filter(id => id !== checkbox.value);
        const selectAllCb = document.getElementById(`selectAll_${collectionName}`);
        if(selectAllCb) selectAllCb.checked = false;
    }
    updateBulkActionBar(collectionName);
};

function updateBulkActionBar(collectionName) {
    const count = (selectedItems[collectionName] || []).length;
    const bar = document.getElementById(`${collectionName}BulkActions`);
    if (!bar) return;
    
    if (count > 0) {
        bar.classList.remove('hidden');
        bar.querySelector('.selected-count').textContent = `${count} item(s) selected`;
    } else {
        bar.classList.add('hidden');
        const selectAllCb = document.getElementById(`selectAll_${collectionName}`);
        if (selectAllCb) selectAllCb.checked = false;
    }
}

window.bulkDelete = async (collectionName) => {
    const ids = selectedItems[collectionName] || [];
    if (ids.length === 0) return;
    if (!confirm(`Are you sure you want to permanently delete ${ids.length} selected item(s)?`)) return;

    try {
        await apiRequest(`/api/inventory/${collectionName}/bulk-delete`, 'POST', { ids });
        showNotificationModal('success', 'Bulk Delete Successful', `Deleted ${ids.length} item(s).`);
        selectedItems[collectionName] = []; 
        await refreshAllData();
        buildTable(collectionName);
        updateDashboard();
    } catch (error) {
        showNotificationModal('warning', 'Bulk Delete Failed', error.message);
    }
};

window.openBulkEditModal = (collectionName) => {
    const ids = selectedItems[collectionName] || [];
    if (ids.length === 0) return;
    
    document.getElementById('bulkEditForm').reset();
    document.getElementById('bulkEditCollection').value = collectionName;
    document.getElementById('bulkEditCount').textContent = ids.length;
    document.getElementById('bulkEditModal').classList.remove('opacity-0', 'pointer-events-none');
};

window.saveBulkEdit = async () => {
    const collectionName = document.getElementById('bulkEditCollection').value;
    const ids = selectedItems[collectionName] || [];
    
    const status = document.getElementById('bulkEditStatus').value;
    const location = document.getElementById('bulkEditLocation').value.trim();
    const user = document.getElementById('bulkEditUser').value.trim();
    
    const updateData = {};
    if (status) updateData.Status = status;
    if (location) updateData.Location = location;
    if (user !== '') updateData.UserName = user; 
    
    if (Object.keys(updateData).length === 0) {
        hideModal('bulkEditModal');
        return;
    }

    try {
        await apiRequest(`/api/inventory/${collectionName}/bulk-update`, 'PUT', { ids, updateData });
        showNotificationModal('success', 'Bulk Update Successful', `Updated ${ids.length} item(s).`);
        hideModal('bulkEditModal');
        selectedItems[collectionName] = []; 
        await refreshAllData();
        buildTable(collectionName);
        updateDashboard();
    } catch (error) {
        showNotificationModal('warning', 'Bulk Update Failed', error.message);
    }
};


// --- Table Building Logic ---
function buildTable(collectionName) {
    const table = document.getElementById(collectionName + 'Table');
    if (!table) return;
    const state = paginationState[collectionName];
    const fullData = allData[collectionName] || [];
    const config = collectionConfigs[collectionName];
    
    // 🌟 นำข้อมูลสถานะ "Disposed" ออกไป เพื่อไม่ให้ปนในตารางหลัก
    let filteredData = fullData.filter(i => i.Status !== 'Disposed');
    
    if (state.statusFilter) filteredData = filteredData.filter(i => i.Status === state.statusFilter);
    if (state.categoryFilter && config.categoryFilterField) filteredData = filteredData.filter(item => item[config.categoryFilterField] === state.categoryFilter);
    if (state.filterText) filteredData = filteredData.filter(i => JSON.stringify(Object.values(i)).toUpperCase().includes(state.filterText.toUpperCase()));
    
    const totalRows = filteredData.length;
    const startIndex = (state.currentPage - 1) * state.rowsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + state.rowsPerPage);
    
    let html = `<thead class="bg-gray-50 dark:bg-gray-700"><tr>`;
    html += `<th class="px-4 py-3 w-12 text-center"><input type="checkbox" id="selectAll_${collectionName}" onclick="toggleSelectAll('${collectionName}', this)" class="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"></th>`;

    config.headers.forEach(h => {
        const fieldDef = AVAILABLE_FIELDS.find(f => f.id === h);
        const label = fieldDef ? fieldDef.label : h;
        html += `<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">${label}</th>`
    });
    html += `<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th></tr></thead><tbody class="divide-y divide-gray-200 dark:divide-gray-700">`;
    
    if (paginatedData.length === 0) html += `<tr><td colspan="${config.headers.length + 2}" class="px-6 py-4 text-center text-gray-500">No data found.</td></tr>`;
    else {
        let allCurrentPageSelected = true;

        paginatedData.forEach(item => {
            const isChecked = (selectedItems[collectionName] || []).includes(item.id);
            if (!isChecked) allCurrentPageSelected = false;

            html += `<tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">`;
            html += `<td class="px-4 py-3 text-center"><input type="checkbox" value="${item.id}" onclick="toggleSelectItem('${collectionName}', this)" class="${collectionName}-row-cb rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer" ${isChecked ? 'checked' : ''}></td>`;

            config.headers.forEach(header => {
                let val = item[header] || '';
                
                if (header === 'Status') {
                   let color = 'gray';
                   if (val === 'Active') color = 'green'; else if (val === 'On Loan') color = 'yellow'; else if (val === 'Repair') color = 'orange'; else if (val === 'Storage') color = 'blue'; else if (val === 'Damaged') color = 'red';
                   val = `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${color}-100 text-${color}-800 dark:bg-${color}-900/50 dark:text-${color}-300">${val}</span>`; 
                }
                else if (header === 'Last Seen') {
                     const lastSeen = item.lastSeenOnline;
                     if (lastSeen) {
                        const diffMins = (new Date() - new Date(lastSeen)) / 60000;
                        // ถ้าเจอภายใน 15 นาที ถือว่า Online
                        if (diffMins <= 15) {
                            val = `<div class="flex items-center space-x-2"><div class="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e] animate-pulse"></div><span class="font-medium text-green-600 dark:text-green-400">Online</span></div>`;
                        } else {
                            val = `<div class="flex flex-col"><div class="flex items-center space-x-2"><div class="h-2.5 w-2.5 rounded-full bg-gray-400"></div><span class="text-gray-500">Offline</span></div><span class="text-[10px] text-gray-400 mt-0.5" title="${new Date(lastSeen).toLocaleString('th-TH')}">ล่าสุด: ${window.formatTimeAgo(lastSeen)}</span></div>`;
                        }
                     } else {
                        val = `<div class="flex items-center space-x-2"><div class="h-2.5 w-2.5 rounded-full bg-yellow-400"></div><span class="text-gray-500">Unknown</span></div>`;
                     }
                }

                html += `<td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap max-w-xs truncate" title="${String(val).replace(/<[^>]*>?/gm, '')}">${val}</td>`;
            });
            html += `<td class="px-6 py-4 text-sm font-medium space-x-3 whitespace-nowrap"><button onclick="openModal('edit', '${collectionName}', '${item.id}')" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"><i class="fas fa-edit"></i></button><button onclick="deleteItem('${collectionName}', '${item.id}')" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><i class="fas fa-trash"></i></button><button onclick="showQrModal('${item[config.serialField]}', '${item[config.nameField]}')" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"><i class="fas fa-qrcode"></i></button></td></tr>`;
        });

        setTimeout(() => {
            const selectAllCb = document.getElementById(`selectAll_${collectionName}`);
            if (selectAllCb) selectAllCb.checked = paginatedData.length > 0 && allCurrentPageSelected;
        }, 10);
    }
    table.innerHTML = html + `</tbody>`;
    renderPaginationControls(collectionName, totalRows);
    updateBulkActionBar(collectionName);
}

function renderPaginationControls(collectionName, totalRows) {
    const container = document.getElementById(collectionName + 'Pagination');
    if (!container) return;
    const state = paginationState[collectionName];
    const totalPages = Math.ceil(totalRows / state.rowsPerPage);
    const startItem = totalRows > 0 ? (state.currentPage - 1) * state.rowsPerPage + 1 : 0;
    const endItem = Math.min(state.currentPage * state.rowsPerPage, totalRows);
    container.innerHTML = `<div class="text-sm">Showing <span class="font-semibold">${startItem}</span> to <span class="font-semibold">${endItem}</span> of <span class="font-semibold">${totalRows}</span> results</div><div class="flex items-center space-x-2"><label class="text-sm font-medium">Rows:</label><select onchange="changeRowsPerPage('${collectionName}', this)" class="rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-sm"><option value="10" ${state.rowsPerPage == 10 ? 'selected' : ''}>10</option><option value="25" ${state.rowsPerPage == 25 ? 'selected' : ''}>25</option><option value="50" ${state.rowsPerPage == 50 ? 'selected' : ''}>50</option></select><button onclick="changePage('${collectionName}', -1)" ${state.currentPage===1?'disabled':''} class="px-2 py-1 border rounded disabled:opacity-50 bg-white dark:bg-gray-700"><i class="fas fa-chevron-left"></i></button><span class="text-sm">Page ${state.currentPage} / ${totalPages || 1}</span><button onclick="changePage('${collectionName}', 1)" ${state.currentPage>=totalPages?'disabled':''} class="px-2 py-1 border rounded disabled:opacity-50 bg-white dark:bg-gray-700"><i class="fas fa-chevron-right"></i></button></div>`;
}

// --- CRUD & Forms ---
function openModal(mode, collectionName, id = null) {
    currentEdit = { mode, collection: collectionName, id };
    const form = document.getElementById('editForm');
    if (!form) return;
    form.innerHTML = '';
    const config = collectionConfigs[collectionName];
    const itemData = (mode === 'edit' && allData[collectionName]) ? allData[collectionName].find(i => i.id === id) || {} : {};
    document.getElementById('editModalTitle').textContent = `${mode === 'edit' ? 'Edit' : 'Add'} ${collectionName}`;
    
    const groups = {
        'Core Identity': [],
        'Hardware & Specs': [],
        'Network & Connectivity': [],
        'Assignment & Location': [],
        'Purchase & Warranty': [],
        'Inventory & Notes': [],
        'Other': []
    };

    config.formFields.forEach(fieldId => {
        const fieldDef = AVAILABLE_FIELDS.find(f => f.id === fieldId) || { label: fieldId, type: 'text', group: 'Other' };
        const grp = fieldDef.group || 'Other';
        if(!groups[grp]) groups[grp] = [];
        groups[grp].push({ id: fieldId, def: fieldDef });
    });

    let formHtml = '';
    for (const [groupName, fields] of Object.entries(groups)) {
        if (fields.length === 0) continue;
        
        formHtml += `<div class="col-span-full mt-4 mb-2"><h4 class="text-md font-bold text-indigo-600 dark:text-indigo-400 border-b border-indigo-100 dark:border-indigo-900/50 pb-2">${groupName}</h4></div>`;
        formHtml += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">';
        
        fields.forEach(f => {
            const fieldId = f.id;
            const fieldDef = f.def;
            let val = itemData[fieldId] !== undefined ? itemData[fieldId] : '';
            const dropdown = config.dropdowns && config.dropdowns[fieldId];
            
            formHtml += `<div class="col-span-1"><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">${fieldDef.label}</label>`;
            if (dropdown) {
                formHtml += `<select name="${fieldId}" id="edit-${fieldId}" class="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"><option value="">-- Select --</option>${dropdown.map(opt => `<option value="${opt}" ${val === opt ? 'selected' : ''}>${opt}</option>`).join('')}</select>`;
            } else if (fieldDef.type === 'date') {
                const d = new Date(val);
                if(!isNaN(d) && val) val = d.toISOString().split('T')[0];
                formHtml += `<input type="date" name="${fieldId}" id="edit-${fieldId}" value="${val}" class="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">`;
            } else if (fieldDef.type === 'number') {
                formHtml += `<input type="number" name="${fieldId}" id="edit-${fieldId}" value="${val}" class="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">`;
            } else if (fieldDef.type === 'textarea') {
                formHtml += `<textarea name="${fieldId}" id="edit-${fieldId}" rows="3" class="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">${val}</textarea>`;
            } else {
                formHtml += `<input type="text" name="${fieldId}" id="edit-${fieldId}" value="${val}" class="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">`;
            }
            formHtml += `</div>`;
        });
        formHtml += '</div>';
    }
    
    form.innerHTML = formHtml;
    
    // 🌟 จัดการกล่องอัปโหลดเอกสารแทงจำหน่าย (Disposal)
    const disposalSection = document.getElementById('disposal-evidence-section');
    const existingEvidenceBox = document.getElementById('existingEvidenceBox');
    const fileInput = document.getElementById('disposalFileInput');
    const hiddenBase64 = document.getElementById('hiddenEvidenceBase64');
    
    if (fileInput) fileInput.value = '';
    if (hiddenBase64) hiddenBase64.value = '';
    
    if (itemData.Status === 'Disposed') {
        if(disposalSection) disposalSection.classList.remove('hidden');
        if (itemData.DisposalEvidence && existingEvidenceBox && hiddenBase64) {
            existingEvidenceBox.classList.remove('hidden');
            hiddenBase64.value = itemData.DisposalEvidence;
        } else if (existingEvidenceBox) {
            existingEvidenceBox.classList.add('hidden');
        }
    } else {
        if(disposalSection) disposalSection.classList.add('hidden');
        if(existingEvidenceBox) existingEvidenceBox.classList.add('hidden');
    }

    const tabBtn = document.querySelector('#modal-tabs .tab-button');
    if (tabBtn) switchModalTab('details', tabBtn);
    buildMaintenanceLogInModal(itemData);
    document.getElementById('editModal').classList.remove('opacity-0', 'pointer-events-none');
}

// ดักจับการเปลี่ยน Status เพื่อโชว์กล่องแทงจำหน่าย
document.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'edit-Status') {
        const disposalSection = document.getElementById('disposal-evidence-section');
        if (!disposalSection) return;
        if (e.target.value === 'Disposed') {
            disposalSection.classList.remove('hidden');
            disposalSection.classList.add('animate-pulse');
            setTimeout(() => disposalSection.classList.remove('animate-pulse'), 1000);
        } else {
            disposalSection.classList.add('hidden');
        }
    }
});

async function saveData() {
    const formData = new FormData(document.getElementById('editForm'));
    const data = Object.fromEntries(formData.entries());
    const { mode, collection, id } = currentEdit;

    // 🌟 ตรวจสอบและยัดไฟล์แทงจำหน่ายเข้า Database
    const statusInput = document.getElementById('edit-Status');
    const fileInput = document.getElementById('disposalFileInput');
    const hiddenBase64 = document.getElementById('hiddenEvidenceBase64');

    if (statusInput && statusInput.value === 'Disposed') {
        if (fileInput && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            if (file.size > 2 * 1024 * 1024) return alert("ไฟล์เอกสารต้องมีขนาดไม่เกิน 2MB");
            try {
                data.DisposalEvidence = await convertFileToBase64(file);
                data.DisposalDate = new Date().toISOString();
            } catch (err) {
                return alert("เกิดข้อผิดพลาดในการอ่านไฟล์");
            }
        } 
        else if (hiddenBase64 && hiddenBase64.value) {
            data.DisposalEvidence = hiddenBase64.value;
        } 
        else {
            if (!confirm("คุณกำลังเปลี่ยนสถานะเป็น 'Disposed' แต่ไม่ได้แนบเอกสาร ต้องการดำเนินการต่อหรือไม่?")) return;
            data.DisposalDate = new Date().toISOString();
        }
    } else if (statusInput && statusInput.value !== 'Disposed') {
        data.DisposalEvidence = null;
        data.DisposalDate = null;
    }

    try {
        if (mode === 'edit') await apiRequest(`/api/inventory/${collection}/${id}`, 'PUT', data);
        else await apiRequest(`/api/inventory/${collection}`, 'POST', data);
        showNotificationModal('success', 'Success', `Data saved successfully.`);
        hideModal('editModal');
        await refreshAllData();
        buildTable(collection);
        updateDashboard();
    } catch (error) { showNotificationModal('warning', 'Save Failed', error.message); }
}

async function deleteItem(collectionName, id) {
    if (confirm(`Are you sure you want to delete this item?`)) {
        try {
            await apiRequest(`/api/inventory/${collectionName}/${id}`, 'DELETE');
            showNotificationModal('success', 'Deleted', 'The item has been deleted.');
            await refreshAllData();
            buildTable(collectionName);
            updateDashboard();
        } catch (error) {}
    }
}

// --- Dashboard & Helpers ---
function updateDashboard() {
    const allItems = Object.keys(collectionConfigs).flatMap(k => allData[k] || []);
    if(document.getElementById('stat-total-devices')) {
        document.getElementById('stat-total-devices').innerText = allItems.length;
        document.getElementById('stat-total-onloan').innerText = allItems.filter(i=>i.Status==='On Loan').length;
        document.getElementById('stat-total-storage').innerText = allItems.filter(i=>i.Status==='Storage').length;
        document.getElementById('stat-total-repair-damaged').innerText = allItems.filter(i=>['Repair','Damaged'].includes(i.Status)).length;
    }
    const statusCounts = {};
    allItems.forEach(i => { statusCounts[i.Status] = (statusCounts[i.Status] || 0) + 1; });
    renderStatusChart(statusCounts);
    const categoryCounts = {};
    Object.keys(collectionConfigs).forEach(k => { categoryCounts[k] = (allData[k] || []).length; });
    renderCategoryChart(categoryCounts);
}

function renderStatusChart(data) {
    const ctx = document.getElementById('statusChart');
    if(!ctx) return;
    if(statusChart) { statusChart.data.labels = Object.keys(data); statusChart.data.datasets[0].data = Object.values(data); statusChart.update(); }
    else { statusChart = new Chart(ctx, { type: 'doughnut', data: { labels: Object.keys(data), datasets: [{ data: Object.values(data), backgroundColor: ['#22c55e', '#eab308', '#f97316', '#3b82f6', '#ef4444', '#9ca3af'] }] }, options: { responsive: true, maintainAspectRatio: false } }); }
}

function renderCategoryChart(data) {
    const ctx = document.getElementById('categoryChart');
    if(!ctx) return;
    if(categoryChart) { categoryChart.data.labels = Object.keys(data); categoryChart.data.datasets[0].data = Object.values(data); categoryChart.update(); }
    else { categoryChart = new Chart(ctx, { type: 'bar', data: { labels: Object.keys(data), datasets: [{ label: 'Assets', data: Object.values(data), backgroundColor: '#6366f1' }] }, options: { responsive: true, maintainAspectRatio: false } }); }
}

// --- Modal Utilities ---
function hideModal(id) { document.getElementById(id).classList.add('opacity-0', 'pointer-events-none'); }
function showNotificationModal(type, title, msg) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = msg;
    const icon = document.getElementById('modalIcon');
    if(type === 'success') icon.innerHTML = '<i class="fas fa-check-circle text-4xl text-green-500"></i>';
    else if(type === 'warning') icon.innerHTML = '<i class="fas fa-exclamation-triangle text-4xl text-yellow-500"></i>';
    else icon.innerHTML = '<i class="fas fa-info-circle text-4xl text-blue-500"></i>';
    document.getElementById('notificationModal').classList.remove('opacity-0', 'pointer-events-none');
}

// --- MANAGEMENT PAGES IMPLEMENTATION ---

// 1. Handover Page
function buildHandoverReturnPage() {
    const handoverTab = document.getElementById('handover-tab-content');
    if(handoverTab) {
        handoverTab.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div><h3 class="font-semibold mb-2">1. Select Staff</h3><input type="text" onkeyup="filterStaffList(this, 'handoverStaffList')" placeholder="Search staff..." class="w-full p-2 border rounded mb-2 dark:bg-gray-700 dark:border-gray-600"><div id="handoverStaffList" class="max-h-48 overflow-y-auto border rounded p-2 dark:border-gray-600"></div><h3 class="font-semibold mb-2 mt-4">2. Select Device</h3><input type="text" onkeyup="filterDeviceList(this, 'handoverDeviceList')" placeholder="Search storage..." class="w-full p-2 border rounded mb-2 dark:bg-gray-700 dark:border-gray-600"><div id="handoverDeviceList" class="max-h-64 overflow-y-auto border rounded p-2 dark:border-gray-600"></div></div>
                <div><h3 class="font-semibold mb-2">3. Cart</h3><p class="text-sm mb-2">Staff: <span id="selectedHandoverStaff" class="font-bold">None</span></p><div id="handoverCartList" class="border rounded p-2 min-h-[200px] bg-gray-50 dark:bg-gray-700 space-y-2"><p class="text-center text-gray-400 p-4">Empty</p></div><button id="confirmHandoverBtn" onclick="confirmHandover()" class="mt-4 w-full bg-indigo-600 text-white font-bold py-3 rounded disabled:bg-gray-400" disabled>Confirm</button></div>
            </div>`;
        populateStaffLists('handoverStaffList', 'selectedHandoverStaff');
        populateHandoverDeviceList();
    }
    const returnTab = document.getElementById('return-tab-content');
    if(returnTab) {
        returnTab.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div><h3 class="font-semibold mb-2">1. Find Staff</h3><input type="text" onkeyup="filterStaffList(this, 'returnStaffList')" placeholder="Search staff..." class="w-full p-2 border rounded mb-2 dark:bg-gray-700 dark:border-gray-600"><div id="returnStaffList" class="max-h-48 overflow-y-auto border rounded p-2 dark:border-gray-600"></div></div>
                <div><h3 class="font-semibold mb-2">2. Return Devices</h3><p class="text-sm mb-2">Assets of: <span id="selectedReturnStaff" class="font-bold">None</span></p><div id="returnDeviceList" class="border rounded p-2 min-h-[200px] bg-gray-50 dark:bg-gray-700 space-y-2"><p class="text-center text-gray-400 p-4">Select staff first.</p></div><button id="confirmReturnBtn" onclick="confirmReturn()" class="mt-4 w-full bg-green-600 text-white font-bold py-3 rounded disabled:bg-gray-400" disabled>Confirm Return</button></div>
            </div>`;
        populateStaffLists('returnStaffList', 'selectedReturnStaff', true);
    }
}

function populateStaffLists(listId, labelId, isReturn = false) {
    const list = document.getElementById(listId);
    if (!list) return;
    const staff = allData.Staff || [];
    if (staff.length === 0) { list.innerHTML = `<p class="p-2 text-center text-gray-500">No staff found.</p>`; return; }
    list.innerHTML = staff.map(s => `<div class="staff-item p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer rounded" onclick="selectStaff('${s.UserName}', '${listId}', '${labelId}', ${isReturn})">${s.FirstName || s.UserName} ${s.LastName || ''}</div>`).join('');
}

window.selectStaff = (name, listId, labelId, isReturn) => {
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
                return `<div class="p-2 bg-white dark:bg-gray-800 rounded border flex items-center space-x-3"><input type="checkbox" class="return-checkbox rounded" value="${d.id}" data-col="${d.collection}"><div><p class="font-semibold text-sm">${d[config.nameField]}</p><p class="text-xs text-gray-400">${d[config.serialField]}</p></div></div>`;
            }).join('');
            document.querySelectorAll('.return-checkbox').forEach(cb => cb.addEventListener('change', () => document.getElementById('confirmReturnBtn').disabled = !document.querySelector('.return-checkbox:checked')));
        }
    } else {
        updateHandoverButtonState();
    }
};

function populateHandoverDeviceList() {
    const list = document.getElementById('handoverDeviceList');
    const allDevices = Object.keys(collectionConfigs).flatMap(cat => (allData[cat] || []).map(d => ({ ...d, collection: cat })));
    const available = allDevices.filter(d => d.Status === 'Storage');
    if (available.length === 0) { list.innerHTML = `<p class="text-center text-gray-400 p-4">No devices in storage.</p>`; return; }
    list.innerHTML = available.map(d => {
        const config = collectionConfigs[d.collection];
        return `<div class="device-item p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex justify-between items-center" onclick="addDeviceToHandoverCart('${d.id}', '${d.collection}')"><div><p class="font-semibold text-sm">${d[config.nameField]}</p><p class="text-xs text-gray-400">${d[config.serialField]}</p></div><i class="fas fa-plus text-green-500"></i></div>`;
    }).join('');
}

window.addDeviceToHandoverCart = (id, col) => {
    if(!handoverCart.some(i=>i.id===id)) {
        const item = allData[col].find(i=>i.id===id);
        handoverCart.push({...item, collection: col});
        renderHandoverCart();
        updateHandoverButtonState();
    }
};

function renderHandoverCart() {
    const list = document.getElementById('handoverCartList');
    if(handoverCart.length===0) list.innerHTML = `<p class="text-center text-gray-400 p-4">Select items.</p>`;
    else {
        list.innerHTML = handoverCart.map(d => {
            const config = collectionConfigs[d.collection];
            return `<div class="p-2 bg-white dark:bg-gray-800 rounded border flex justify-between"><div><p class="font-semibold text-sm">${d[config.nameField]}</p><p class="text-xs text-gray-400">${d[config.serialField]}</p></div><button onclick="removeHandoverItem('${d.id}')" class="text-red-500"><i class="fas fa-times"></i></button></div>`;
        }).join('');
    }
}

window.removeHandoverItem = (id) => { handoverCart = handoverCart.filter(i=>i.id!==id); renderHandoverCart(); updateHandoverButtonState(); };
function updateHandoverButtonState() { 
    const staffSelected = document.getElementById('selectedHandoverStaff').textContent !== 'None';
    document.getElementById('confirmHandoverBtn').disabled = !(staffSelected && handoverCart.length > 0); 
}

window.confirmHandover = async () => {
    const staff = document.getElementById('selectedHandoverStaff').textContent;
    if(confirm(`Handover ${handoverCart.length} items to ${staff}?`)) {
        await apiRequest('/api/transactions/handover', 'POST', { staffUserName: staff, devices: handoverCart });
        handoverCart = []; renderHandoverCart(); populateHandoverDeviceList(); showNotificationModal('success', 'Success', 'Items assigned.');
    }
};

window.confirmReturn = async () => {
    const items = Array.from(document.querySelectorAll('.return-checkbox:checked')).map(cb => ({ id: cb.value, collection: cb.dataset.col }));
    if(confirm(`Return ${items.length} items?`)) {
        await apiRequest('/api/transactions/return', 'POST', { devices: items });
        document.getElementById('returnDeviceList').innerHTML = ''; showNotificationModal('success', 'Success', 'Items returned.');
    }
};

// 2. Staff Management
function buildStaffManagementPage() {
    const page = document.getElementById('staffmanagement-page');
    page.innerHTML = `
        <div class="flex justify-between items-center mb-6"><h2 class="text-2xl font-bold dark:text-white">Staff Management</h2><button onclick="openStaffModal('add')" class="bg-indigo-600 text-white px-4 py-2 rounded">Add Staff</button></div>
        <div class="bg-white dark:bg-gray-800 rounded shadow overflow-x-auto"><table class="min-w-full"><thead class="bg-gray-50 dark:bg-gray-700"><tr><th class="px-6 py-3 text-left text-xs uppercase text-gray-500">Username</th><th class="px-6 py-3 text-left text-xs uppercase text-gray-500">Name</th><th class="px-6 py-3 text-left text-xs uppercase text-gray-500">Dept</th><th class="px-6 py-3"></th></tr></thead><tbody id="staffTableBody" class="divide-y divide-gray-200 dark:divide-gray-700"></tbody></table></div>`;
    renderStaffTable();
}

function renderStaffTable() {
    const tbody = document.getElementById('staffTableBody');
    const staff = allData.Staff || [];
    if(staff.length === 0) tbody.innerHTML = `<tr><td colspan="4" class="text-center p-4 text-gray-500">No staff found.</td></tr>`;
    else tbody.innerHTML = staff.map(s => `<tr><td class="px-6 py-4">${s.UserName}</td><td class="px-6 py-4">${s.FirstName||''} ${s.LastName||''}</td><td class="px-6 py-4">${s.Department||''}</td><td class="px-6 py-4 text-right"><button onclick="openStaffModal('edit','${s.id}')" class="text-indigo-600 mr-2"><i class="fas fa-edit"></i></button><button onclick="deleteStaff('${s.id}')" class="text-red-600"><i class="fas fa-trash"></i></button></td></tr>`).join('');
}

window.openStaffModal = (mode, id) => {
    currentStaffEdit = { mode, id };
    const modal = document.getElementById('editStaffModal');
    const form = document.getElementById('editStaffForm');
    form.reset();
    document.getElementById('editStaffModalTitle').textContent = mode === 'edit' ? 'Edit Staff' : 'Add Staff';
    if (mode === 'edit') {
        const s = allData.Staff.find(i => i.id === id);
        if(s) {
            document.getElementById('editStaffUserName').value = s.UserName;
            document.getElementById('editStaffFirstName').value = s.FirstName;
            document.getElementById('editStaffLastName').value = s.LastName;
            document.getElementById('editStaffDepartment').value = s.Department;
        }
    }
    modal.classList.remove('opacity-0', 'pointer-events-none');
};

window.saveStaffChanges = async () => {
    const data = {
        UserName: document.getElementById('editStaffUserName').value,
        FirstName: document.getElementById('editStaffFirstName').value,
        LastName: document.getElementById('editStaffLastName').value,
        Department: document.getElementById('editStaffDepartment').value
    };
    if(!data.UserName) return alert("Username required");
    const { mode, id } = currentStaffEdit;
    if (mode === 'edit') await apiRequest(`/api/staff/${id}`, 'PUT', data);
    else await apiRequest('/api/staff', 'POST', data);
    hideModal('editStaffModal'); await refreshAllData(); renderStaffTable();
};

window.deleteStaff = async (id) => {
    if(confirm("Delete this staff?")) { await apiRequest(`/api/staff/${id}`, 'DELETE'); await refreshAllData(); renderStaffTable(); }
};

// 3. Admin Management
function buildAdminManagementPage() {
    const page = document.getElementById('adminmanagement-page');
    page.innerHTML = `
        <div class="flex justify-between items-center mb-6"><h2 class="text-2xl font-bold dark:text-white">Admin Management</h2><button onclick="openAddUserModal()" class="bg-indigo-600 text-white px-4 py-2 rounded">Add Admin</button></div>
        <div class="bg-white dark:bg-gray-800 rounded shadow overflow-x-auto"><table class="min-w-full"><thead class="bg-gray-50 dark:bg-gray-700"><tr><th class="px-6 py-3 text-left text-xs uppercase text-gray-500">Email</th><th class="px-6 py-3 text-left text-xs uppercase text-gray-500">ID</th><th class="px-6 py-3"></th></tr></thead><tbody id="adminTableBody" class="divide-y divide-gray-200 dark:divide-gray-700"><tr><td colspan="3" class="text-center p-4">Loading...</td></tr></tbody></table></div>`;
    renderAdminTable();
}

async function renderAdminTable() {
    const res = await apiRequest('/api/admins/list');
    const tbody = document.getElementById('adminTableBody');
    if(!res || !res.users) return;
    tbody.innerHTML = res.users.map(u => `<tr><td class="px-6 py-4">${u.email}</td><td class="px-6 py-4 text-xs text-gray-500">${u._id}</td><td class="px-6 py-4 text-right"><button onclick="deleteAdmin('${u._id}')" class="text-red-600"><i class="fas fa-trash"></i></button></td></tr>`).join('');
}

window.openAddUserModal = () => document.getElementById('addUserModal').classList.remove('opacity-0', 'pointer-events-none');
window.deleteAdmin = async (id) => { if(confirm("Delete admin?")) { await apiRequest('/api/admins/delete', 'DELETE', { uid: id }); renderAdminTable(); } };

// Handlers for Add Admin Form
document.getElementById('addUserForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('newUserEmail').value;
    const pwd = document.getElementById('newUserPassword').value;
    try {
        await apiRequest('/api/admins/create', 'POST', { email, password: pwd });
        hideModal('addUserModal'); renderAdminTable();
    } catch(err) { document.getElementById('addUserError').textContent = err.message; }
});

// --- Maintenance Log Logic ---
function buildMaintenanceLogInModal(item) {
    const list = document.getElementById('maintenanceLogList');
    if(!list) return;
    list.innerHTML = '';
    const logs = (allData['Maintenance Log'] || []).filter(l => l.deviceId === item.id);
    if(logs.length === 0) list.innerHTML = '<p class="text-xs text-gray-500">No logs.</p>';
    logs.forEach(l => {
        list.innerHTML += `<div class="border-b py-2"><p class="text-sm font-semibold">${new Date(l.logDate).toLocaleDateString()}</p><p class="text-sm">${l.description}</p></div>`;
    });
}

function addMaintenanceLog() {
    const { collection, id } = currentEdit;
    const desc = document.getElementById('newLogDescription').value;
    const date = document.getElementById('newLogDate').value;
    const cost = document.getElementById('newLogCost').value;
    const tech = document.getElementById('newLogTechnician').value;
    if(!desc || !date) return alert("Date and Description required");
    apiRequest('/api/inventory/maintenance', 'POST', { deviceId: id, deviceCollection: collection, description: desc, logDate: date, cost: cost, technician: tech }).then(() => {
        alert("Log added"); document.getElementById('maintenanceLogForm').reset(); refreshAllData();
    });
}

// --- Import/Export ---
function openImportModal(collectionName) {
    currentImportCollection = collectionName;
    document.getElementById('importModalTitle').textContent = `Import CSV to ${collectionName}`;
    const config = collectionConfigs[collectionName];
    if (config) document.getElementById('importHeadersExample').textContent = config.formFields.join(', ');
    document.getElementById('importModal').classList.remove('opacity-0', 'pointer-events-none');
}

function downloadCsvTemplate() {
    if(!currentImportCollection) return;
    const config = collectionConfigs[currentImportCollection];
    const headers = config.formFields.join(',');
    const blob = new Blob(["\uFEFF" + headers], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = `${currentImportCollection}_template.csv`; link.click();
}

function processCsvImport() {
    const file = document.getElementById('csvFileInput').files[0];
    if (!file) { showNotificationModal('warning', 'No File', 'Please select a file.'); return; }
    Papa.parse(file, { header: true, skipEmptyLines: true, encoding: document.getElementById('csvEncoding').value, complete: async (results) => {
        try {
            if(results.data.length === 0) throw new Error("Empty CSV");
            await apiRequest(`/api/inventory/${currentImportCollection}/bulk`, 'POST', results.data);
            showNotificationModal('success', 'Imported', `Imported ${results.data.length} items.`);
            hideModal('importModal'); refreshAllData();
        } catch (e) { showNotificationModal('warning', 'Error', e.message); }
    }});
}

function showQrModal(sn, name) {
    document.getElementById('qrModalTitle').innerText = name;
    QRCode.toCanvas(document.getElementById('qrCanvas'), `${window.location.origin}/details.html?sn=${sn}`, { width: 200 });
    document.getElementById('qrModal').classList.remove('opacity-0', 'pointer-events-none');
}

// --- Specialized Page Builders ---
function buildSoftwareCards() { /* Logic specific to software view if needed */ }
function buildLoanHistoryCards() {
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
}
function buildMaintenancePage() {
    const container = document.getElementById('MaintenanceContainer');
    if(!container) return;
    container.innerHTML = '';
    const logs = allData['Maintenance Log'] || [];
    logs.sort((a,b) => new Date(b.logDate) - new Date(a.logDate)).forEach(log => {
        container.innerHTML += `<div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-3"><div class="flex justify-between"><span class="font-bold text-gray-800 dark:text-white">${log.deviceCollection} (ID: ${log.deviceId})</span><span class="text-sm text-gray-500">${new Date(log.logDate).toLocaleDateString()}</span></div><p class="text-gray-600 dark:text-gray-300 mt-1">${log.description}</p><div class="mt-2 text-xs text-gray-400 flex justify-between"><span>Tech: ${log.technician || '-'}</span><span>Cost: ${log.cost || 0}</span></div></div>`;
    });
}
function buildAssetsByUserPage() {
    const container = document.getElementById('AssetsByUserContainer');
    if(!container) return;
    container.innerHTML = '';
    const byUser = {};
    Object.keys(collectionConfigs).forEach(key => { (allData[key] || []).forEach(item => { const u = item.UserName || 'Unassigned'; if(!byUser[u]) byUser[u] = []; byUser[u].push({...item, type: key}); }); });
    Object.keys(byUser).sort().forEach(user => {
        if(user === 'Unassigned') return;
        const assets = byUser[user];
        container.innerHTML += `<details class="group bg-white dark:bg-gray-800 rounded-lg shadow mb-3"><summary class="p-4 flex justify-between items-center cursor-pointer list-none"><span class="font-bold text-gray-800 dark:text-white"><i class="fas fa-user mr-2"></i>${user}</span><span class="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">${assets.length} items</span></summary><div class="p-4 border-t dark:border-gray-700"><ul class="text-sm space-y-2">${assets.map(a => `<li class="flex justify-between items-center"><span>${a.ComputerName || a.DeviceName || a.ItemName || a.Model} <span class="text-xs text-gray-500">(${a.type})</span></span><span class="text-xs font-mono">${a.SerialNumber || a.MonitorSerial || '-'}</span></li>`).join('')}</ul></div></details>`;
    });
}

// ==========================================
// --- LABEL PRINTER SYSTEM (ADVANCED) ---
// ==========================================

let currentLabelItems = [];
let currentLabelCategory = null;

function buildLabelPrinterPage() {
    const pageId = 'labelprinter-page';
    let pageDiv = document.getElementById(pageId);
    if (!pageDiv) return;

    pageDiv.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Label Printer</h2>
            <button onclick="printLabel()" class="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 shadow-md flex items-center">
                <i class="fas fa-print mr-2"></i> Print Label
            </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-4 space-y-6">
                
                <div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm">
                    <h3 class="font-semibold text-lg border-b dark:border-gray-700 pb-2 mb-4 text-gray-800 dark:text-white">1. Select Assets</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                            <select id="labelCategorySelect" onchange="updateLabelItemDropdown()" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500">
                                <option value="">-- Select Category --</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex justify-between">
                                <span>Items to Print</span>
                                <span class="text-indigo-600 dark:text-indigo-400 text-xs" id="selectedLabelCount">0 selected</span>
                            </label>
                            <div class="mb-2 px-1">
                                <label class="inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="selectAllLabelItemsCb" onchange="toggleAllLabelItems(this.checked)" class="rounded text-indigo-600 focus:ring-indigo-500" disabled>
                                    <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">Select All</span>
                                </label>
                            </div>
                            <div id="labelItemList" class="max-h-48 overflow-y-auto space-y-1 border rounded-md p-2 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                                <p class="text-sm text-gray-500 text-center py-2">Select category first</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm">
                    <h3 class="font-semibold text-lg border-b dark:border-gray-700 pb-2 mb-4 text-gray-800 dark:text-white">2. Label Dimensions</h3>
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Width (mm)</label>
                            <input type="number" id="labelWidth" value="50" onchange="updateLabelPreview()" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Height (mm)</label>
                            <input type="number" id="labelHeight" value="30" onchange="updateLabelPreview()" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500">
                        </div>
                    </div>
                    <label class="flex items-center space-x-2 cursor-pointer bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg">
                        <input type="checkbox" id="labelSplitMode" onchange="updateLabelPreview()" class="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4">
                        <span class="text-sm font-medium text-indigo-800 dark:text-indigo-200">Split Label (Top/Bottom - 2 items)</span>
                    </label>
                </div>

                <div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm">
                    <h3 class="font-semibold text-lg border-b dark:border-gray-700 pb-2 mb-4 text-gray-800 dark:text-white">3. Data to Print</h3>
                    <div id="labelFieldsContainer" class="space-y-2 max-h-48 overflow-y-auto pr-2">
                        <p class="text-sm text-gray-500 text-center">Select category first</p>
                    </div>
                </div>

            </div>

            <div class="lg:col-span-8">
                <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex flex-col items-center justify-center min-h-[500px] border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <h3 class="text-gray-400 dark:text-gray-500 mb-6 font-medium tracking-widest uppercase">Live Preview</h3>
                    
                    <div class="bg-gray-100 dark:bg-gray-900 p-6 rounded-lg overflow-auto max-w-full max-h-[600px]">
                        <!-- Container for Preview Elements -->
                        <div id="print-area" class="flex flex-col gap-4 items-center">
                            <div class="text-[10px] text-gray-400 text-center py-10">No Items Selected</div>
                        </div>
                    </div>
                    
                    <p class="text-xs text-gray-500 mt-6 max-w-md text-center">
                        <i class="fas fa-info-circle mr-1"></i> When printing, make sure to set <strong>Margins to "None"</strong> and disable headers/footers in your browser's print dialog.
                    </p>
                </div>
            </div>
        </div>
    `;

    const catSelect = document.getElementById('labelCategorySelect');
    Object.keys(collectionConfigs).forEach(cat => {
        catSelect.innerHTML += `<option value="${cat}">${collectionConfigs[cat].displayName || cat}</option>`;
    });
}

window.updateLabelItemDropdown = () => {
    const cat = document.getElementById('labelCategorySelect').value;
    const itemList = document.getElementById('labelItemList');
    const selectAllCb = document.getElementById('selectAllLabelItemsCb');
    const fieldsContainer = document.getElementById('labelFieldsContainer');
    
    currentLabelCategory = cat;
    currentLabelItems = [];
    document.getElementById('selectedLabelCount').textContent = `0 selected`;
    updateLabelPreview(); 

    if (!cat) {
        itemList.innerHTML = '<p class="text-sm text-gray-500 text-center py-2">Select category first</p>';
        selectAllCb.disabled = true;
        selectAllCb.checked = false;
        fieldsContainer.innerHTML = '<p class="text-sm text-gray-500 text-center">Select category first</p>';
        return;
    }

    const items = allData[cat] || [];
    const config = collectionConfigs[cat];

    selectAllCb.disabled = false;
    selectAllCb.checked = false;
    
    if (items.length === 0) {
        itemList.innerHTML = '<p class="text-sm text-gray-500 text-center py-2">No items found</p>';
    } else {
        itemList.innerHTML = items.map(item => {
            const name = item[config.nameField] || 'Unnamed';
            const serial = item[config.serialField] || item._id;
            return `
                <label class="flex items-center space-x-2 cursor-pointer p-1.5 hover:bg-white dark:hover:bg-gray-600 rounded border border-transparent hover:border-gray-200 dark:hover:border-gray-500">
                    <input type="checkbox" class="label-item-cb rounded text-indigo-600 focus:ring-indigo-500" value="${item.id}" onchange="toggleLabelItem('${item.id}', this.checked)">
                    <span class="text-sm text-gray-700 dark:text-gray-300 truncate w-full" title="${name} (${serial})">${name} <span class="text-xs text-gray-500">(${serial})</span></span>
                </label>
            `;
        }).join('');
    }

    fieldsContainer.innerHTML = '';
    config.formFields.forEach(field => {
        const isChecked = field === config.nameField || field === config.serialField ? 'checked' : '';
        fieldsContainer.innerHTML += `
            <label class="flex items-center space-x-2 cursor-pointer p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                <input type="checkbox" class="label-field-cb rounded text-indigo-600 focus:ring-indigo-500" value="${field}" ${isChecked} onchange="updateLabelPreview()">
                <span class="text-sm text-gray-700 dark:text-gray-300 truncate">${field}</span>
            </label>
        `;
    });
};

window.toggleLabelItem = (id, isChecked) => {
    if (isChecked) {
        if (!currentLabelItems.includes(id)) currentLabelItems.push(id);
    } else {
        currentLabelItems = currentLabelItems.filter(i => i !== id);
        document.getElementById('selectAllLabelItemsCb').checked = false;
    }
    document.getElementById('selectedLabelCount').textContent = `${currentLabelItems.length} selected`;
    updateLabelPreview();
};

window.toggleAllLabelItems = (isChecked) => {
    const checkboxes = document.querySelectorAll('.label-item-cb');
    currentLabelItems = [];
    checkboxes.forEach(cb => {
        cb.checked = isChecked;
        if (isChecked) currentLabelItems.push(cb.value);
    });
    document.getElementById('selectedLabelCount').textContent = `${currentLabelItems.length} selected`;
    updateLabelPreview();
};

function generateLabelHTML(item, isSplit, canvasId) {
    if (!item) return `<div class="w-full ${isSplit ? 'h-1/2' : 'h-full'}"></div>`; 

    const checkedFields = Array.from(document.querySelectorAll('.label-field-cb:checked')).map(cb => cb.value);
    let textHtml = '';
    
    let fontSizeClass = isSplit ? 'text-[6pt] leading-[7pt]' : 'text-[7pt] leading-[8pt]';
    if(checkedFields.length <= 2) fontSizeClass = isSplit ? 'text-[8pt] leading-[9pt] font-bold' : 'text-[10pt] leading-[11pt] font-bold';
    else if(checkedFields.length <= 4) fontSizeClass = isSplit ? 'text-[7pt] leading-[8pt]' : 'text-[8pt] leading-[9pt]';

    checkedFields.forEach((field, index) => {
        const val = item[field] || '-';
        const extraClass = index === 0 ? 'font-bold' : '';
        textHtml += `<div class="${fontSizeClass} ${extraClass} truncate text-black font-sans" style="max-width: 100%;">${val}</div>`;
    });

    const config = collectionConfigs[currentLabelCategory];
    const serial = item[config.serialField] || item._id;

    return `
        <div class="w-full flex p-1 box-border ${isSplit ? 'h-1/2' : 'h-full'}">
            <div class="h-full flex flex-col items-center justify-center pr-1 shrink-0" style="width: 35%;">
                <canvas data-serial="${serial}" class="qr-render-target max-w-full max-h-full"></canvas>
            </div>
            <div class="h-full w-full pl-1 flex flex-col justify-center overflow-hidden border-l border-gray-300">
                ${textHtml}
            </div>
        </div>
    `;
}

window.updateLabelPreview = () => {
    const printArea = document.getElementById('print-area');
    
    const w = document.getElementById('labelWidth').value || 50;
    const h = document.getElementById('labelHeight').value || 30;
    const isSplit = document.getElementById('labelSplitMode').checked;

    if (currentLabelItems.length === 0) {
        printArea.innerHTML = '<div class="text-[10px] text-gray-400 text-center py-10">No Items Selected</div>';
        return;
    }

    let previewHtml = '';
    const itemsData = currentLabelItems.map(id => allData[currentLabelCategory].find(i => i.id === id)).filter(Boolean);

    if (isSplit) {
        for (let i = 0; i < itemsData.length; i += 2) {
            const item1 = itemsData[i];
            const item2 = itemsData[i+1]; 
            
            previewHtml += `
                <div class="label-page preview-border relative box-border bg-white text-black flex flex-col overflow-hidden" style="width: ${w}mm; height: ${h}mm; border: 1px solid #ccc; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    ${generateLabelHTML(item1, true)}
                    ${item2 ? `<div style="border-top: 1px dashed #999; width: 100%;"></div>` : ''}
                    ${generateLabelHTML(item2, true)}
                </div>
            `;
        }
    } else {
        itemsData.forEach(item => {
            previewHtml += `
                <div class="label-page preview-border relative box-border bg-white text-black flex overflow-hidden" style="width: ${w}mm; height: ${h}mm; border: 1px solid #ccc; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    ${generateLabelHTML(item, false)}
                </div>
            `;
        });
    }

    printArea.innerHTML = previewHtml;

    const canvases = printArea.querySelectorAll('.qr-render-target');
    canvases.forEach(canvas => {
        const serial = canvas.dataset.serial;
        const qrUrl = `${window.location.origin.replace(/\/$/, '')}/details.html?sn=${serial}`;
        QRCode.toCanvas(canvas, qrUrl, { width: 256, margin: 0, color: { dark: '#000000', light: '#ffffff' } });
    });
};

window.printLabel = () => {
    if (currentLabelItems.length === 0) {
        showNotificationModal('warning', 'No Items Selected', 'Please select at least one item to print.');
        return;
    }

    const w = document.getElementById('labelWidth').value || 50;
    const h = document.getElementById('labelHeight').value || 30;
    
    let dynamicStyle = document.getElementById('dynamic-print-style');
    if (!dynamicStyle) {
        dynamicStyle = document.createElement('style');
        dynamicStyle.id = 'dynamic-print-style';
        document.head.appendChild(dynamicStyle);
    }
    dynamicStyle.innerHTML = `@media print { @page { size: ${w}mm ${h}mm; margin: 0mm; } }`;

    window.print();
};

// ==========================================
// --- EXPORTS ---
// ==========================================
window.loadPage = loadPage; 
window.logout = logout; 
window.updateDashboard = updateDashboard; 
window.openAddMenuModal = openAddMenuModal; 
window.openEditMenuModal = openEditMenuModal;
window.saveCustomMenu = saveCustomMenu; 
window.deleteCustomMenu = deleteCustomMenu;
window.openModal = openModal;
window.hideModal = hideModal;
window.saveData = saveData;
window.deleteItem = deleteItem;
window.showQrModal = showQrModal;
window.openImportModal = openImportModal;
window.processCsvImport = processCsvImport;
window.downloadCsvTemplate = downloadCsvTemplate;
window.addMaintenanceLog = addMaintenanceLog;
window.switchModalTab = (tab, btn) => {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(tab+'-tab').classList.add('active');
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
};
window.changeRowsPerPage = (col, el) => { paginationState[col].rowsPerPage = parseInt(el.value); paginationState[col].currentPage=1; buildTable(col); };
window.changePage = (col, dir) => { paginationState[col].currentPage += dir; buildTable(col); };
window.handleSearch = (col, val) => { paginationState[col].filterText = val; paginationState[col].currentPage=1; buildTable(col); };
window.handleStatusFilter = (col, val) => { paginationState[col].statusFilter = val; paginationState[col].currentPage=1; buildTable(col); };
window.filterLoanHistory = (val) => { const term=val.toUpperCase(); document.querySelectorAll('#LoanHistoryContainer > div').forEach(el => el.style.display = el.textContent.toUpperCase().includes(term)?'':'none'); };
window.filterMaintenanceHistory = (val) => { const term=val.toUpperCase(); document.querySelectorAll('#MaintenanceContainer > div').forEach(el => el.style.display = el.textContent.toUpperCase().includes(term)?'':'none'); };
window.filterAssetsByUser = (val) => { const term=val.toUpperCase(); document.querySelectorAll('#AssetsByUserContainer > details').forEach(el => el.style.display = el.textContent.toUpperCase().includes(term)?'':'none'); };
window.switchHandoverTab = (tab, btn) => {
    document.getElementById('handover-tab-content').style.display = tab==='handover'?'block':'none';
    document.getElementById('return-tab-content').style.display = tab==='return'?'block':'none';
    document.querySelectorAll('#handover-tabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
};
window.openStaffModal = openStaffModal; 
window.saveStaffChanges = saveStaffChanges; 
window.deleteStaff = deleteStaff;
window.openAddUserModal = openAddUserModal;
window.deleteAdmin = deleteAdmin;
// Exports for Bulk Management
window.toggleSelectAll = toggleSelectAll;
window.toggleSelectItem = toggleSelectItem;
window.bulkDelete = bulkDelete;
window.openBulkEditModal = openBulkEditModal;
window.saveBulkEdit = saveBulkEdit;
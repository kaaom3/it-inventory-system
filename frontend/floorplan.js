/**
 * ============================================================================
 * 🗺️ Interactive Floor Plan Module (Interactive Device Map) - v2.1
 * - Supports Hierarchical & Nested Categories / Sub-menus with automatic device aggregation
 * - Mathematical Auto-Fit to Viewport (Zero overflow, pixel-perfect aspect ratio)
 * - Smooth Pan & Zoom (Mouse drag, wheel zoom, touch pinch)
 * - Category isolation mode: only shows devices of the selected category
 * - Drag and Drop devices from left tray onto map
 * - Click pin to view details, move, or unpin
 * ============================================================================
 */

class FloorPlanManager {
    constructor() {
        this.container = null;
        this.mapImg = null;
        this.mapViewport = null;
        this.mapCanvas = null;
        this.pinsContainer = null;
        
        this.selectedCategory = 'Computers';
        this.filterMode = 'all'; // 'all', 'unpinned', 'pinned'
        this.searchQuery = '';
        this.isolateCategory = true;
        
        // Pan & Zoom State
        this.scale = 1.0;
        this.panX = 0;
        this.panY = 0;
        this.isPanning = false;
        this.startX = 0;
        this.startY = 0;

        // Active Pin Popover
        this.activePopover = null;
        this.initialized = false;

        // Aspect ratio of map.webp (6719 x 7610 px)
        this.aspectRatio = 6719 / 7610; 
    }

    async init() {
        this.container = document.getElementById('floorplan-page');
        if (!this.container) return;
        
        if (!this.initialized) {
            this.renderLayout();
            this.bindEvents();
            this.initialized = true;
        }

        await this.ensureDataLoaded();
        this.populateCategories();
        this.renderDeviceCards();
        this.renderPins();
        
        // Fit map nicely to the container
        requestAnimationFrame(() => this.fitToScreen());
    }

    renderLayout() {
        this.container.className = 'page-content h-[calc(100vh-4.5rem)] flex flex-col p-2 md:p-4 overflow-hidden select-none';
        this.container.innerHTML = `
            <!-- Top Controls Toolbar -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 mb-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg shadow-inner">
                        <i class="fas fa-map-marked-alt"></i>
                    </div>
                    <div>
                        <h2 class="text-base md:text-lg font-bold text-gray-800 dark:text-white flex items-center">
                            แผนผังพัสดุ & อุปกรณ์
                            <span id="fp-cat-badge" class="ml-2 px-2.5 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-full font-semibold max-w-[200px] truncate">
                                Computers
                            </span>
                        </h2>
                        <p class="text-xs text-gray-500 dark:text-gray-400">ลากอุปกรณ์จากฝั่งซ้ายมาวางบนตำแหน่งที่ตั้งในแผนผังได้ทันที</p>
                    </div>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                    <!-- Isolation Toggle -->
                    <label class="flex items-center space-x-2 text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                        <input type="checkbox" id="fp-isolate-toggle" checked class="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5">
                        <span class="font-medium">👁️ ซ่อนหมวดอื่น (แสดงเฉพาะหมวดที่เลือก)</span>
                    </label>

                    <!-- Zoom Controls -->
                    <div class="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-1 space-x-1 border border-gray-200 dark:border-gray-600">
                        <button id="fp-zoom-out" class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 shadow-sm transition" title="ซูมออก">
                            <i class="fas fa-search-minus text-xs"></i>
                        </button>
                        <span id="fp-zoom-level" class="text-xs font-bold text-gray-700 dark:text-gray-300 px-2 min-w-[45px] text-center">100%</span>
                        <button id="fp-zoom-in" class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 shadow-sm transition" title="ซูมเข้า">
                            <i class="fas fa-search-plus text-xs"></i>
                        </button>
                        <button id="fp-zoom-fit" class="px-2.5 h-7 rounded-lg flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 shadow-sm transition" title="พอดีหน้าจอ">
                            <i class="fas fa-compress-arrows-alt mr-1 text-indigo-500"></i> พอดีจอ
                        </button>
                    </div>

                    <!-- Toggle Sidebar Visibility on small screens -->
                    <button id="fp-toggle-tray" class="md:hidden px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm">
                        <i class="fas fa-list mr-1"></i> รายการอุปกรณ์
                    </button>
                </div>
            </div>

            <!-- Main Work Area: Left Sidebar + Center Map -->
            <div class="flex-1 flex overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm relative">
                
                <!-- Left Panel: Category Tray & Device List -->
                <div id="fp-tray" class="w-80 md:w-88 border-r border-gray-100 dark:border-gray-700 flex flex-col bg-gray-50/50 dark:bg-gray-900/50 shrink-0 h-full z-10 transition-transform duration-300">
                    
                    <!-- Category Selector Header -->
                    <div class="p-3 border-b border-gray-200/80 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex justify-between items-center">
                            <span>หมวดหมู่อุปกรณ์ & เมนูย่อย</span>
                            <span id="fp-total-cat-count" class="text-indigo-600 font-bold">0 รายการ</span>
                        </label>
                        <select id="fp-cat-select" class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-medium text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer shadow-sm">
                            <!-- Populated with optgroups dynamically -->
                        </select>
                    </div>

                    <!-- Search & Filter Options -->
                    <div class="p-3 border-b border-gray-200/80 dark:border-gray-700 space-y-2">
                        <div class="relative">
                            <i class="fas fa-search absolute left-3 top-2.5 text-xs text-gray-400"></i>
                            <input type="text" id="fp-search" placeholder="ค้นหาชื่อ, SN, หรือ IP..." class="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/40 text-gray-800 dark:text-white">
                        </div>
                        
                        <!-- Filter Chips -->
                        <div class="flex rounded-lg bg-gray-200/70 dark:bg-gray-800 p-0.5 text-[11px] font-medium">
                            <button class="fp-filter-btn flex-1 py-1 rounded-md text-center transition bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm" data-filter="all">ทั้งหมด</button>
                            <button class="fp-filter-btn flex-1 py-1 rounded-md text-center transition text-gray-600 dark:text-gray-400 hover:text-gray-900" data-filter="unpinned">⚪ ยังไม่วาง</button>
                            <button class="fp-filter-btn flex-1 py-1 rounded-md text-center transition text-gray-600 dark:text-gray-400 hover:text-gray-900" data-filter="pinned">📍 วางแล้ว</button>
                        </div>
                    </div>

                    <!-- Device Card List -->
                    <div id="fp-device-list" class="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
                        <!-- Devices injected here -->
                    </div>

                    <!-- Tray Footer Stats -->
                    <div id="fp-tray-stats" class="p-2.5 border-t border-gray-200/80 dark:border-gray-700 bg-white dark:bg-gray-800 text-[11px] text-gray-500 dark:text-gray-400 flex justify-between items-center px-4">
                        <span>โหลดอุปกรณ์...</span>
                    </div>
                </div>

                <!-- Center Map Viewport (Zero Overflow) -->
                <div id="fp-viewport" class="flex-1 relative overflow-hidden bg-gray-950 flex items-center justify-center p-4">
                    
                    <!-- Map Canvas & Pins Container (Scaled & Aspect-Ratio fitted) -->
                    <div id="fp-canvas" class="relative shadow-2xl rounded-xl overflow-hidden origin-center transition-transform duration-75 ease-out" style="width: 500px; height: 566px; transform: translate(0px, 0px) scale(1);">
                        <img id="fp-map-img" src="map.webp" alt="Floor Plan" class="w-full h-full object-fill block select-none pointer-events-none">
                        
                        <!-- Pins Overlay Layer (Exact 100% overlay matching the image) -->
                        <div id="fp-pins-layer" class="absolute inset-0 pointer-events-auto">
                            <!-- Pins rendered dynamically -->
                        </div>
                    </div>

                    <!-- Floating Mini-HUD Hint -->
                    <div class="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md text-white text-[11px] px-3.5 py-1.5 rounded-full shadow-lg pointer-events-none flex items-center space-x-2 border border-white/10 z-10">
                        <i class="fas fa-hand-pointer text-indigo-400"></i>
                        <span>คลิกลากเพื่อเลื่อนแผนผัง | สกอร์ลเมาส์เพื่อซูม</span>
                    </div>

                </div>

            </div>
        `;

        this.mapViewport = document.getElementById('fp-viewport');
        this.mapCanvas = document.getElementById('fp-canvas');
        this.mapImg = document.getElementById('fp-map-img');
        this.pinsContainer = document.getElementById('fp-pins-layer');

        this.mapImg.onload = () => {
            this.fitToScreen();
        };
    }

    bindEvents() {
        const catSelect = document.getElementById('fp-cat-select');
        const isolateToggle = document.getElementById('fp-isolate-toggle');
        const searchInput = document.getElementById('fp-search');
        const zoomIn = document.getElementById('fp-zoom-in');
        const zoomOut = document.getElementById('fp-zoom-out');
        const zoomFit = document.getElementById('fp-zoom-fit');

        // Category Select
        catSelect.addEventListener('change', (e) => {
            this.selectedCategory = e.target.value;
            const selectedText = catSelect.options[catSelect.selectedIndex]?.text.split('(')[0].trim() || this.selectedCategory;
            document.getElementById('fp-cat-badge').innerText = selectedText;
            this.renderDeviceCards();
            this.renderPins();
        });

        // Isolation Toggle
        isolateToggle.addEventListener('change', (e) => {
            this.isolateCategory = e.target.checked;
            this.renderPins();
        });

        // Search Input
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase().trim();
            this.renderDeviceCards();
        });

        // Filter Tabs
        document.querySelectorAll('.fp-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.fp-filter-btn').forEach(b => {
                    b.className = 'fp-filter-btn flex-1 py-1 rounded-md text-center transition text-gray-600 dark:text-gray-400 hover:text-gray-900';
                });
                btn.className = 'fp-filter-btn flex-1 py-1 rounded-md text-center transition bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm';
                this.filterMode = btn.dataset.filter;
                this.renderDeviceCards();
            });
        });

        // Zoom Controls
        zoomIn.addEventListener('click', () => this.adjustZoom(0.25));
        zoomOut.addEventListener('click', () => this.adjustZoom(-0.25));
        zoomFit.addEventListener('click', () => this.fitToScreen());

        // Mouse Pan & Dragging
        this.mapViewport.addEventListener('mousedown', (e) => {
            if (e.target.closest('.fp-pin') || e.target.closest('.fp-popover')) return;
            this.isPanning = true;
            this.startX = e.clientX - this.panX;
            this.startY = e.clientY - this.panY;
            this.mapViewport.classList.add('cursor-grabbing');
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isPanning) return;
            this.panX = e.clientX - this.startX;
            this.panY = e.clientY - this.startY;
            this.updateTransform();
        });

        window.addEventListener('mouseup', () => {
            this.isPanning = false;
            this.mapViewport?.classList.remove('cursor-grabbing');
        });

        // Wheel Zoom
        this.mapViewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY < 0 ? 0.15 : -0.15;
            this.adjustZoom(delta);
        }, { passive: false });

        // Window resize keeps map fitted
        window.addEventListener('resize', () => {
            if (this.container?.classList.contains('active')) {
                this.fitToScreen();
            }
        });

        // Drag & Drop from Left Tray onto Map
        this.pinsContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        this.pinsContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            const deviceDataStr = e.dataTransfer.getData('application/json');
            if (!deviceDataStr) return;

            try {
                const device = JSON.parse(deviceDataStr);
                const rect = this.pinsContainer.getBoundingClientRect();

                // Calculate relative percentage (0% to 100%)
                const rawX = ((e.clientX - rect.left) / rect.width) * 100;
                const rawY = ((e.clientY - rect.top) / rect.height) * 100;

                const xPercent = Math.max(0, Math.min(100, rawX));
                const yPercent = Math.max(0, Math.min(100, rawY));

                const targetCollection = device.collectionName || this.selectedCategory;
                this.savePinLocation(device._id, targetCollection, xPercent, yPercent);
            } catch (err) {
                console.error("Drop error:", err);
            }
        });

        // Close Popovers on clicking outside
        this.mapViewport.addEventListener('click', (e) => {
            if (!e.target.closest('.fp-pin') && !e.target.closest('.fp-popover')) {
                this.closePopover();
            }
        });
    }

    // ------------------------------------------------------------------------
    // 🔍 Data & Categories (Hierarchical & Nested Categories Support)
    // ------------------------------------------------------------------------
    async ensureDataLoaded() {
        if (!window.allData || Object.keys(window.allData).length === 0) {
            try {
                const token = localStorage.getItem('authToken');
                const res = await fetch('/api/inventory/all', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    window.allData = await res.json();
                }
            } catch (err) {
                console.warn("Failed to fetch all data:", err);
            }
        }
    }

    populateCategories() {
        const select = document.getElementById('fp-cat-select');
        if (!select || !window.allData) return;

        const customMenus = window.allData.CustomMenus || [];
        const coreCategories = ['Computers', 'Monitors', 'Printers', 'Network'];

        let html = '';
        let totalCount = 0;

        // 1. Core Categories Group
        html += `<optgroup label="💻 หมวดหมู่อุปกรณ์หลัก (Core)">`;
        coreCategories.forEach(col => {
            const count = (window.allData[col] || []).length;
            totalCount += count;
            const config = (window.collectionConfigs && window.collectionConfigs[col]) || {};
            const label = config.displayName || col;
            html += `<option value="${col}">${label} (${count} เครื่อง)</option>`;
        });
        html += `</optgroup>`;

        // 2. Custom Categories & Nested Sub-menus
        // Find top-level parent menus
        const parentMenus = customMenus.filter(m => !m.parentId);
        const subMenus = customMenus.filter(m => !!m.parentId);

        parentMenus.forEach(parent => {
            // Check if this parent has sub-menus
            const children = subMenus.filter(s => s.parentId === parent.name);
            
            if (children.length > 0) {
                html += `<optgroup label="📁 ${parent.displayName || parent.name}">`;
                
                // Allow selecting the parent folder directly (aggregates all children)
                const parentTotal = children.reduce((sum, c) => sum + (window.allData[c.name] || []).length, 0);
                html += `<option value="${parent.name}" class="font-bold">✨ ทั้งหมดใน ${parent.displayName || parent.name} (${parentTotal} เครื่อง)</option>`;
                
                // Add individual sub-menus
                children.forEach(child => {
                    const count = (window.allData[child.name] || []).length;
                    totalCount += count;
                    html += `<option value="${child.name}">&nbsp;&nbsp;└─ ${child.displayName || child.name} (${count} เครื่อง)</option>`;
                });
                html += `</optgroup>`;
            } else {
                // Standalone category without children
                const count = (window.allData[parent.name] || []).length;
                totalCount += count;
                html += `<option value="${parent.name}">📁 ${parent.displayName || parent.name} (${count} เครื่อง)</option>`;
            }
        });

        // Any other collections in allData that aren't excluded
        const skip = ['Staff', 'CustomMenus', 'TransactionHistory', 'LoanHistory', 'Maintenance Log', 'Maintenance', 'admins', 'Software', 'Accessory', ...coreCategories, ...customMenus.map(m => m.name)];
        const extras = Object.keys(window.allData).filter(k => !skip.includes(k) && Array.isArray(window.allData[k]));
        if (extras.length > 0) {
            html += `<optgroup label="📦 หมวดหมู่อื่นๆ">`;
            extras.forEach(col => {
                const count = window.allData[col].length;
                html += `<option value="${col}">${col} (${count} เครื่อง)</option>`;
            });
            html += `</optgroup>`;
        }

        select.innerHTML = html;
        document.getElementById('fp-total-cat-count').innerText = `${totalCount} เครื่อง`;

        if (select.value) {
            this.selectedCategory = select.value;
            const selectedText = select.options[select.selectedIndex]?.text.split('(')[0].trim() || this.selectedCategory;
            document.getElementById('fp-cat-badge').innerText = selectedText;
        }
    }

    // Helper to get devices taking into account parent menu aggregation
    
    // Helper to get prominent machine name / device title
    getDeviceDisplayName(d) {
        if (!d) return 'อุปกรณ์';
        
        // 1. ComputerName (for PC, Laptop, POS, Server)
        if (d.ComputerName && typeof d.ComputerName === 'string' && d.ComputerName.trim() !== '') {
            return d.ComputerName.trim();
        }

        // 2. Name (capital N, for Printers and custom categories)
        if (d.Name && typeof d.Name === 'string' && d.Name.trim() !== '') {
            return d.Name.trim();
        }

        // 3. ItemName (for Scanner, Camera, Storage, Switch, UPS, Amplifier)
        if (d.ItemName && typeof d.ItemName === 'string' && d.ItemName.trim() !== '') {
            return d.ItemName.trim();
        }

        // 4. DeviceName (for Network, CCTV, etc.)
        if (d.DeviceName && typeof d.DeviceName === 'string' && d.DeviceName.trim() !== '') {
            return d.DeviceName.trim();
        }

        // 5. PartName / SoftwareName
        if (d.PartName && typeof d.PartName === 'string' && d.PartName.trim() !== '') {
            return d.PartName.trim();
        }

        // 6. Model + Manufacturer
        if (d.Model && typeof d.Model === 'string' && d.Model.trim() !== '') {
            const brand = (d.Manufacturer && typeof d.Manufacturer === 'string' && d.Manufacturer.trim()) ? d.Manufacturer.trim() + ' ' : '';
            return (brand + d.Model.trim()).trim();
        }

        // 7. SerialNumber fallback
        if (d.SerialNumber && typeof d.SerialNumber === 'string' && d.SerialNumber.trim() !== '') {
            return d.SerialNumber.trim();
        }

        if (d.MonitorSerial && typeof d.MonitorSerial === 'string' && d.MonitorSerial.trim() !== '') {
            return d.MonitorSerial.trim();
        }

        return 'ไม่ระบุชื่อ';
    }

    getDeviceSecondaryInfo(d) {
        if (!d) return '';
        const parts = [];
        if (d.Manufacturer && d.Manufacturer.trim()) parts.push(d.Manufacturer.trim());
        if (d.Model && d.Model.trim()) parts.push(d.Model.trim());
        return parts.join(' ');
    }

    getDevicesForCategory(catName) {
        if (!window.allData) return [];

        // 1. Direct items check:
        const directItems = window.allData[catName];
        if (Array.isArray(directItems) && directItems.length > 0) {
            return directItems.map(d => ({ ...d, _collectionName: catName }));
        }

        // 2. If it's a parent menu with children sub-menus:
        const customMenus = window.allData.CustomMenus || [];
        const children = customMenus.filter(m => m.parentId === catName);
        if (children.length > 0) {
            let aggregated = [];
            children.forEach(child => {
                const childItems = window.allData[child.name] || [];
                if (Array.isArray(childItems)) {
                    aggregated.push(...childItems.map(d => ({
                        ...d,
                        _collectionName: child.name,
                        _subCategoryName: child.displayName || child.name
                    })));
                }
            });
            return aggregated;
        }

        return Array.isArray(directItems) ? directItems.map(d => ({ ...d, _collectionName: catName })) : [];
    }

    renderDeviceCards() {
        const listContainer = document.getElementById('fp-device-list');
        const statsEl = document.getElementById('fp-tray-stats');
        if (!listContainer) return;

        const rawDevices = this.getDevicesForCategory(this.selectedCategory);

        // Filter by search query and placement status
        let devices = rawDevices.filter(d => {
            const name = (d.ItemName || d.Model || d.ComputerName || d.DeviceName || d.name || '').toLowerCase();
            const sn = (d.SerialNumber || d.MonitorSerial || '').toLowerCase();
            const ip = (d.IPAddress || '').toLowerCase();
            const matchesSearch = !this.searchQuery || name.includes(this.searchQuery) || sn.includes(this.searchQuery) || ip.includes(this.searchQuery);

            const isPinned = !!(d.mapLocation && typeof d.mapLocation.x === 'number');
            if (this.filterMode === 'pinned') return matchesSearch && isPinned;
            if (this.filterMode === 'unpinned') return matchesSearch && !isPinned;
            return matchesSearch;
        });

        // Update stats
        const total = rawDevices.length;
        const pinnedCount = rawDevices.filter(d => d.mapLocation && typeof d.mapLocation.x === 'number').length;
        const unpinnedCount = total - pinnedCount;
        if (statsEl) {
            statsEl.innerHTML = `<span>หมวดนี้: <strong>${total}</strong> เครื่อง</span><span>วางแล้ว: <strong>${pinnedCount}</strong> | ว่าง: <strong>${unpinnedCount}</strong></span>`;
        }

        if (devices.length === 0) {
            listContainer.innerHTML = '<div class="text-center text-gray-400 py-10 text-xs italic">ไม่พบอุปกรณ์ที่ตรงตามเงื่อนไข</div>';
            return;
        }

        listContainer.innerHTML = devices.map(d => {
            const isPinned = !!(d.mapLocation && typeof d.mapLocation.x === 'number');
            const primaryName = this.getDeviceDisplayName(d);
            const secondarySpec = this.getDeviceSecondaryInfo(d);
            const sn = d.SerialNumber || d.MonitorSerial || '-';
            const ip = d.IPAddress || '';
            const location = d.Location || '';
            const assigned = d.AssignedComputer || '';
            const user = d.UserName || d.CurrentUser || '';
            const status = d.Status || 'In Storage';
            const colName = d._collectionName || this.selectedCategory;
            const subBadge = d._subCategoryName ? `<span class="text-[9.5px] px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold rounded border border-indigo-200/50">${d._subCategoryName}</span>` : '';

            let statusColor = 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
            if (status.includes('Use') || status.includes('Active') || status.includes('Loan')) statusColor = 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
            else if (status.includes('Repair') || status.includes('Issue') || status.includes('Damaged')) statusColor = 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';

            // Choose icon
            let categoryIcon = 'fa-laptop';
            if (colName.includes('Printer')) categoryIcon = 'fa-print';
            else if (colName.includes('Monitor')) categoryIcon = 'fa-desktop';
            else if (colName.includes('Network') || colName.includes('Switch')) categoryIcon = 'fa-network-wired';
            else if (colName.includes('POS')) categoryIcon = 'fa-cash-register';
            else if (colName.includes('Camera')) categoryIcon = 'fa-video';
            else if (colName.includes('Scanner')) categoryIcon = 'fa-barcode';
            else if (colName.includes('Storage')) categoryIcon = 'fa-server';

            const payload = JSON.stringify({
                _id: d._id,
                collectionName: colName,
                name: primaryName,
                sn: sn
            });

            return `
                <div class="fp-card bg-white dark:bg-gray-800 p-3 rounded-2xl border ${isPinned ? 'border-gray-200 dark:border-gray-700' : 'border-indigo-300 dark:border-indigo-700/80 shadow-sm'} transition-all hover:shadow-md relative group cursor-grab active:cursor-grabbing"
                     draggable="${!isPinned}"
                     data-device='${payload.replace(/'/g, "&apos;")}'>
                    
                    <!-- Header: Status + Action -->
                    <div class="flex justify-between items-center mb-1.5">
                        <div class="flex items-center space-x-1">
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor}">${status}</span>
                            ${subBadge}
                        </div>
                        ${isPinned 
                            ? `<button class="fp-locate-btn text-[11px] text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-bold flex items-center bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md" data-id="${d._id}"><i class="fas fa-crosshairs mr-1"></i>หาจุด</button>`
                            : `<span class="text-[10.5px] text-indigo-600 dark:text-indigo-300 font-bold flex items-center bg-indigo-50 dark:bg-indigo-900/50 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-700"><i class="fas fa-grip-vertical mr-1 text-indigo-400"></i>ลากไปวาง</span>`
                        }
                    </div>

                    <!-- MACHINE NAME (Prominent, Bold, Clear) -->
                    <div class="flex items-center space-x-1.5 mb-0.5">
                        <i class="fas ${categoryIcon} text-indigo-600 dark:text-indigo-400 text-xs shrink-0"></i>
                        <h4 class="font-extrabold text-[13.5px] text-gray-900 dark:text-white truncate tracking-wide" title="${primaryName}">
                            ${primaryName}
                        </h4>
                    </div>

                    <!-- Model / Spec Subtitle -->
                    ${secondarySpec && secondarySpec !== primaryName ? `<div class="text-[11px] text-gray-600 dark:text-gray-300 font-medium truncate mb-1 pl-4">${secondarySpec}</div>` : ''}

                    <!-- Details Grid -->
                    <div class="space-y-0.5 text-[10.5px] text-gray-500 dark:text-gray-400 pt-1.5 mt-1 border-t border-gray-100 dark:border-gray-700/60">
                        <div class="flex justify-between">
                            <span class="font-mono text-gray-400">SN:</span>
                            <span class="font-mono text-gray-700 dark:text-gray-300 font-medium truncate ml-1">${sn}</span>
                        </div>
                        ${ip ? `
                        <div class="flex justify-between">
                            <span class="text-gray-400">IP:</span>
                            <span class="font-mono text-blue-600 dark:text-blue-400 font-semibold truncate ml-1">${ip}</span>
                        </div>` : ''}
                        ${assigned ? `
                        <div class="flex justify-between">
                            <span class="text-gray-400">เชื่อมต่อกับ:</span>
                            <span class="font-semibold text-purple-600 dark:text-purple-400 truncate ml-1">💻 ${assigned}</span>
                        </div>` : ''}
                        ${user ? `
                        <div class="flex justify-between">
                            <span class="text-gray-400">ผู้ใช้:</span>
                            <span class="text-gray-700 dark:text-gray-300 truncate ml-1">${user}</span>
                        </div>` : ''}
                        ${location ? `
                        <div class="flex justify-between">
                            <span class="text-gray-400">จุดติดตั้ง:</span>
                            <span class="text-emerald-600 dark:text-emerald-400 font-medium truncate ml-1">📍 ${location}</span>
                        </div>` : ''}
                    </div>

                    ${isPinned ? `
                        <div class="mt-2 pt-1.5 border-t border-gray-100 dark:border-gray-700/60 flex justify-between items-center text-[10px]">
                            <span class="text-green-600 font-semibold"><i class="fas fa-check-circle mr-1"></i>ปักหมุดแล้ว</span>
                            <button class="fp-unpin-btn text-red-500 hover:text-red-700 font-bold" data-id="${d._id}" data-col="${colName}">ถอนหมุด</button>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        // Attach Card Dragstart Listeners
        listContainer.querySelectorAll('.fp-card[draggable="true"]').forEach(card => {
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('application/json', card.dataset.device);
                card.classList.add('opacity-50');
            });
            card.addEventListener('dragend', () => {
                card.classList.remove('opacity-50');
            });
        });

        // Locate pin buttons
        listContainer.querySelectorAll('.fp-locate-btn').forEach(btn => {
            btn.addEventListener('click', () => this.panToDevice(btn.dataset.id));
        });

        // Unpin buttons
        listContainer.querySelectorAll('.fp-unpin-btn').forEach(btn => {
            btn.addEventListener('click', () => this.unpinDevice(btn.dataset.id, btn.dataset.col));
        });
    }

    // ------------------------------------------------------------------------
    // 📍 Pins Rendering & Placement on Map
    // ------------------------------------------------------------------------
    renderPins() {
        if (!this.pinsContainer) return;
        this.pinsContainer.innerHTML = '';

        if (this.isolateCategory) {
            // Render only devices of currently selected category (or its children)
            const devices = this.getDevicesForCategory(this.selectedCategory);
            devices.forEach(d => {
                if (!d.mapLocation || typeof d.mapLocation.x !== 'number') return;
                const pinEl = this.createPinElement(d, d._collectionName || this.selectedCategory);
                this.pinsContainer.appendChild(pinEl);
            });
        } else {
            // Render ALL pinned devices across the entire system
            Object.keys(window.allData || {}).forEach(col => {
                const list = window.allData[col];
                if (!Array.isArray(list)) return;
                list.forEach(d => {
                    if (!d.mapLocation || typeof d.mapLocation.x !== 'number') return;
                    const pinEl = this.createPinElement(d, col);
                    this.pinsContainer.appendChild(pinEl);
                });
            });
        }
    }

    createPinElement(device, collectionName) {
        const pin = document.createElement('div');
        pin.className = 'fp-pin absolute -translate-x-1/2 -translate-y-full cursor-pointer transition-transform hover:scale-125 z-20 group';
        pin.style.left = `${device.mapLocation.x}%`;
        pin.style.top = `${device.mapLocation.y}%`;
        pin.dataset.id = device._id;
        pin.dataset.col = collectionName;

        let iconClass = 'fa-laptop';
        if (collectionName.includes('Printer')) iconClass = 'fa-print';
        else if (collectionName.includes('Monitor')) iconClass = 'fa-desktop';
        else if (collectionName.includes('Network')) iconClass = 'fa-network-wired';
        else if (collectionName.includes('POS')) iconClass = 'fa-cash-register';
        else if (collectionName.includes('Server')) iconClass = 'fa-server';

        const status = device.Status || 'In Storage';
        let colorBg = 'bg-blue-600';
        if (status.includes('Use') || status.includes('Active') || status.includes('Loan')) colorBg = 'bg-green-600';
        else if (status.includes('Repair') || status.includes('Issue') || status.includes('Damaged')) colorBg = 'bg-red-600';

        const deviceName = this.getDeviceDisplayName(device);

        pin.innerHTML = `
            <div class="relative flex items-center justify-center">
                ${device.IPAddress ? `<span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-green-400 opacity-75"></span>` : ''}
                <div class="w-7 h-7 ${colorBg} text-white rounded-full flex items-center justify-center shadow-xl border-2 border-white relative z-10">
                    <i class="fas ${iconClass} text-[11px]"></i>
                </div>
                <div class="w-2.5 h-2.5 ${colorBg} rotate-45 absolute -bottom-1 shadow-md border-r-2 border-b-2 border-white z-0"></div>
            </div>

            <!-- Mini Label Tooltip on Hover -->
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900/90 backdrop-blur-sm text-white text-[10px] px-2.5 py-1 rounded-lg whitespace-nowrap shadow-xl pointer-events-none z-30 border border-white/10">
                ${deviceName} (${device.SerialNumber || device.MonitorSerial || '-'})
            </div>
        `;

        pin.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openPinPopover(device, collectionName, pin);
        });

        return pin;
    }

    openPinPopover(device, collectionName, pinElement) {
        this.closePopover();

        const popover = document.createElement('div');
        popover.className = 'fp-popover absolute bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 w-64 z-40 text-xs animate-fade-in-up';
        
        popover.style.left = `${device.mapLocation.x}%`;
        popover.style.top = `calc(${device.mapLocation.y}% - 35px)`;
        popover.style.transform = 'translate(-50%, -100%)';

        const name = this.getDeviceDisplayName(device);
        const sn = device.SerialNumber || device.MonitorSerial || '-';
        const ip = device.IPAddress || '-';
        const status = device.Status || 'In Storage';
        const user = device.UserName || device.CurrentUser || device.ResponsiblePerson || '-';

        popover.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <span class="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">${collectionName}</span>
                <button class="fp-popover-close text-gray-400 hover:text-gray-600 dark:hover:text-white"><i class="fas fa-times"></i></button>
            </div>
            
            <h3 class="font-bold text-sm text-gray-900 dark:text-white mb-2 leading-tight">${name}</h3>
            
            <div class="space-y-1 text-gray-600 dark:text-gray-300 mb-3 bg-gray-50 dark:bg-gray-700/50 p-2.5 rounded-xl text-[11px]">
                <div><span class="font-semibold text-gray-400">SN:</span> ${sn}</div>
                <div><span class="font-semibold text-gray-400">IP:</span> ${ip}</div>
                <div><span class="font-semibold text-gray-400">สถานะ:</span> <span class="font-bold text-green-600">${status}</span></div>
                <div><span class="font-semibold text-gray-400">ผู้ถือครอง:</span> ${user}</div>
            </div>

            <div class="flex space-x-2">
                <button class="fp-popover-unpin flex-1 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-xl font-bold hover:bg-red-100 transition text-[11px]">
                    <i class="fas fa-trash-alt mr-1"></i> ถอนหมุด
                </button>
                <button class="fp-popover-view flex-1 py-1.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition text-[11px]">
                    <i class="fas fa-edit mr-1"></i> แก้ไข
                </button>
            </div>
        `;

        popover.querySelector('.fp-popover-close').addEventListener('click', () => this.closePopover());
        popover.querySelector('.fp-popover-unpin').addEventListener('click', () => {
            this.unpinDevice(device._id, collectionName);
            this.closePopover();
        });
        popover.querySelector('.fp-popover-view').addEventListener('click', () => {
            if (window.openModal) window.openModal('edit', collectionName, device);
            this.closePopover();
        });

        this.pinsContainer.appendChild(popover);
        this.activePopover = popover;
    }

    closePopover() {
        if (this.activePopover) {
            this.activePopover.remove();
            this.activePopover = null;
        }
    }

    // ------------------------------------------------------------------------
    // 💾 Save / Update / Unpin Operations
    // ------------------------------------------------------------------------
    async savePinLocation(id, col, x, y) {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`/api/inventory/${col}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    mapLocation: { x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) }
                })
            });

            if (!res.ok) throw new Error("Could not save pin location");

            // Update in-memory cache
            if (window.allData && window.allData[col]) {
                const item = window.allData[col].find(d => d._id === id);
                if (item) item.mapLocation = { x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) };
            }

            this.renderDeviceCards();
            this.renderPins();

        } catch (error) {
            alert(`ไม่สามารถบันทึกพิกัดได้: ${error.message}`);
        }
    }

    async unpinDevice(id, col = null) {
        if (!confirm("คุณต้องการถอนหมุดอุปกรณ์ชิ้นนี้ออกจากแผนผังใช่หรือไม่?")) return;

        const targetCol = col || this.selectedCategory;

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`/api/inventory/${targetCol}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ mapLocation: null })
            });

            if (!res.ok) throw new Error("Could not remove pin");

            if (window.allData && window.allData[targetCol]) {
                const item = window.allData[targetCol].find(d => d._id === id);
                if (item) item.mapLocation = null;
            }

            this.renderDeviceCards();
            this.renderPins();

        } catch (error) {
            alert(`ไม่สามารถถอนหมุดได้: ${error.message}`);
        }
    }

    panToDevice(id) {
        const pin = this.pinsContainer?.querySelector(`.fp-pin[data-id="${id}"]`);
        if (!pin) return;

        const leftPct = parseFloat(pin.style.left);
        const topPct = parseFloat(pin.style.top);

        const canvasW = this.mapCanvas.offsetWidth;
        const canvasH = this.mapCanvas.offsetHeight;

        const pinX = (leftPct / 100) * canvasW;
        const pinY = (topPct / 100) * canvasH;

        this.scale = 2.0;
        this.panX = (this.mapViewport.offsetWidth / 2) - (pinX * this.scale);
        this.panY = (this.mapViewport.offsetHeight / 2) - (pinY * this.scale);
        this.updateTransform();

        pin.classList.add('ring-8', 'ring-yellow-400', 'scale-150');
        setTimeout(() => pin.classList.remove('ring-8', 'ring-yellow-400', 'scale-150'), 2000);
    }

    // ------------------------------------------------------------------------
    // 🔎 Pan & Zoom (Mathematical Aspect Ratio Fit, Zero Overflow)
    // ------------------------------------------------------------------------
    fitToScreen() {
        if (!this.mapViewport || !this.mapCanvas) return;
        
        // Exact viewport dimensions minus comfortable margin (32px)
        const vpW = Math.max(100, this.mapViewport.clientWidth - 32);
        const vpH = Math.max(100, this.mapViewport.clientHeight - 32);

        let canvasW, canvasH;
        if ((vpW / vpH) < this.aspectRatio) {
            // Screen is narrower than the map: fit by width
            canvasW = vpW;
            canvasH = vpW / this.aspectRatio;
        } else {
            // Screen is wider/taller: fit by height
            canvasH = vpH;
            canvasW = vpH * this.aspectRatio;
        }

        // Set pixel size of canvas so it fits perfectly on screen at scale=1
        this.mapCanvas.style.width = `${Math.round(canvasW)}px`;
        this.mapCanvas.style.height = `${Math.round(canvasH)}px`;

        this.scale = 1.0;
        this.panX = 0;
        this.panY = 0;
        this.updateTransform();
    }

    adjustZoom(delta) {
        const newScale = Math.min(Math.max(this.scale + delta, 0.4), 4.0);
        this.scale = parseFloat(newScale.toFixed(2));
        this.updateTransform();
    }

    updateTransform() {
        if (!this.mapCanvas) return;
        this.mapCanvas.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
        const zoomEl = document.getElementById('fp-zoom-level');
        if (zoomEl) zoomEl.innerText = `${Math.round(this.scale * 100)}%`;
    }
}

// 🚀 Self-Instantiate
window.floorPlan = new FloorPlanManager();

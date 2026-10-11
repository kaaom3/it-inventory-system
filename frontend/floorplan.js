/**
 * ============================================================================
 * 🗺️ Interactive Floor Plan Module (Interactive Device Map) - v4.0
 * - Immersive Viewport: Full black-area coverage (เต็มพื้นที่สีดำ) + Full Pan & Zoom
 * - Smooth Mouse-Wheel Zoom directly toward cursor position
 * - Mouse Drag Panning & Touch Pinch-to-Zoom
 * - Dynamic Device-Specific Pins: Distinct icon/photo, category color, and machine name tag
 * - Hierarchical & Nested Categories with sub-menu device aggregation
 * - Precision Drag & Drop Pinning regardless of zoom level or pan offset
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
        
        // Pan & Zoom Engine State
        this.scale = 1.0;
        this.panX = 0;
        this.panY = 0;
        this.isPanning = false;
        this.startX = 0;
        this.startY = 0;

        // Touch gestures
        this.touchStartDist = null;
        this.touchStartScale = null;

        // Active Pin Popover
        this.activePopover = null;
        this.initialized = false;
        this.resizeObserver = null;

        // Aspect ratio of map.webp (6719 x 7610 px)
        this.aspectRatio = 6719 / 7610; 
    }

    async init() {
        this.container = document.getElementById('floorplan-page');
        if (!this.container) return;
        
        // Force flex display on the container with !important to override main.js: pageDiv.style.display = 'block'
        this.container.style.setProperty('display', 'flex', 'important');
        this.container.style.setProperty('flex-direction', 'column', 'important');
        const mc = document.getElementById('main-content');
        if (mc) mc.scrollTop = 0;

        if (!this.initialized) {
            this.renderLayout();
            this.bindEvents();
            this.initialized = true;
        }

        await this.ensureDataLoaded();
        this.populateCategories();
        this.renderDeviceCards();
        this.renderPins();
        
        // Default: fill entire black viewport width for an immersive experience
        requestAnimationFrame(() => this.fillWidth());
    }

    renderLayout() {
        this.container.className = 'page-content !flex flex-col h-[calc(100vh-5.5rem)] md:h-[calc(100vh-4.5rem)] p-1 md:p-3 overflow-hidden select-none';
        this.container.style.setProperty('display', 'flex', 'important');
        this.container.style.setProperty('flex-direction', 'column', 'important');
        this.container.innerHTML = `
            <!-- Top Controls Toolbar -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-2.5 md:p-3 mb-2.5 md:mb-3 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
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

                    <!-- Zoom & Pan Controls in Toolbar -->
                    <div class="flex items-center bg-gray-100 dark:bg-gray-700/80 rounded-xl p-1 space-x-1 border border-gray-200 dark:border-gray-600 shadow-sm">
                        <button id="fp-btn-zoom-out" class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 transition" title="ซูมออก">
                            <i class="fas fa-search-minus text-xs"></i>
                        </button>
                        <span class="fp-zoom-level-text text-xs font-bold text-gray-700 dark:text-gray-300 px-2 min-w-[45px] text-center">100%</span>
                        <button id="fp-btn-zoom-in" class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 transition" title="ซูมเข้า">
                            <i class="fas fa-search-plus text-xs"></i>
                        </button>
                        <div class="w-px h-4 bg-gray-300 dark:bg-gray-600 my-auto"></div>
                        <button id="fp-btn-fill" class="px-2.5 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-600 shadow-sm hover:bg-indigo-50 transition" title="ขยายเต็มพื้นที่สีดำ">
                            <i class="fas fa-expand mr-1"></i> เต็มพื้นที่
                        </button>
                        <button id="fp-btn-fit" class="px-2.5 h-7 rounded-lg flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 transition" title="ย่อพอดีหน้าจอ">
                            <i class="fas fa-compress-arrows-alt mr-1"></i> พอดีจอ
                        </button>
                    </div>

                    <!-- Toggle Sidebar Visibility on small screens -->
                    <button id="fp-toggle-tray" class="md:hidden px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm">
                        <i class="fas fa-list mr-1"></i> รายการอุปกรณ์
                    </button>
                </div>
            </div>

            <!-- Main Work Area: Left Sidebar + Center Map -->
            <div class="flex-1 min-h-0 flex overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm relative" style="min-height: 0; flex: 1 1 0%;">
                
                <!-- Left Panel: Category Tray & Device List -->
                <div id="fp-tray" class="w-80 md:w-88 border-r border-gray-100 dark:border-gray-700 flex flex-col min-h-0 h-full bg-gray-50/50 dark:bg-gray-900/50 shrink-0 z-20 transition-transform duration-300" style="min-height: 0; height: 100%;">
                    
                    <!-- Category Selector Header -->
                    <div class="p-3 border-b border-gray-200/80 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
                        <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex justify-between items-center">
                            <span>หมวดหมู่อุปกรณ์ & เมนูย่อย</span>
                            <span id="fp-total-cat-count" class="text-indigo-600 font-bold">0 รายการ</span>
                        </label>
                        <select id="fp-cat-select" class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-medium text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer shadow-sm">
                            <!-- Populated with optgroups dynamically -->
                        </select>
                    </div>

                    <!-- Search & Filter Options -->
                    <div class="p-3 border-b border-gray-200/80 dark:border-gray-700 space-y-2 shrink-0">
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
                    <div id="fp-device-list" class="flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5 custom-scrollbar" style="min-height: 0; flex: 1 1 0%; overflow-y: auto; -webkit-overflow-scrolling: touch;">
                        <!-- Devices injected here -->
                    </div>

                    <!-- Tray Footer Stats -->
                    <div id="fp-tray-stats" class="p-2.5 border-t border-gray-200/80 dark:border-gray-700 bg-white dark:bg-gray-800 text-[11px] text-gray-500 dark:text-gray-400 flex justify-between items-center px-4 shrink-0">
                        <span>โหลดอุปกรณ์...</span>
                    </div>
                </div>

                <!-- Center Map Viewport (Immersive Full Black Area + Pan & Zoom Engine) -->
                <div id="fp-viewport" class="flex-1 relative overflow-hidden bg-slate-950 flex items-center justify-center cursor-grab active:cursor-grabbing select-none">
                    
                    <!-- Map Canvas Container (Transformed via translate & scale from origin 0 0) -->
                    <div id="fp-canvas" class="relative shadow-2xl origin-top-left will-change-transform" style="transform: translate(0px, 0px) scale(1);">
                        <img id="fp-map-img" src="map.webp" alt="Floor Plan" class="w-full h-full object-fill block select-none pointer-events-none">
                        
                        <!-- Pins Overlay Layer (Exact 100% overlay matching the image coordinates) -->
                        <div id="fp-pins-layer" class="absolute inset-0 pointer-events-auto">
                            <!-- Pins rendered dynamically -->
                        </div>
                    </div>

                    <!-- Floating Glassmorphism Controls HUD (Bottom-Right) -->
                    <div class="absolute bottom-4 right-4 flex items-center bg-gray-900/90 backdrop-blur-md rounded-2xl p-1.5 space-x-1.5 shadow-2xl border border-white/10 z-30 select-none">
                        <button id="fp-hud-zoom-out" class="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition" title="ซูมออก">
                            <i class="fas fa-minus text-xs"></i>
                        </button>
                        <span class="fp-zoom-level-text text-xs font-bold text-yellow-300 px-2 min-w-[45px] text-center">100%</span>
                        <button id="fp-hud-zoom-in" class="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition" title="ซูมเข้า">
                            <i class="fas fa-plus text-xs"></i>
                        </button>
                        <div class="w-px h-5 bg-white/20 my-auto"></div>
                        <button id="fp-hud-fill" class="px-3 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center transition shadow-sm" title="เต็มพื้นที่สีดำ">
                            <i class="fas fa-expand mr-1.5"></i> เต็มพื้นที่
                        </button>
                        <button id="fp-hud-fit" class="px-3 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center transition" title="พอดีจอ">
                            <i class="fas fa-compress-arrows-alt mr-1.5"></i> พอดีจอ
                        </button>
                    </div>

                    <!-- Floating Help Tip (Bottom-Left) -->
                    <div class="hidden sm:flex absolute bottom-4 left-4 bg-black/70 backdrop-blur-md text-white text-[11px] px-3.5 py-1.5 rounded-full shadow-lg pointer-events-none items-center space-x-2 border border-white/10 z-10">
                        <i class="fas fa-mouse text-indigo-400"></i>
                        <span>คลิกลากเพื่อเลื่อนผัง | หมุนลูกกลิ้งเมาส์เพื่อซูมเข้า-ออก</span>
                    </div>

                </div>

            </div>
        `;

        this.mapViewport = document.getElementById('fp-viewport');
        this.mapCanvas = document.getElementById('fp-canvas');
        this.mapImg = document.getElementById('fp-map-img');
        this.pinsContainer = document.getElementById('fp-pins-layer');

        this.mapImg.onload = () => {
            this.fillWidth();
        };
    }

    bindEvents() {
        const catSelect = document.getElementById('fp-cat-select');
        const isolateToggle = document.getElementById('fp-isolate-toggle');
        const searchInput = document.getElementById('fp-search');
        const toggleTrayBtn = document.getElementById('fp-toggle-tray');

        // Toolbar Zoom & Fit Buttons
        document.getElementById('fp-btn-zoom-in')?.addEventListener('click', () => this.zoomAtCenter(1.25));
        document.getElementById('fp-btn-zoom-out')?.addEventListener('click', () => this.zoomAtCenter(0.8));
        document.getElementById('fp-btn-fill')?.addEventListener('click', () => this.fillWidth());
        document.getElementById('fp-btn-fit')?.addEventListener('click', () => this.fitScreen());

        // Floating HUD Buttons
        document.getElementById('fp-hud-zoom-in')?.addEventListener('click', () => this.zoomAtCenter(1.25));
        document.getElementById('fp-hud-zoom-out')?.addEventListener('click', () => this.zoomAtCenter(0.8));
        document.getElementById('fp-hud-fill')?.addEventListener('click', () => this.fillWidth());
        document.getElementById('fp-hud-fit')?.addEventListener('click', () => this.fitScreen());

        // Mobile Tray Toggle
        if (toggleTrayBtn) {
            toggleTrayBtn.addEventListener('click', () => {
                const tray = document.getElementById('fp-tray');
                if (tray) {
                    tray.classList.toggle('hidden');
                    tray.classList.toggle('absolute');
                    tray.classList.toggle('inset-y-0');
                    tray.classList.toggle('left-0');
                    tray.classList.toggle('z-50');
                    tray.classList.toggle('shadow-2xl');
                }
            });
        }

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

        // 🖱️ MOUSE PAN & DRAGGING
        this.mapViewport.addEventListener('mousedown', (e) => {
            if (e.target.closest('.fp-pin') || e.target.closest('.fp-popover') || e.target.closest('#fp-hud-zoom-in') || e.target.closest('#fp-hud-zoom-out') || e.target.closest('#fp-hud-fill') || e.target.closest('#fp-hud-fit')) return;
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
            if (this.isPanning) {
                this.isPanning = false;
                this.mapViewport?.classList.remove('cursor-grabbing');
            }
        });

        // 🔄 MOUSE WHEEL ZOOM (Zooms naturally toward the mouse pointer!)
        this.mapViewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            const factor = e.deltaY < 0 ? 1.15 : 0.87;
            this.zoomAtPoint(e.clientX, e.clientY, factor);
        }, { passive: false });

        // 📱 TOUCH PAN & PINCH-TO-ZOOM SUPPORT
        this.mapViewport.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                if (e.target.closest('.fp-pin') || e.target.closest('.fp-popover')) return;
                this.isPanning = true;
                this.startX = e.touches[0].clientX - this.panX;
                this.startY = e.touches[0].clientY - this.panY;
            } else if (e.touches.length === 2) {
                this.isPanning = false;
                this.touchStartDist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                this.touchStartScale = this.scale;
            }
        }, { passive: true });

        this.mapViewport.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && this.isPanning) {
                this.panX = e.touches[0].clientX - this.startX;
                this.panY = e.touches[0].clientY - this.startY;
                this.updateTransform();
            } else if (e.touches.length === 2 && this.touchStartDist) {
                const currentDist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                const ratio = currentDist / this.touchStartDist;
                const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                this.zoomAtPoint(midX, midY, ratio > 1 ? 1.04 : 0.96);
            }
        }, { passive: true });

        this.mapViewport.addEventListener('touchend', () => {
            this.isPanning = false;
            this.touchStartDist = null;
        });

        // Window resize
        window.addEventListener('resize', () => {
            if (this.container?.classList.contains('active')) {
                this.updateCanvasBaseSize();
            }
        });

        // Drag & Drop onto Floor Plan Map
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

                // Calculate relative percentage (0% to 100%) invariant under pan & zoom
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
        const parentMenus = customMenus.filter(m => !m.parentId);
        const subMenus = customMenus.filter(m => !!m.parentId);

        parentMenus.forEach(parent => {
            const children = subMenus.filter(s => s.parentId === parent.name);

            if (children.length > 0) {
                const directCount = (window.allData[parent.name] || []).length;
                let groupCount = directCount;
                children.forEach(c => {
                    groupCount += (window.allData[c.name] || []).length;
                });
                totalCount += groupCount;

                html += `<optgroup label="📁 ${parent.displayName || parent.name} (รวม ${groupCount} เครื่อง)">`;
                html += `<option value="${parent.name}">── รวมทั้งหมดในกลุ่ม: ${parent.displayName || parent.name} (${groupCount}) ──</option>`;
                children.forEach(child => {
                    const count = (window.allData[child.name] || []).length;
                    html += `<option value="${child.name}">&nbsp;&nbsp;└─ ${child.displayName || child.name} (${count} เครื่อง)</option>`;
                });
                html += `</optgroup>`;
            } else {
                const count = (window.allData[parent.name] || []).length;
                totalCount += count;
                html += `<option value="${parent.name}">📁 ${parent.displayName || parent.name} (${count} เครื่อง)</option>`;
            }
        });

        // 3. Any other collections
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

    // Helper to get prominent machine name / device title
    getDeviceDisplayName(d) {
        if (!d) return 'อุปกรณ์';
        
        if (d.ComputerName && typeof d.ComputerName === 'string' && d.ComputerName.trim() !== '') {
            return d.ComputerName.trim();
        }
        if (d.Name && typeof d.Name === 'string' && d.Name.trim() !== '') {
            return d.Name.trim();
        }
        if (d.ItemName && typeof d.ItemName === 'string' && d.ItemName.trim() !== '') {
            return d.ItemName.trim();
        }
        if (d.DeviceName && typeof d.DeviceName === 'string' && d.DeviceName.trim() !== '') {
            return d.DeviceName.trim();
        }
        if (d.PartName && typeof d.PartName === 'string' && d.PartName.trim() !== '') {
            return d.PartName.trim();
        }
        if (d.Model && typeof d.Model === 'string' && d.Model.trim() !== '') {
            const brand = (d.Manufacturer && typeof d.Manufacturer === 'string' && d.Manufacturer.trim()) ? d.Manufacturer.trim() + ' ' : '';
            return (brand + d.Model.trim()).trim();
        }
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

    /**
     * 🎨 DEVICE VISUAL METADATA ENGINE:
     * Returns distinctive icon, badge colors, and optional image for each device type!
     */
    getDeviceVisualMeta(device, collectionName = '') {
        const col = (collectionName || device._collectionName || '').toLowerCase();
        const type = ((device.Type || '') + ' ' + (device.ItemName || '') + ' ' + (device.Model || '')).toLowerCase();
        const name = (this.getDeviceDisplayName(device) || '').toLowerCase();

        // Check for attached picture
        const photoUrl = device.Image || device.Photo || device.imageUrl || device.ImagePath || device.Picture || null;

        const customMenuDef = (window.allData?.CustomMenus || []).find(m => m.name.toLowerCase() === col);
        const menuIcon = customMenuDef?.icon;

        // 1. CCTV / Camera
        if (col.includes('camera') || col.includes('cctv') || type.includes('cctv') || type.includes('camera')) {
            return {
                icon: 'fa-video',
                label: 'CCTV / Camera',
                color: 'bg-amber-500',
                borderColor: 'border-amber-300',
                tagColor: 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200',
                photoUrl
            };
        }

        // 2. Printer / Plotter
        if (col.includes('printer') || type.includes('printer') || type.includes('print')) {
            return {
                icon: 'fa-print',
                label: 'Printer',
                color: 'bg-emerald-600',
                borderColor: 'border-emerald-300',
                tagColor: 'bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200',
                photoUrl
            };
        }

        // 3. POS Cash Register
        if (col.includes('pos') || type.includes('pos') || name.includes('pos')) {
            return {
                icon: 'fa-cash-register',
                label: 'POS',
                color: 'bg-rose-600',
                borderColor: 'border-rose-300',
                tagColor: 'bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-200',
                photoUrl
            };
        }

        // 4. Laptop / Notebook / MacBook
        if (type.includes('laptop') || type.includes('notebook') || type.includes('macbook') || col.includes('laptop')) {
            return {
                icon: 'fa-laptop',
                label: 'Laptop',
                color: 'bg-indigo-600',
                borderColor: 'border-indigo-300',
                tagColor: 'bg-indigo-50 text-indigo-900 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-200',
                photoUrl
            };
        }

        // 5. Desktop PC / Workstation / All-in-One
        if (col.includes('computer') || type.includes('desktop') || type.includes('all-in-one') || col.includes('pc')) {
            return {
                icon: 'fa-desktop',
                label: 'Desktop PC',
                color: 'bg-blue-600',
                borderColor: 'border-blue-300',
                tagColor: 'bg-blue-50 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-200',
                photoUrl
            };
        }

        // 6. Monitor / Display
        if (col.includes('monitor') || type.includes('monitor') || type.includes('display')) {
            return {
                icon: 'fa-tv',
                label: 'Monitor',
                color: 'bg-teal-600',
                borderColor: 'border-teal-300',
                tagColor: 'bg-teal-50 text-teal-900 border-teal-300 dark:bg-teal-950 dark:text-teal-200',
                photoUrl
            };
        }

        // 7. WiFi / Access Point
        if (type.includes('access point') || type.includes('ap') || type.includes('wifi') || col.includes('wifi')) {
            return {
                icon: 'fa-wifi',
                label: 'Access Point',
                color: 'bg-sky-500',
                borderColor: 'border-sky-300',
                tagColor: 'bg-sky-50 text-sky-900 border-sky-300 dark:bg-sky-950 dark:text-sky-200',
                photoUrl
            };
        }

        // 8. Network Switch / Router / Firewall
        if (col.includes('network') || col.includes('switch') || type.includes('switch') || type.includes('router') || type.includes('firewall')) {
            return {
                icon: 'fa-network-wired',
                label: 'Network Switch',
                color: 'bg-purple-600',
                borderColor: 'border-purple-300',
                tagColor: 'bg-purple-50 text-purple-900 border-purple-300 dark:bg-purple-950 dark:text-purple-200',
                photoUrl
            };
        }

        // 9. Server / Storage / NAS
        if (col.includes('storage') || col.includes('server') || type.includes('server') || type.includes('nas')) {
            return {
                icon: 'fa-server',
                label: 'Server / Storage',
                color: 'bg-cyan-700',
                borderColor: 'border-cyan-300',
                tagColor: 'bg-cyan-50 text-cyan-900 border-cyan-300 dark:bg-cyan-950 dark:text-cyan-200',
                photoUrl
            };
        }

        // 10. Barcode Scanner
        if (col.includes('scanner') || type.includes('scanner') || type.includes('barcode')) {
            return {
                icon: 'fa-barcode',
                label: 'Scanner',
                color: 'bg-violet-600',
                borderColor: 'border-violet-300',
                tagColor: 'bg-violet-50 text-violet-900 border-violet-300 dark:bg-violet-950 dark:text-violet-200',
                photoUrl
            };
        }

        // 11. UPS / Power / Battery
        if (col.includes('ups') || type.includes('ups') || type.includes('power')) {
            return {
                icon: 'fa-bolt',
                label: 'UPS',
                color: 'bg-yellow-600',
                borderColor: 'border-yellow-300',
                tagColor: 'bg-yellow-50 text-yellow-900 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-200',
                photoUrl
            };
        }

        // 12. Audio / Microphone / Speaker
        if (col.includes('audio') || col.includes('speaker') || col.includes('mic') || type.includes('audio')) {
            return {
                icon: 'fa-volume-up',
                label: 'Audio',
                color: 'bg-fuchsia-600',
                borderColor: 'border-fuchsia-300',
                tagColor: 'bg-fuchsia-50 text-fuchsia-900 border-fuchsia-300 dark:bg-fuchsia-950 dark:text-fuchsia-200',
                photoUrl
            };
        }

        // 13. Projector
        if (col.includes('projector') || type.includes('projector')) {
            return {
                icon: 'fa-video',
                label: 'Projector',
                color: 'bg-orange-600',
                borderColor: 'border-orange-300',
                tagColor: 'bg-orange-50 text-orange-900 border-orange-300 dark:bg-orange-950 dark:text-orange-200',
                photoUrl
            };
        }

        // 14. Fallback from Menu Icon or Box
        return {
            icon: menuIcon || 'fa-box',
            label: customMenuDef?.displayName || collectionName,
            color: 'bg-slate-600',
            borderColor: 'border-slate-300',
            tagColor: 'bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-200',
            photoUrl
        };
    }

    getDevicesForCategory(catName) {
        if (!window.allData) return [];

        const customMenus = window.allData.CustomMenus || [];
        const isParentWithChildren = customMenus.some(m => m.parentId === catName);
        const directItems = window.allData[catName] || [];

        if (isParentWithChildren) {
            const aggregated = [];
            if (Array.isArray(directItems)) {
                aggregated.push(...directItems.map(d => ({ ...d, _collectionName: catName })));
            }
            const children = customMenus.filter(m => m.parentId === catName);
            children.forEach(child => {
                const childItems = window.allData[child.name];
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

            const visual = this.getDeviceVisualMeta(d, colName);

            let statusColor = 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
            if (status.includes('Use') || status.includes('Active') || status.includes('Loan')) statusColor = 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
            else if (status.includes('Repair') || status.includes('Issue') || status.includes('Damaged')) statusColor = 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';

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
                            ? `<button class="fp-locate-btn text-[11px] text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-bold flex items-center bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md transition hover:bg-indigo-100" data-id="${d._id}"><i class="fas fa-crosshairs mr-1"></i>ดูจุด</button>`
                            : `<span class="text-[10.5px] text-indigo-600 dark:text-indigo-300 font-bold flex items-center bg-indigo-50 dark:bg-indigo-900/50 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-700"><i class="fas fa-grip-vertical mr-1 text-indigo-400"></i>ลากไปวาง</span>`
                        }
                    </div>

                    <!-- MACHINE NAME & SPECIFIC DEVICE ICON -->
                    <div class="flex items-center space-x-2 mb-0.5">
                        <div class="w-6 h-6 rounded-lg ${visual.color} text-white flex items-center justify-center text-xs shrink-0 shadow-sm">
                            ${visual.photoUrl 
                                ? `<img src="${visual.photoUrl}" alt="${primaryName}" class="w-full h-full object-cover rounded-lg">`
                                : `<i class="fas ${visual.icon}"></i>`
                            }
                        </div>
                        <h4 class="font-extrabold text-[13.5px] text-gray-900 dark:text-white truncate tracking-wide flex-1" title="${primaryName}">
                            ${primaryName}
                        </h4>
                    </div>

                    <!-- Model / Spec Subtitle -->
                    ${secondarySpec && secondarySpec !== primaryName ? `<div class="text-[11px] text-gray-600 dark:text-gray-300 font-medium truncate mb-1 pl-8">${secondarySpec}</div>` : ''}

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
                            <span class="text-gray-400">สถานที่:</span>
                            <span class="text-gray-700 dark:text-gray-300 truncate ml-1">${location}</span>
                        </div>` : ''}
                    </div>

                    ${isPinned ? `
                        <div class="mt-2 pt-1 border-t border-dashed border-gray-200 dark:border-gray-700 flex justify-between items-center text-[10px]">
                            <span class="text-emerald-600 font-semibold flex items-center"><i class="fas fa-check-circle mr-1"></i>ปักหมุดแล้ว (${Math.round(d.mapLocation.x)}%, ${Math.round(d.mapLocation.y)}%)</span>
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
            btn.addEventListener('click', () => this.highlightPin(btn.dataset.id));
        });

        // Unpin buttons
        listContainer.querySelectorAll('.fp-unpin-btn').forEach(btn => {
            btn.addEventListener('click', () => this.unpinDevice(btn.dataset.id, btn.dataset.col));
        });
    }

    // ------------------------------------------------------------------------
    // 📍 Pins Rendering (Dynamic Device-Specific Icon, Color, Tag, and Image)
    // ------------------------------------------------------------------------
    renderPins() {
        if (!this.pinsContainer) return;
        this.pinsContainer.innerHTML = '';

        if (this.isolateCategory) {
            const devices = this.getDevicesForCategory(this.selectedCategory);
            devices.forEach(d => {
                if (!d.mapLocation || typeof d.mapLocation.x !== 'number') return;
                const pinEl = this.createPinElement(d, d._collectionName || this.selectedCategory);
                this.pinsContainer.appendChild(pinEl);
            });
        } else {
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
        pin.className = 'fp-pin absolute -translate-x-1/2 -translate-y-full cursor-pointer transition-transform hover:scale-115 z-20 group';
        pin.style.left = `${device.mapLocation.x}%`;
        pin.style.top = `${device.mapLocation.y}%`;
        pin.dataset.id = device._id;
        pin.dataset.col = collectionName;
        pin.draggable = true;

        const visual = this.getDeviceVisualMeta(device, collectionName);
        const deviceName = this.getDeviceDisplayName(device);
        const sn = device.SerialNumber || device.MonitorSerial || '-';
        const ip = device.IPAddress || '';
        const user = device.UserName || device.CurrentUser || device.ResponsiblePerson || '';
        const status = device.Status || 'In Storage';

        let statusDotBg = 'bg-blue-500';
        if (status.includes('Use') || status.includes('Active') || status.includes('Loan')) statusDotBg = 'bg-emerald-500';
        else if (status.includes('Repair') || status.includes('Issue') || status.includes('Damaged')) statusDotBg = 'bg-red-500';

        pin.innerHTML = `
            <div class="flex flex-col items-center">
                <!-- Pin Head & Icon/Image -->
                <div class="relative flex items-center justify-center">
                    ${ip ? `<span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-60"></span>` : ''}
                    
                    <div class="w-8 h-8 rounded-full ${visual.color} border-2 ${visual.borderColor} text-white flex items-center justify-center shadow-lg relative z-10 overflow-hidden group-hover:ring-2 group-hover:ring-white">
                        ${visual.photoUrl 
                            ? `<img src="${visual.photoUrl}" alt="${deviceName}" class="w-full h-full object-cover">`
                            : `<i class="fas ${visual.icon} text-xs"></i>`
                        }
                    </div>

                    <!-- Status dot in top-right of pin icon -->
                    <div class="w-2.5 h-2.5 ${statusDotBg} rounded-full absolute -top-0.5 -right-0.5 border border-white z-20 shadow-sm" title="${status}"></div>

                    <!-- Pin Pointer Arrow -->
                    <div class="w-2.5 h-2.5 ${visual.color} rotate-45 absolute -bottom-1 shadow-md border-r-2 border-b-2 ${visual.borderColor} z-0"></div>
                </div>

                <!-- Name Label Tag (Clearly displays machine name right on map) -->
                <div class="mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight shadow-md whitespace-nowrap border pointer-events-none transition-all ${visual.tagColor} max-w-[110px] truncate">
                    ${deviceName}
                </div>
            </div>

            <!-- Hover Details Tooltip -->
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col bg-gray-900/95 backdrop-blur-md text-white text-[11px] p-2.5 rounded-xl whitespace-nowrap shadow-2xl pointer-events-none z-30 border border-white/15 min-w-[150px]">
                <div class="flex items-center space-x-1.5 font-extrabold text-yellow-300 mb-1 border-b border-gray-700/80 pb-1">
                    <i class="fas ${visual.icon} text-[11px]"></i>
                    <span class="truncate">${deviceName}</span>
                </div>
                <div class="text-[10px] text-gray-300 font-mono flex justify-between"><span class="text-gray-400">SN:</span> <span>${sn}</span></div>
                ${ip ? `<div class="text-[10px] text-emerald-300 font-mono flex justify-between"><span class="text-gray-400">IP:</span> <span>${ip}</span></div>` : ''}
                ${user ? `<div class="text-[10px] text-indigo-300 flex justify-between"><span class="text-gray-400">ผู้ใช้:</span> <span class="truncate ml-1">${user}</span></div>` : ''}
                <div class="text-[9.5px] text-gray-400 flex justify-between mt-0.5"><span class="text-gray-500">ประเภท:</span> <span>${visual.label}</span></div>
                <div class="mt-1 text-[9px] text-indigo-300 text-center bg-indigo-950/80 rounded py-0.5">คลิกเพื่อดูข้อมูล / แก้ไขตำแหน่ง</div>
            </div>
        `;

        // Click handler: opens Popover
        pin.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openPinPopover(device, collectionName, pin);
        });

        // Allow dragging existing pin directly on map to adjust position
        pin.addEventListener('dragstart', (e) => {
            const payload = JSON.stringify({
                _id: device._id,
                collectionName: collectionName,
                name: deviceName,
                sn: sn
            });
            e.dataTransfer.setData('application/json', payload);
            pin.classList.add('opacity-40');
        });
        pin.addEventListener('dragend', () => {
            pin.classList.remove('opacity-40');
        });

        return pin;
    }

    openPinPopover(device, collectionName, pinElement) {
        this.closePopover();

        const popover = document.createElement('div');
        popover.className = 'fp-popover absolute bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 w-68 z-40 text-xs animate-fade-in-up';
        
        popover.style.left = `${device.mapLocation.x}%`;
        popover.style.top = `calc(${device.mapLocation.y}% - 42px)`;
        popover.style.transform = 'translate(-50%, -100%)';

        const name = this.getDeviceDisplayName(device);
        const sn = device.SerialNumber || device.MonitorSerial || '-';
        const ip = device.IPAddress || '-';
        const status = device.Status || 'In Storage';
        const user = device.UserName || device.CurrentUser || device.ResponsiblePerson || '-';
        const visual = this.getDeviceVisualMeta(device, collectionName);

        popover.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div class="flex items-center space-x-1.5">
                    <span class="w-2 h-2 rounded-full ${visual.color}"></span>
                    <span class="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">${visual.label}</span>
                </div>
                <button class="fp-popover-close text-gray-400 hover:text-gray-600 dark:hover:text-white p-1"><i class="fas fa-times"></i></button>
            </div>

            <div class="flex items-center space-x-2 mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                <div class="w-8 h-8 rounded-lg ${visual.color} text-white flex items-center justify-center text-sm shadow-sm shrink-0">
                    ${visual.photoUrl 
                        ? `<img src="${visual.photoUrl}" alt="${name}" class="w-full h-full object-cover rounded-lg">`
                        : `<i class="fas ${visual.icon}"></i>`
                    }
                </div>
                <div class="min-w-0 flex-1">
                    <h3 class="font-extrabold text-sm text-gray-900 dark:text-white truncate" title="${name}">${name}</h3>
                    <p class="font-mono text-[10px] text-gray-400 truncate">SN: ${sn}</p>
                </div>
            </div>

            <div class="space-y-1.5 mb-3 text-gray-600 dark:text-gray-300 text-[11px]">
                <div class="flex justify-between"><span class="text-gray-400">สถานะ:</span> <span class="font-semibold">${status}</span></div>
                <div class="flex justify-between"><span class="text-gray-400">IP:</span> <span class="font-mono font-semibold text-blue-600 dark:text-blue-400">${ip}</span></div>
                <div class="flex justify-between"><span class="text-gray-400">ผู้รับผิดชอบ:</span> <span class="truncate ml-1">${user}</span></div>
                <div class="flex justify-between"><span class="text-gray-400">พิกัดบนผัง:</span> <span class="font-mono text-gray-500">${Math.round(device.mapLocation.x)}%, ${Math.round(device.mapLocation.y)}%</span></div>
            </div>

            <div class="flex space-x-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <button class="fp-popover-view flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-sm text-center">
                    <i class="fas fa-edit mr-1"></i> ดูข้อมูล
                </button>
                <button class="fp-popover-unpin px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/80 text-red-600 dark:text-red-400 rounded-xl font-bold transition border border-red-200 dark:border-red-800">
                    <i class="fas fa-trash-alt mr-1"></i> ถอนหมุด
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

    // Smoothly pan & center on a pin with a highlight ring
    highlightPin(id) {
        const pin = this.pinsContainer?.querySelector(`.fp-pin[data-id="${id}"]`);
        if (!pin) return;

        const leftPct = parseFloat(pin.style.left);
        const topPct = parseFloat(pin.style.top);

        const canvasW = this.mapCanvas.offsetWidth;
        const canvasH = this.mapCanvas.offsetHeight;
        const pinX = (leftPct / 100) * canvasW;
        const pinY = (topPct / 100) * canvasH;

        // Smoothly center on this pin and zoom to at least 1.4x
        this.scale = Math.max(this.scale, 1.4);
        this.panX = (this.mapViewport.clientWidth / 2) - (pinX * this.scale);
        this.panY = (this.mapViewport.clientHeight / 2) - (pinY * this.scale);
        this.updateTransform();

        pin.classList.add('ring-4', 'ring-yellow-400', 'scale-125', 'z-50');

        let targetDevice = null;
        let targetCol = null;
        for (const col of Object.keys(window.allData || {})) {
            if (Array.isArray(window.allData[col])) {
                const found = window.allData[col].find(d => d._id === id);
                if (found) { targetDevice = found; targetCol = col; break; }
            }
        }
        if (targetDevice) {
            this.openPinPopover(targetDevice, targetCol, pin);
        }

        setTimeout(() => {
            pin.classList.remove('ring-4', 'ring-yellow-400', 'scale-125', 'z-50');
        }, 3000);
    }

    // ------------------------------------------------------------------------
    // 🔎 Pan & Zoom Engine + Layout Sizing ("เต็มพื้นที่สีดำ" + Smooth Zoom)
    // ------------------------------------------------------------------------
    
    // Updates base size of canvas when viewport changes
    updateCanvasBaseSize() {
        if (!this.mapViewport || !this.mapCanvas) return;
        const vpW = this.mapViewport.clientWidth;
        if (vpW <= 0) return;

        const canvasW = vpW;
        const canvasH = Math.round(vpW / this.aspectRatio);

        this.mapCanvas.style.width = `${canvasW}px`;
        this.mapCanvas.style.height = `${canvasH}px`;
        this.updateTransform();
    }

    // 📐 FILLS 100% OF THE BLACK VIEWPORT AREA (Zero black empty space on left/right!)
    fillWidth() {
        if (!this.mapViewport || !this.mapCanvas) return;
        const vpW = this.mapViewport.clientWidth;
        const vpH = this.mapViewport.clientHeight;
        if (vpW <= 0 || vpH <= 0) return;

        const canvasW = vpW;
        const canvasH = Math.round(vpW / this.aspectRatio);

        this.mapCanvas.style.width = `${canvasW}px`;
        this.mapCanvas.style.height = `${canvasH}px`;

        this.scale = 1.0;
        this.panX = 0;
        this.panY = 0; // Starts at top edge, fills 100% width
        this.updateTransform();
    }

    // 🖼️ FITS ENTIRE MAP INTO VIEWPORT (Bird's eye view)
    fitScreen() {
        if (!this.mapViewport || !this.mapCanvas) return;
        const vpW = this.mapViewport.clientWidth;
        const vpH = this.mapViewport.clientHeight;
        if (vpW <= 0 || vpH <= 0) return;

        let targetW, targetH;
        if ((vpW / vpH) < this.aspectRatio) {
            targetW = vpW;
            targetH = vpW / this.aspectRatio;
        } else {
            targetH = vpH;
            targetW = vpH * this.aspectRatio;
        }

        const canvasW = vpW;
        const canvasH = Math.round(vpW / this.aspectRatio);
        this.mapCanvas.style.width = `${canvasW}px`;
        this.mapCanvas.style.height = `${canvasH}px`;

        this.scale = parseFloat((targetW / canvasW).toFixed(3));
        this.panX = Math.round((vpW - (canvasW * this.scale)) / 2);
        this.panY = Math.round((vpH - (canvasH * this.scale)) / 2);
        this.updateTransform();
    }

    // Zoom at Center of viewport
    zoomAtCenter(factor) {
        if (!this.mapViewport) return;
        const rect = this.mapViewport.getBoundingClientRect();
        this.zoomAtPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, factor);
    }

    // Precision Zoom directly toward mouse pointer (Google Maps / Figma algorithm)
    zoomAtPoint(clientX, clientY, factor) {
        if (!this.mapViewport || !this.mapCanvas) return;
        const rect = this.mapViewport.getBoundingClientRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        const oldScale = this.scale;
        const newScale = Math.min(Math.max(oldScale * factor, 0.35), 4.5);
        if (newScale === oldScale) return;

        // Shift pan so pixel directly under cursor remains anchored
        this.panX = mouseX - (mouseX - this.panX) * (newScale / oldScale);
        this.panY = mouseY - (mouseY - this.panY) * (newScale / oldScale);
        this.scale = parseFloat(newScale.toFixed(3));
        this.updateTransform();
    }

    updateTransform() {
        if (!this.mapCanvas) return;
        this.mapCanvas.style.transform = `translate(${Math.round(this.panX)}px, ${Math.round(this.panY)}px) scale(${this.scale})`;
        
        // Update all zoom level text in UI
        const pct = `${Math.round(this.scale * 100)}%`;
        const zoomEls = document.querySelectorAll('.fp-zoom-level-text');
        zoomEls.forEach(el => el.innerText = pct);
    }
}

// 🚀 Self-Instantiate
window.floorPlan = new FloorPlanManager();

// ===================================================================
// Frontend Logic for IT Inventory System (Full Complete Version)
// FEATURES: Bilingual (TH/EN), Auto-fill OCR, Dashboard, Labels, Custom Menus
// ===================================================================

const API_BASE_URL = 'https://it-inventory-system-ncd9.onrender.com';

// ==========================================
// --- 🌟 BILINGUAL SYSTEM (TH/EN DICTIONARY) ---
// ==========================================
const translations = {
    en: {
        app_title: "Inventory",
        loading_system: "Loading System...",
        logged_in_as: "Logged in as",
        logout: "Logout",
        dark_mode: "Dark Mode",
        light_mode: "Light Mode",
        lang_switch_text: "เปลี่ยนเป็นภาษาไทย",
        overview_dashboard: "Overview Dashboard",
        total_assets: "Total Assets",
        active_loan: "Active / Loan",
        in_storage: "In Storage",
        repair_issue: "Repair / Issue",
        disposed: "Disposed",
        network_health: "Network & Devices Health",
        network_health_desc: "Online/Offline status of devices with IP",
        online: "ONLINE",
        offline: "OFFLINE",
        warranty_alerts: "Warranty Alerts",
        warranty_alerts_desc: "Overall equipment warranty updates",
        expires_soon: "EXPIRES <30D",
        expired: "EXPIRED",
        status_distribution: "Status Distribution",
        assets_by_category: "Assets by Category",
        top_locations: "Top Locations",
        recent_transactions: "Recent Transactions",
        settings: "Settings",
        disposed_assets: "Disposed Assets",
        disposed_assets_desc: "List of disposed assets (with evidence)",
        device: "Device",
        sn: "SN",
        date: "Date",
        evidence: "Evidence",
        handover_return_title: "Handover & Return",
        handover: "Handover",
        return: "Return",
        loan_history: "Loan History",
        maintenance_history: "Maintenance Logs",
        assets_by_user: "Assets by User",
        scan_image: "Scan Image (Auto-fill)",
        scanning: "AI is analyzing image...",
        scan_success: "Auto-filled data successfully!",
        scan_failed: "Failed to read text from the image.",
        disposal_evidence: "Disposal Evidence",
        disposal_desc: "As status changed to 'Disposed', please attach reference document (PDF, JPG max 2MB)",
        evidence_attached: "Evidence attached",
        view_evidence: "View Document",
        add_new_log: "Add New Log",
        description: "Description*",
        date_log: "Date*",
        cost: "Cost",
        technician: "Technician",
        save_log: "Save Log",
        past_records: "Past Records",
        device_history: "Device Ownership & Usage History",
        cancel: "Cancel",
        save_changes: "Save Changes",
        clone_device: "Clone Device",
        cloning_from: "Cloning specs from:",
        enter_new_sns: "Enter new Serial Numbers",
        one_per_line: "(1 per line)",
        clone_info: "Cloned devices will be automatically saved to Storage.",
        create_items: "Create Items",
        move_category: "Move Category",
        moving_device: "Moving device:",
        select_target_category: "Select target category",
        move_info: "Loan and maintenance history will be moved automatically.",
        confirm_move: "Confirm Move",
        bulk_edit_title: "Bulk Edit Items",
        items: "items",
        save_all_changes: "Save All Changes",
        system_id: "System ID (No spaces)*",
        display_name: "Display Name*",
        icon_class: "Icon (FontAwesome Class)",
        parent_menu: "Parent Menu",
        order_num: "Order (Number)",
        select_fields_cat: "Select Fields for this Category",
        save_menu: "Save Menu",
        dl_csv_template: "Download CSV Template",
        req_headers: "Required Headers:",
        csv_file: "CSV File",
        encoding: "Encoding (Language Format)",
        import_data: "Import Data",
        qr_desc: "Scan this QR code with your mobile device to view complete details of this asset.",
        close: "Close",
        username_req: "Username (Required)",
        first_name: "First Name",
        last_name: "Last Name",
        department: "Department",
        save_data: "Save Data",
        auto_detected: "Auto Detected",
        add_to_system: "Add to System",
        add_admin: "Add System Admin",
        admin_desc: "This user will be able to login and manage all inventory data.",
        email_addr: "Email Address",
        password: "Password",
        create_admin: "Create Admin",
        got_it: "Got it",
        search: "Search...",
        all_statuses: "All Statuses",
        bulk_edit: "Bulk Edit",
        bulk_delete: "Bulk Delete",
        rapid_scan: "Rapid Scan",
        import_csv: "Import CSV",
        add_new: "Add New",
        actions: "Actions",
        no_data: "No data found.",
        showing: "Showing",
        to: "to",
        of: "of",
        results: "results",
        rows: "Rows:",
        page: "Page",
        unknown: "Unknown",
        just_now: "Just now",
        mins_ago: "mins ago",
        hours_ago: "hours ago",
        days_ago: "days ago",
        active: "Active",
        storage: "Storage",
        repair: "Repair",
        damaged: "Damaged",
        on_loan: "On Loan",
        back: "Back",
        go_back: "Go back",
        items_count: "Items",
        view_items: "View items in this category",
        dashboard: "Dashboard",
        computers: "Computers",
        monitors: "Monitors",
        accessories: "Accessories",
        keyboards: "Keyboards",
        mice: "Mice",
        printers: "Printers",
        network: "Network",
        transactions: "Transactions",
        loan_page_user: "Loan Page (for User)",
        reports: "Reports",
        system_settings: "System Settings",
        staff_management: "Staff Management",
        admin_management: "Admin Management",
        label_printer: "Label Printer",
        custom_categories: "Custom Categories",
        assets: "Assets",
        management: "Management",
        quick_sn_search: "Quick Serial Number Search",
        quick_sn_search_desc: "Enter Serial Number to find device information instantly.",
        edit_asset: "Edit Asset",
        view_details: "View Details",
        searching_sn: "Searching for Serial Number...",
        sn_not_found: "Serial Number not found in system.",
        enter_sn_manual: "Please enter a Serial Number.",
    },
    th: {
        app_title: "ระบบคลังอุปกรณ์",
        loading_system: "กำลังโหลดระบบ...",
        logged_in_as: "เข้าสู่ระบบโดย",
        logout: "ออกจากระบบ",
        dark_mode: "โหมดกลางคืน",
        light_mode: "โหมดสว่าง",
        lang_switch_text: "Switch to English",
        overview_dashboard: "ภาพรวมระบบ",
        total_assets: "ทรัพย์สินทั้งหมด",
        active_loan: "ใช้งาน / ถูกยืม",
        in_storage: "ในคลัง",
        repair_issue: "ส่งซ่อม / มีปัญหา",
        disposed: "จำหน่ายออก",
        network_health: "สถานะเครือข่ายและอุปกรณ์",
        network_health_desc: "สถานะออนไลน์/ออฟไลน์ของอุปกรณ์ที่มี IP",
        online: "ออนไลน์",
        offline: "ออฟไลน์",
        warranty_alerts: "การแจ้งเตือนประกัน",
        warranty_alerts_desc: "สถานะประกันของอุปกรณ์ทั้งหมด",
        expires_soon: "หมดใน <30 วัน",
        expired: "หมดประกันแล้ว",
        status_distribution: "สัดส่วนสถานะอุปกรณ์",
        assets_by_category: "อุปกรณ์แยกตามหมวดหมู่",
        top_locations: "สถานที่ใช้งานสูงสุด",
        recent_transactions: "ประวัติทำรายการล่าสุด",
        settings: "ตั้งค่าระบบ",
        disposed_assets: "อุปกรณ์ที่จำหน่ายออก",
        disposed_assets_desc: "รายการอุปกรณ์ที่ถูกแทงจำหน่าย (มีเอกสารแนบ)",
        device: "อุปกรณ์",
        sn: "ซีเรียล",
        date: "วันที่",
        evidence: "เอกสารอ้างอิง",
        handover_return_title: "การส่งมอบ & รับคืน",
        handover: "ส่งมอบ",
        return: "รับคืน",
        loan_history: "ประวัติการยืม",
        maintenance_history: "ประวัติการซ่อมบำรุง",
        assets_by_user: "อุปกรณ์แยกตามพนักงาน",
        scan_image: "สแกนภาพ (กรอกอัตโนมัติ)",
        scanning: "AI กำลังวิเคราะห์รูปภาพ...",
        scan_success: "กรอกข้อมูลอัตโนมัติสำเร็จ!",
        scan_failed: "ไม่สามารถอ่านข้อความจากภาพได้",
        disposal_evidence: "หลักฐานการแทงจำหน่าย",
        disposal_desc: "เนื่องจากมีการเปลี่ยนสถานะเป็น 'Disposed' กรุณาแนบเอกสารอ้างอิง (PDF, JPG ขนาดไม่เกิน 2MB)",
        evidence_attached: "มีเอกสารแนบไว้แล้ว",
        view_evidence: "เปิดดูเอกสาร",
        add_new_log: "เพิ่มประวัติใหม่",
        description: "รายละเอียด*",
        date_log: "วันที่*",
        cost: "ค่าใช้จ่าย",
        technician: "ช่าง/ผู้ดำเนินการ",
        save_log: "บันทึกประวัติ",
        past_records: "ประวัติย้อนหลัง",
        device_history: "ประวัติการครอบครอง & การใช้งาน",
        cancel: "ยกเลิก",
        save_changes: "บันทึกการเปลี่ยนแปลง",
        clone_device: "โคลนข้อมูลอุปกรณ์",
        cloning_from: "กำลังคัดลอกสเปคจาก:",
        enter_new_sns: "ระบุ Serial Number ใหม่",
        one_per_line: "(1 บรรทัดต่อ 1 เครื่อง)",
        clone_info: "อุปกรณ์ที่โคลนใหม่จะถูกบันทึกเข้าคลังอัตโนมัติ",
        create_items: "สร้างรายการใหม่",
        move_category: "ย้ายหมวดหมู่อุปกรณ์",
        moving_device: "กำลังย้ายอุปกรณ์:",
        select_target_category: "เลือกหมวดหมู่ปลายทาง",
        move_info: "ข้อมูลประวัติการยืมและซ่อมบำรุงจะถูกย้ายตามไปด้วยอัตโนมัติ",
        confirm_move: "ยืนยันการย้าย",
        bulk_edit_title: "แก้ไขข้อมูลทีละหลายรายการ",
        items: "รายการ",
        save_all_changes: "บันทึกการแก้ไขทั้งหมด",
        system_id: "รหัสระบบ (ห้ามเว้นวรรค)*",
        display_name: "ชื่อที่แสดง*",
        icon_class: "ไอคอน (Class ของ FontAwesome)",
        parent_menu: "เมนูหลัก (Parent)",
        order_num: "ลำดับการแสดงผล",
        select_fields_cat: "เลือกฟิลด์สำหรับหมวดหมู่นี้",
        save_menu: "บันทึกเมนู",
        dl_csv_template: "ดาวน์โหลดแม่แบบ CSV",
        req_headers: "หัวข้อคอลัมน์ที่จำเป็น:",
        csv_file: "ไฟล์ CSV",
        encoding: "รูปแบบการเข้ารหัสภาษา",
        import_data: "นำเข้าข้อมูล",
        qr_desc: "สแกนคิวอาร์โค้ดนี้ด้วยสมาร์ทโฟนเพื่อดูรายละเอียดฉบับเต็ม",
        close: "ปิด",
        username_req: "รหัสพนักงาน/ชื่อผู้ใช้ (จำเป็น)",
        first_name: "ชื่อจริง",
        last_name: "นามสกุล",
        department: "แผนก",
        save_data: "บันทึกข้อมูล",
        auto_detected: "พบจากอุปกรณ์",
        add_to_system: "เพิ่มเข้าระบบ",
        add_admin: "เพิ่มผู้ดูแลระบบ",
        admin_desc: "ผู้ใช้นี้จะสามารถล็อกอินและจัดการข้อมูลคลังได้ทั้งหมด",
        email_addr: "อีเมล",
        password: "รหัสผ่าน",
        create_admin: "สร้างผู้ดูแลระบบ",
        got_it: "รับทราบ",
        search: "ค้นหา...",
        all_statuses: "ทุกสถานะ",
        bulk_edit: "แก้ไขหลายรายการ",
        bulk_delete: "ลบหลายรายการ",
        rapid_scan: "สแกนด่วน",
        import_csv: "นำเข้า CSV",
        add_new: "เพิ่มข้อมูล",
        actions: "จัดการ",
        no_data: "ไม่พบข้อมูล",
        showing: "แสดง",
        to: "ถึง",
        of: "จาก",
        results: "รายการ",
        rows: "แถว:",
        page: "หน้า",
        unknown: "ไม่ทราบ",
        just_now: "เมื่อสักครู่",
        mins_ago: "นาทีที่แล้ว",
        hours_ago: "ชั่วโมงที่แล้ว",
        days_ago: "วันที่แล้ว",
        active: "ใช้งานอยู่",
        storage: "ในคลัง",
        repair: "ส่งซ่อม",
        damaged: "ชำรุด",
        on_loan: "ถูกยืม",
        back: "ย้อนกลับ",
        go_back: "กลับหน้าก่อนหน้า",
        items_count: "รายการ",
        view_items: "ดูรายการในหมวดนี้",
        dashboard: "แผงควบคุม",
        computers: "คอมพิวเตอร์",
        monitors: "หน้าจอ",
        accessories: "อุปกรณ์เสริม",
        keyboards: "คีย์บอร์ด",
        mice: "เมาส์",
        printers: "เครื่องพิมพ์",
        network: "อุปกรณ์เครือข่าย",
        transactions: "การทำรายการ",
        loan_page_user: "หน้าเว็บสำหรับยืมอุปกรณ์ (User)",
        reports: "รายงาน",
        system_settings: "ตั้งค่าระบบ",
        staff_management: "จัดการรายชื่อพนักงาน",
        admin_management: "จัดการผู้ดูแลระบบ",
        label_printer: "พิมพ์ฉลาก (Label)",
        custom_categories: "จัดการหมวดหมู่ (Custom)",
        assets: "ทรัพย์สิน",
        management: "การจัดการ",
        quick_sn_search: "ค้นหาด้วย Serial Number",
        quick_sn_search_desc: "ระบุ Serial Number เพื่อดูข้อมูลอุปกรณ์ทันที",
        edit_asset: "แก้ไขข้อมูล",
        view_details: "ดูรายละเอียด",
        searching_sn: "กำลังค้นหาข้อมูลจาก Serial Number...",
        sn_not_found: "ไม่พบ Serial Number นี้ในระบบ",
        enter_sn_manual: "กรุณาระบุ Serial Number",
    }
};

let currentLang = localStorage.getItem('appLang') || 'th';

function t(key) { return translations[currentLang][key] || key; }

function updateUI() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            if (el.innerHTML.includes('<i')) {
                const iconHtml = el.innerHTML.match(/<i[^>]*><\/i>/) ? el.innerHTML.match(/<i[^>]*><\/i>/)[0] : '';
                const extraSpanHtml = el.innerHTML.match(/<span[^>]*>.*?<\/span>/) ? el.innerHTML.match(/<span[^>]*>.*?<\/span>/)[0] : '';
                el.innerHTML = `${iconHtml} ${translations[currentLang][key]} ${extraSpanHtml}`.trim();
            } else {
                el.textContent = translations[currentLang][key];
            }
        }
    });

    const langText = document.getElementById('lang-text');
    if (langText) langText.textContent = translations[currentLang].lang_switch_text;

    renderSidebarDynamic();
    generateDynamicPages();
    
    const activePage = document.querySelector('.page-content.active');
    if (activePage && activePage.id !== 'dashboard-page') {
        const colName = activePage.id.replace('-page', '');
        const realKey = Object.keys(collectionConfigs).find(k => k.toLowerCase() === colName);
        if(realKey) window.buildTable(realKey);
    }
}

window.toggleLanguage = function() {
    currentLang = currentLang === 'en' ? 'th' : 'en';
    localStorage.setItem('appLang', currentLang);
    updateUI();
};

let tesseractWorker = null;

async function getTesseractWorker() {
    if (tesseractWorker) return tesseractWorker;
    tesseractWorker = await Tesseract.createWorker('eng');
    return tesseractWorker;
}

// --- 🚀 Pre-process image to speed up OCR (Resize if too large) ---
window.preprocessImage = async function(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Max size 1000px (Balance between speed and accuracy)
                const MAX_WIDTH = 1000;
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert back to blob or dataURL
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', 0.8);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
};

// ===================================================================
// 🌟 📸 INTEGRATED SCAN LOGIC (OCR) - OPTIMIZED
// ===================================================================
window.scanToSearch = async function(inputElement) {
    if (!inputElement.files || inputElement.files.length === 0) return;
    const file = inputElement.files[0];

    // Show Scanning Modal
    document.getElementById('modalTitle').textContent = t('scanning') || 'Scanning Image...';
    document.getElementById('modalMessage').textContent = t('searching_sn') || 'AI is extracting data. Please wait...';
    document.getElementById('modalIcon').innerHTML = '<i class="fas fa-spinner fa-spin text-4xl text-indigo-500 mb-2"></i>';
    window.openModalWindow('notificationModal');

    try {
        // --- 🚀 NEW: Pre-process image to speed up OCR (Resize if too large) ---
        const optimizedImage = await window.preprocessImage(file);
        
        const worker = await getTesseractWorker();
        const ret = await worker.recognize(optimizedImage);
        const extractedText = ret.data.text;

        console.log("--- OCR Full Text Results ---\n", extractedText);

        // 1. Try to find S/N with common prefixes
        const snMatch = extractedText.match(/(?:S\/?N|Serial|SerNo|Service\s*Tag)\s*[:|-]?\s*([A-Z0-9-]+)/i);
        let snVal = snMatch ? snMatch[1].trim() : null;

        // 2. Try to find Model with common prefixes
        const modelMatch = extractedText.match(/(?:Model|MN|M\/N|Product)\s*[:|-]?\s*([A-Z0-9-]+)/i);
        let modelVal = modelMatch ? modelMatch[1].trim() : null;

        // 3. Smart Fallback: If no clear S/N found, look for "Serial-like" strings in the text
        if (!snVal) {
            const lines = extractedText.split('\n');
            for (let line of lines) {
                const words = line.split(/\s+/);
                for (let word of words) {
                    const clean = word.replace(/[^A-Z0-9-]/gi, '');
                    // Typical SN length 6-20, must have letters and numbers
                    if (clean.length >= 6 && clean.length <= 20 && /[A-Z]/.test(clean) && /[0-9]/.test(clean)) {
                        snVal = clean;
                        break;
                    }
                }
                if (snVal) break;
            }
        }

        // --- ACTION A: If we are in the Dashboard (Searching) ---
        if (inputElement.id === 'scanSearchInput') {
            if (snVal) {
                await window.performSnSearch(snVal);
            } else {
                window.hideModal('notificationModal');
                setTimeout(() => window.showNotificationModal('info', t('scan_failed'), `AI cannot find a clear Serial Number. Please try again with a closer shot.`), 400);
            }
        } 
        // --- ACTION B: If we are in an Edit Modal (Auto-filling) ---
        else {
            let foundCount = 0;
            if (snVal) {
                const snInput = document.getElementById('edit-SerialNumber') || document.getElementById('edit-MonitorSerial');
                if (snInput) { 
                    snInput.value = snVal; 
                    snInput.classList.add('ring-4', 'ring-green-300', 'bg-green-50'); 
                    setTimeout(() => snInput.classList.remove('ring-4', 'ring-green-300', 'bg-green-50'), 2000);
                    foundCount++; 
                }
            }
            if (modelVal) {
                const modelInput = document.getElementById('edit-Model');
                if (modelInput) { 
                    modelInput.value = modelVal; 
                    modelInput.classList.add('ring-4', 'ring-green-300', 'bg-green-50'); 
                    setTimeout(() => modelInput.classList.remove('ring-4', 'ring-green-300', 'bg-green-50'), 2000);
                    foundCount++; 
                }
            }

            window.hideModal('notificationModal');
            if (foundCount > 0) {
                setTimeout(() => window.showNotificationModal('success', t('scan_success') || 'Success', `AI detected and filled ${foundCount} fields.`), 400);
            } else {
                setTimeout(() => window.showNotificationModal('info', t('scan_failed') || 'No Match', 'AI could not identify Serial Number or Model from this photo.'), 400);
            }
        }

    } catch (error) {
        console.error("OCR Error:", error);
        window.hideModal('notificationModal');
        setTimeout(() => window.showNotificationModal('warning', 'Error', 'OCR Processing failed.'), 400);
    }
    inputElement.value = ''; 
};

window.manualSnSearch = function() {
    const input = document.getElementById('manualSnSearchInput');
    const sn = input.value.trim();
    if (!sn) return showNotificationModal('warning', 'Info', t('enter_sn_manual'));
    window.performSnSearch(sn);
};

window.openViewModal = function(collectionName, item) {
    const header = document.getElementById('viewModalHeader');
    const body = document.getElementById('viewModalBody');
    const config = collectionConfigs[collectionName] || { icon: 'fa-box', displayName: collectionName };
    const id = item._id || item.id;

    const displayName = config.isCustom ? config.displayName : t(collectionName.toLowerCase()) || config.displayName;
    const name = item[config.nameField] || item.ComputerName || item.ItemName || 'Unnamed Asset';
    const serial = item[config.serialField] || item.SerialNumber || 'N/A';

    header.innerHTML = `
        <div class="flex items-center">
            <div class="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-4 shadow-inner">
                <i class="fas ${config.icon} text-indigo-600 dark:text-indigo-400 text-xl"></i>
            </div>
            <div>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white leading-tight">${name}</h3>
                <p class="text-xs text-gray-500 font-medium mt-1 uppercase tracking-widest">${displayName} • S/N: ${serial}</p>
            </div>
        </div>
    `;

    let bodyHtml = '';
    // Show configured fields
    const fieldsToShow = config.formFields || Object.keys(item).filter(k => !['_id', 'id', 'Timestamp', 'lastSeenOnline', 'DisposalEvidence'].includes(k));
    
    fieldsToShow.forEach(fieldId => {
        const fieldDef = AVAILABLE_FIELDS.find(f => f.id === fieldId) || { label: fieldId };
        let val = item[fieldId];
        if (val === undefined || val === null || val === '') val = '-';
        
        if (fieldId === 'Status') {
            let color = 'gray'; let tStatus = t(val.toLowerCase().replace(' ', '_')) || val;
            if (val === 'Active') color = 'green'; else if (val === 'On Loan') color = 'yellow'; else if (val === 'Repair') color = 'orange'; else if (val === 'Storage') color = 'blue'; else if (val === 'Damaged') color = 'red';
            val = `<span class="px-2 py-1 rounded-full text-xs font-bold bg-${color}-100 text-${color}-800 dark:bg-${color}-900/50 dark:text-${color}-300">${tStatus}</span>`;
        }

        bodyHtml += `
            <div class="p-3 bg-white dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">${fieldDef.label}</p>
                <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">${val}</p>
            </div>
        `;
    });

    body.innerHTML = bodyHtml;
    
    const editBtn = document.getElementById('goToEditBtn');
    if (editBtn) {
        editBtn.onclick = () => {
            window.hideModal('viewModal');
            setTimeout(() => window.openModal('edit', collectionName, id), 300);
        };
    }

    window.openModalWindow('viewModal');
};

window.performSnSearch = async function(sn) {
    document.getElementById('modalTitle').textContent = t('searching_sn');
    document.getElementById('modalMessage').textContent = `Searching for: ${sn}...`;
    document.getElementById('modalIcon').innerHTML = '<i class="fas fa-search fa-spin text-4xl text-indigo-500 mb-2"></i>';
    window.openModalWindow('notificationModal');

    try {
        const result = await apiRequest(`/api/inventory/search/serial/${sn}`);
        window.hideModal('notificationModal');
        if (result && result.item) {
            setTimeout(() => {
                window.openViewModal(result.collection, result.item);
            }, 400);
        } else {
            setTimeout(() => window.showNotificationModal('info', 'Not Found', t('sn_not_found')), 400);
        }
    } catch (error) {
        window.hideModal('notificationModal');
        setTimeout(() => window.showNotificationModal('info', 'Not Found', t('sn_not_found')), 400);
    }
};

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

let allData = {};
let currentEdit = { mode: null, collection: null, id: null };
let currentStaffEdit = { mode: null, id: null };
let paginationState = {};
let handoverCart = [];
let returnCart = [];
let refreshIntervalId = null; 
let currentImportCollection = null;
let selectedItems = {}; 
let collectionConfigs = {};
let currentRapidCollection = null;
let currentLabelItems = []; 
let currentLabelCategory = null;
let currentDashboardFolder = null;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user'));
    if (token && user) {
        if(document.getElementById('user-email-display')) document.getElementById('user-email-display').textContent = user.email;
        initTheme();
        initPrintStyles(); 
        injectRapidEntryModal(); 
        initializeAppLogic();
        bindGlobalEventListeners();
        updateUI();
    } else {
        window.location.replace('/login.html');
    }
});

function bindGlobalEventListeners() {
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('newUserEmail').value;
            const password = document.getElementById('newUserPassword').value;
            const errorEl = document.getElementById('addUserError');
            if(password.length < 6) { errorEl.textContent = "Password must be at least 6 characters."; return; }
            try {
                await apiRequest('/api/admins', 'POST', { email, password });
                window.hideModal('addUserModal'); addUserForm.reset(); errorEl.textContent = "";
                showNotificationModal('success', 'Success', 'Admin created successfully.');
                window.renderAdminTable();
            } catch (error) { errorEl.textContent = error.message; }
        });
    }
}

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
        if (refreshIntervalId) clearInterval(refreshIntervalId);
        refreshIntervalId = setInterval(async () => { 
            await refreshAllData();
            const visiblePage = document.querySelector('.page-content.active');
            if (visiblePage && visiblePage.id !== 'dashboard-page') {
                const colName = visiblePage.id.replace('-page', '');
                const realKey = Object.keys(collectionConfigs).find(k => k.toLowerCase() === colName);
                if(realKey) window.buildTable(realKey);
            }
        }, 300000); 
    }
}

window.logout = function() { localStorage.removeItem('authToken'); localStorage.removeItem('user'); window.location.replace('/login.html'); };

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
    } catch (error) { console.error(`API Request Error [${endpoint}]:`, error); throw error; }
}

async function refreshAllData() {
    try {
        allData = await apiRequest('/api/inventory/all');
        const defaultConfigs = {
            Computers: { displayName: 'Computers', headers: ['Last Seen', 'ComputerName', 'SerialNumber', 'UserName', 'Status'], formFields: ['ComputerName', 'Manufacturer', 'Model', 'Type', 'SerialNumber', 'CPU', 'RAM_GB', 'DiskSize_GB', 'OS', 'IPAddress', 'MacAddress', 'UserName', 'Location', 'PurchaseDate', 'WarrantyEndDate', 'Status', 'Description'], nameField: 'ComputerName', serialField: 'SerialNumber', icon: 'fa-laptop', dropdowns: { Status: ['Active', 'On Loan', 'Repair', 'Storage', 'Damaged', 'Disposed'], Type: ['Desktop', 'Laptop', 'MacBook', 'Tablet', 'POS', 'Server', 'Other'] }, isCustom: false },
            Monitors: { displayName: 'Monitors', headers: ['Model', 'MonitorSerial', 'AssignedComputer', 'UserName', 'Status'], formFields: ['Manufacturer', 'Model', 'MonitorSerial', 'UserName', 'Location', 'AssignedComputer', 'PurchaseDate', 'WarrantyEndDate', 'Status', 'Description'], nameField: 'Model', serialField: 'MonitorSerial', icon: 'fa-desktop', dropdowns: { Status: ['Active', 'On Loan', 'Repair', 'Storage', 'Damaged', 'Disposed'] }, isCustom: false },
            Printers: { displayName: 'Printers', headers: ['Last Seen', 'Name', 'AssignedComputer', 'IPAddress', 'Status'], formFields: ['Name', 'Manufacturer', 'Model', 'SerialNumber', 'IPAddress', 'MacAddress', 'Location', 'AssignedComputer', 'UserName', 'PurchaseDate', 'Status', 'Description'], nameField: 'Name', serialField: 'SerialNumber', icon: 'fa-print', dropdowns: { Status: ['Active', 'On Loan', 'Repair', 'Storage', 'Damaged', 'Disposed'] }, isCustom: false },
            Network: { displayName: 'Network Devices', headers: ['Last Seen', 'DeviceName', 'Model', 'IPAddress', 'Status'], formFields: ['DeviceName', 'Manufacturer', 'Model', 'SerialNumber', 'Type', 'IPAddress', 'MacAddress', 'Location', 'PurchaseDate', 'Status', 'Description'], nameField: 'DeviceName', serialField: 'SerialNumber', icon: 'fa-network-wired', dropdowns: { Status: ['Active', 'On Loan', 'Repair', 'Storage', 'Damaged', 'Disposed'], Type: ['Router', 'Switch', 'Access Point', 'Firewall', 'CCTV', 'Other'] }, isCustom: false }
        };
        collectionConfigs = { ...defaultConfigs };
        const customMenus = allData.CustomMenus || [];
        customMenus.forEach(menu => {
            if (!menu.fields || !Array.isArray(menu.fields) || menu.fields.length === 0) return;
            let headerFields = [];
            const hasIP = menu.fields.some(f => f.id === 'IPAddress');
            const hasComputerName = menu.fields.some(f => f.id === 'ComputerName');
            const isComputerCategory = (menu.name === 'Computers');
            if (menu.displayColumns && Array.isArray(menu.displayColumns) && menu.displayColumns.length > 0) {
                headerFields = [...menu.displayColumns];
                if ((hasIP || hasComputerName || isComputerCategory) && !headerFields.includes('Last Seen')) headerFields.unshift('Last Seen');
            } else {
                headerFields = menu.fields.slice(0, 5).map(f => f.id);
                if (!headerFields.includes('Status')) { if (headerFields.length >= 5) headerFields[4] = 'Status'; else headerFields.push('Status'); }
                if ((hasIP || hasComputerName || isComputerCategory) && !headerFields.includes('Last Seen')) headerFields.unshift('Last Seen');
            }
            const nameFieldObj = menu.fields.find(f => ['ComputerName', 'DeviceName', 'ItemName', 'PartName', 'Name', 'SoftwareName', 'Model'].includes(f.id));
            const nameField = nameFieldObj ? nameFieldObj.id : menu.fields[0].id;
            const serialFieldObj = menu.fields.find(f => ['SerialNumber', 'MonitorSerial'].includes(f.id));
            const serialField = serialFieldObj ? serialFieldObj.id : 'SerialNumber';
            collectionConfigs[menu.name] = {
                displayName: menu.displayName || menu.name, headers: headerFields, formFields: menu.fields.map(f => f.id),
                nameField: nameField, serialField: serialField, icon: menu.icon || 'fa-box',
                dropdowns: { Status: ['Active', 'On Loan', 'Repair', 'Storage', 'Damaged', 'Disposed'], Type: ['Desktop', 'Laptop', 'MacBook', 'Tablet', 'POS', 'Server', 'Other'] }, isCustom: true
            };
        });
        const skipKeys = ['Staff', 'CustomMenus', 'TransactionHistory', 'LoanHistory', 'Maintenance Log', 'admins', 'Accessory'];
        Object.keys(allData).forEach(key => {
            if (!skipKeys.includes(key) && Array.isArray(allData[key]) && !collectionConfigs[key]) {
                collectionConfigs[key] = {
                    displayName: key, headers: ['SerialNumber', 'Status'], formFields: ['SerialNumber', 'Status', 'Description'],
                    nameField: 'SerialNumber', serialField: 'SerialNumber', icon: 'fa-box',
                    dropdowns: { Status: ['Active', 'On Loan', 'Repair', 'Storage', 'Damaged', 'Disposed'] }, isCustom: false
                };
            }
        });
        Object.keys(collectionConfigs).forEach(collectionName => {
            if (!paginationState[collectionName]) paginationState[collectionName] = { currentPage: 1, rowsPerPage: 10, filterText: '', categoryFilter: null, statusFilter: '' };
            if (!selectedItems[collectionName]) selectedItems[collectionName] = [];
        });
        let staffList = allData.Staff || [];
        let existingUsernames = new Set(staffList.map(s => (s.UserName || '').toLowerCase()));
        Object.keys(allData).forEach(key => {
            if (!['Staff', 'CustomMenus', 'TransactionHistory', 'LoanHistory', 'Maintenance Log', 'admins', 'Software'].includes(key) && Array.isArray(allData[key])) {
                allData[key].forEach(item => {
                    if (item.UserName && item.UserName.trim() !== '') {
                        let uname = item.UserName.trim();
                        if (!existingUsernames.has(uname.toLowerCase())) {
                            staffList.push({ id: 'auto-' + Date.now() + Math.random(), UserName: uname, FirstName: 'Auto', LastName: 'Detected', Department: 'N/A', isAuto: true });
                            existingUsernames.add(uname.toLowerCase());
                        }
                    }
                });
            }
        });
        allData.Staff = staffList;
        return true;
    } catch (error) {
        const loadingDiv = document.getElementById('loading-state');
        if(loadingDiv) loadingDiv.innerHTML = `<div class="text-center p-6"><i class="fas fa-exclamation-triangle text-5xl text-red-500 mb-4"></i><h3 class="text-xl font-bold text-gray-800 dark:text-white">Connection Failed</h3><p class="text-gray-500 dark:text-gray-400 mt-2">${error.message}</p><button onclick="location.reload()" class="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">Retry</button></div>`;
        return false;
    }
}

async function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader(); reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result); reader.onerror = error => reject(error);
    });
}

window.viewDisposalEvidence = function(base64Data) {
    if (!base64Data) return alert("ไม่พบเอกสารแนบในระบบ");
    const newWindow = window.open();
    if (base64Data.startsWith('data:application/pdf')) newWindow.document.write(`<iframe src="${base64Data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
    else newWindow.document.write(`<div style="display:flex; justify-content:center; align-items:center; min-height:100vh; background:#333;"><img src="${base64Data}" style="max-width:100%; max-height:100vh; box-shadow:0 0 20px rgba(0,0,0,0.5);" /></div>`);
};

window.renderDisposedAssets = function() {
    const tbody = document.getElementById('disposedTableBody');
    if (!tbody) return;
    let html = ''; let disposedCount = 0;
    for (const [collection, items] of Object.entries(allData)) {
        if (['Staff', 'CustomMenus', 'TransactionHistory', 'admins', 'LoanHistory', 'Maintenance Log'].includes(collection)) continue;
        if (!Array.isArray(items)) continue; 
        const disposedItems = items.filter(i => i.Status === 'Disposed');
        disposedItems.forEach(item => {
            disposedCount++;
            const config = collectionConfigs[collection];
            const nameField = config ? config.nameField : 'SerialNumber';
            const name = item[nameField] || item.ComputerName || item.ItemName || 'Unknown Device';
            const serial = item.SerialNumber || item.MonitorSerial || 'N/A';
            const date = item.DisposalDate ? new Date(item.DisposalDate).toLocaleDateString('th-TH') : '-';
            let evidenceBtn = '<span class="text-gray-400 text-xs italic">ไม่มีเอกสาร</span>';
            if (item.DisposalEvidence) evidenceBtn = `<button onclick="window.viewDisposalEvidence(this.getAttribute('data-file'))" data-file="${item.DisposalEvidence}" class="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-xs font-bold shadow-sm transition"><i class="fas fa-file-pdf mr-1"></i> ${t('view_evidence')}</button>`;
            html += `<tr class="hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"><td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100"><i class="fas fa-box text-red-400 mr-2"></i> ${name}<div class="text-xs text-gray-500 font-normal ml-6 mt-1">From: ${collection}</div></td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">${serial}</td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">${date}</td><td class="px-6 py-4 whitespace-nowrap text-center">${evidenceBtn}</td></tr>`;
        });
    }
    if (disposedCount === 0) html = `<tr><td colspan="4" class="px-6 py-10 text-center text-gray-500">${t('no_data')}</td></tr>`;
    tbody.innerHTML = html;
};

function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const darkIcon = document.getElementById('theme-icon');
    if (!themeToggleBtn) return;
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            if (darkIcon) { darkIcon.classList.remove('fa-moon', 'text-gray-600'); darkIcon.classList.add('fa-sun', 'text-yellow-400'); }
            if(document.getElementById('theme-text')) document.getElementById('theme-text').textContent = t('light_mode');
        } else {
            document.documentElement.classList.remove('dark');
            if (darkIcon) { darkIcon.classList.remove('fa-sun', 'text-yellow-400'); darkIcon.classList.add('fa-moon', 'text-gray-600'); }
            if(document.getElementById('theme-text')) document.getElementById('theme-text').textContent = t('dark_mode');
        }
        localStorage.setItem('color-theme', theme);
    }
    const savedTheme = localStorage.getItem('color-theme');
    const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && sysDark)) applyTheme('dark'); else applyTheme('light');
    themeToggleBtn.addEventListener('click', () => { const isDark = document.documentElement.classList.contains('dark'); applyTheme(isDark ? 'light' : 'dark'); });
}

function initPrintStyles() {
    const style = document.createElement('style');
    style.innerHTML = `@media print { body * { visibility: hidden; } #print-area, #print-area * { visibility: visible; } #print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; border: none !important; } .label-page { page-break-after: always; page-break-inside: avoid; margin: 0; padding: 0; box-sizing: border-box; background-color: white; } .label-page.preview-border { border: none !important; box-shadow: none !important; } .no-print { display: none !important; } }`;
    document.head.appendChild(style);
}

window.formatTimeAgo = (dateString) => {
    if (!dateString) return t('unknown');
    const diffMins = Math.floor((new Date() - new Date(dateString)) / 60000);
    if (diffMins < 1) return t('just_now'); if (diffMins < 60) return `${diffMins} ${t('mins_ago')}`; if (diffMins < 1440) return `${Math.floor(diffMins / 60)} ${t('hours_ago')}`; if (diffMins < 10080) return `${Math.floor(diffMins / 1440)} ${t('days_ago')}`;
    return new Date(dateString).toLocaleDateString('th-TH');
};

function renderSidebarDynamic() {
    const container = document.getElementById('sidebar-menu-container');
    if (!container) return; container.innerHTML = ''; 
    const dashboardNode = { id: 'Dashboard', name: t('dashboard'), icon: 'fa-tachometer-alt', children: [], isSystem: true, clickAction: "window.loadPage('Dashboard', this)" };
    const assetChildren = [
        { id: 'Computers', name: t('computers'), icon: 'fa-laptop', isSystem: true, clickAction: "window.loadPage('Computers', this)" },
        { id: 'Monitors', name: t('monitors'), icon: 'fa-desktop', isSystem: true, clickAction: "window.loadPage('Monitors', this)" },
        { id: 'Printers', name: t('printers'), icon: 'fa-print', isSystem: true, clickAction: "window.loadPage('Printers', this)" },
        { id: 'Network', name: t('network'), icon: 'fa-network-wired', isSystem: true, clickAction: "window.loadPage('Network', this)" }
    ];
    const managementChildren = [
        { id: 'Transactions', name: t('transactions'), icon: 'fa-tasks', isSystem: true, children: [{ id: 'Handover', name: t('handover_return_title'), icon: 'fa-dolly-flatbed', isSystem: true, clickAction: "window.loadPage('Handover', this)" }, { id: 'LoanPage', name: t('loan_page_user'), icon: 'fa-external-link-alt', isSystem: true, clickAction: "window.open('loan.html', '_blank')" }] },
        { id: 'Reports', name: t('reports'), icon: 'fa-file-alt', isSystem: true, children: [{ id: 'LoanHistory', name: t('loan_history'), icon: 'fa-history', isSystem: true, clickAction: "window.loadPage('LoanHistory', this)" }, { id: 'Maintenance', name: t('maintenance_history'), icon: 'fa-tools', isSystem: true, clickAction: "window.loadPage('Maintenance', this)" }, { id: 'AssetsByUser', name: t('assets_by_user'), icon: 'fa-user-tag', isSystem: true, clickAction: "window.loadPage('AssetsByUser', this)" }, { id: 'DisposedAssets', name: t('disposed_assets'), icon: 'fa-trash-alt', isSystem: true, clickAction: "window.loadPage('DisposedAssets', this)" }] },
        { id: 'UserSettings', name: t('system_settings'), icon: 'fa-cogs', isSystem: true, children: [{ id: 'StaffManagement', name: t('staff_management'), icon: 'fa-users', isSystem: true, clickAction: "window.loadPage('StaffManagement', this)" }, { id: 'AdminManagement', name: t('admin_management'), icon: 'fa-user-shield', isSystem: true, clickAction: "window.loadPage('AdminManagement', this)" }, { id: 'LabelPrinter', name: t('label_printer'), icon: 'fa-tags', isSystem: true, clickAction: "window.loadPage('LabelPrinter', this)" }, { id: 'Settings', name: t('custom_categories'), icon: 'fa-sliders-h', isSystem: true, clickAction: "window.loadPage('Settings', this)" }] }
    ];
    const customMenus = allData.CustomMenus || [];
    const customNodes = customMenus.filter(m => collectionConfigs[m.name] && !['Computers','Monitors','Printers','Network'].includes(m.name)).sort((a, b) => (a.order || 0) - (b.order || 0) || a.displayName.localeCompare(b.displayName)).map(m => ({ id: m.name, name: m.displayName, icon: m.icon, isSystem: false, parentId: m.parentId, clickAction: `window.loadPage('${m.name}', this)`, allowDelete: true, allowEdit: true, order: m.order }));
    const allKnown = ['Computers', 'Monitors', 'Printers', 'Network', ...customNodes.map(n => n.id)];
    Object.keys(collectionConfigs).forEach(key => { if (!allKnown.includes(key)) customNodes.push({ id: key, name: collectionConfigs[key].displayName, icon: 'fa-box', isSystem: false, parentId: null, clickAction: `window.loadPage('${key}', this)`, allowDelete: false, allowEdit: true, order: 99 }); });
    const rootNodes = [dashboardNode, { type: 'header', label: t('assets') }, ...assetChildren, ...customNodes.filter(n => !n.parentId), { type: 'header', label: t('management') }, ...managementChildren];
    const nodeMap = {}; [...rootNodes, ...customNodes].forEach(n => { if(n.id) nodeMap[n.id] = n; });
    customNodes.forEach(node => { if (node.parentId && nodeMap[node.parentId]) { if (!nodeMap[node.parentId].children) nodeMap[node.parentId].children = []; if (!nodeMap[node.parentId].children.find(c => c.id === node.id)) { nodeMap[node.parentId].children.push(node); nodeMap[node.parentId].children.sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name)); } } });

    function createMenuHTML(node) {
        if (node.type === 'header') return `<li class="pt-4"><div class="px-4 text-xs font-semibold uppercase text-gray-400 mb-1">${node.label}</div></li>`;
        const hasChildren = node.children && node.children.length > 0;
        const editBtn = node.allowEdit ? `<button onclick="window.openEditMenuModal('${node.id}', event)" class="ml-2 text-xs text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"><i class="fas fa-edit"></i></button>` : '';
        const deleteBtn = node.allowDelete ? `<button onclick="window.deleteCustomMenu('${node.id}', event)" class="ml-2 text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><i class="fas fa-trash"></i></button>` : '';
        let textColor = node.id === 'DisposedAssets' ? 'text-red-500 dark:text-red-400' : 'text-gray-600 dark:text-gray-300';
        if (hasChildren) return `<li><details class="group nav-group"><summary class="nav-link flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"><div class="flex items-center space-x-3"><i class="fas ${node.icon} w-5 text-center"></i><span>${node.name}</span></div><div class="flex items-center">${editBtn}${deleteBtn}<i class="fas fa-chevron-right text-xs transform group-open:rotate-90 transition-transform ml-2"></i></div></summary><ul class="pl-4 pt-1 space-y-1 border-l-2 border-gray-100 dark:border-gray-700 ml-6">${node.children.map(createMenuHTML).join('')}</ul></details></li>`;
        return `<li><a href="#" id="nav-${node.id}" onclick="${node.clickAction}; return false;" class="nav-link flex items-center space-x-3 px-4 py-2.5 rounded-lg ${textColor} group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><i class="fas ${node.icon} w-5 text-center"></i><span class="flex-1">${node.name}</span>${editBtn}${deleteBtn}</a></li>`;
    }
    rootNodes.forEach(node => { if (node.type === 'header' || !node.parentId) container.insertAdjacentHTML('beforeend', createMenuHTML(node)); });
}

function generateDynamicPages() {
    const container = document.getElementById('dynamic-pages-container');
    if (!container) return; container.innerHTML = ''; 
    Object.keys(collectionConfigs).forEach(colName => {
        const config = collectionConfigs[colName]; if (!config) return;
        const pageId = `${colName.toLowerCase()}-page`;
        const displayName = config.isCustom ? config.displayName : t(colName.toLowerCase()) || config.displayName || colName;
        const statusOptions = config.dropdowns.Status ? config.dropdowns.Status.map(s => `<option value="${s}">${t(s.toLowerCase().replace(' ', '_')) || s}</option>`).join('') : '';
        container.innerHTML += `<div id="${pageId}" class="page-content hidden"><div class="flex flex-wrap justify-between items-center gap-2 mb-6"><h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">${displayName}</h2><div class="flex gap-2"><button onclick="window.openRapidEntryModal('${colName}')" class="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 shadow-sm flex items-center transition-colors"><i class="fas fa-barcode mr-2"></i>${t('rapid_scan')}</button><button onclick="window.openImportModal('${colName}')" class="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 shadow-sm"><i class="fas fa-file-import mr-2"></i>${t('import_csv')}</button><button onclick="window.openModal('add', '${colName}')" class="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 shadow-sm"><i class="fas fa-plus mr-2"></i>${t('add_new')}</button></div></div><div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6" id="${colName}SummaryCards"></div><div class="mb-4 flex flex-col md:flex-row gap-2"><div class="w-full md:w-1/4"><select onchange="window.handleStatusFilter('${colName}', this.value)" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"><option value="">${t('all_statuses')}</option>${statusOptions}</select></div><div class="w-full md:w-3/4"><input type="text" id="${colName.toLowerCase()}SearchInput" onkeyup="window.handleSearch('${colName}', this.value)" placeholder="${t('search')}" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"></div></div><div id="${colName}BulkActions" class="hidden mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg flex items-center justify-between"><div class="text-indigo-800 dark:text-indigo-200 text-sm font-semibold"><i class="fas fa-check-square mr-1"></i> <span class="selected-count">0 ${t('items')}</span></div><div class="flex space-x-2"><button onclick="window.openBulkEditModal('${colName}')" class="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 shadow-sm"><i class="fas fa-edit mr-1"></i>${t('bulk_edit')}</button><button onclick="window.bulkDelete('${colName}')" class="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 shadow-sm"><i class="fas fa-trash mr-1"></i>${t('bulk_delete')}</button></div></div><div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700"><div class="overflow-x-auto"><table id="${colName}Table" class="min-w-full table-fixed"></table></div></div><div id="${colName}Pagination" class="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-300"></div></div>`;
    });
}

window.loadPage = function(pageName, navElement) {
    document.querySelectorAll('.nav-link').forEach(l => { l.classList.remove('bg-indigo-50', 'text-indigo-600', 'dark:bg-gray-700', 'dark:text-white', 'font-semibold'); l.classList.add('text-gray-600', 'dark:text-gray-300'); });
    document.querySelectorAll('.page-content').forEach(p => { p.classList.remove('active'); p.classList.add('hidden'); p.style.display = 'none'; });
    let targetNav = navElement || document.getElementById(`nav-${pageName}`);
    if (targetNav) { targetNav.classList.remove('text-gray-600', 'dark:text-gray-300'); targetNav.classList.add('bg-indigo-50', 'text-indigo-600', 'dark:bg-gray-700', 'dark:text-white', 'font-semibold'); const parentDetails = targetNav.closest('details'); if (parentDetails) parentDetails.setAttribute('open', 'true'); }
    const pageId = `${pageName.toLowerCase()}-page`;
    let pageDiv = document.getElementById(pageId);
    if (pageName === 'LabelPrinter' && !pageDiv) { pageDiv = document.createElement('div'); pageDiv.id = pageId; pageDiv.className = 'page-content hidden'; document.getElementById('main-content').appendChild(pageDiv); }
    if (pageDiv) {
        pageDiv.classList.remove('hidden'); pageDiv.classList.add('active'); pageDiv.style.display = 'block';
        if (pageName === 'Dashboard') window.updateDashboard(null); 
        else if (pageName === 'LoanHistory') window.buildLoanHistoryCards();
        else if (pageName === 'Maintenance') window.buildMaintenancePage();
        else if (pageName === 'AssetsByUser') window.buildAssetsByUserPage();
        else if (pageName === 'Handover') window.buildHandoverReturnPage();
        else if (pageName === 'StaffManagement') window.buildStaffManagementPage();
        else if (pageName === 'AdminManagement') window.buildAdminManagementPage();
        else if (pageName === 'DisposedAssets') window.renderDisposedAssets();
        else if (pageName === 'Settings') window.renderSettings();
        else if (pageName === 'LabelPrinter') window.buildLabelPrinterPage();
        else if (collectionConfigs[pageName]) { if (paginationState[pageName]) { paginationState[pageName].filterText = ''; const searchInput = document.getElementById(`${pageName.toLowerCase()}SearchInput`); if (searchInput) searchInput.value = ''; window.buildTable(pageName); } }
    }
    if (window.innerWidth < 768) { const sidebar = document.getElementById('sidebar'); const overlay = document.getElementById('sidebar-overlay'); if(sidebar) sidebar.classList.add('-translate-x-full'); if(overlay) overlay.classList.add('hidden'); }
};

window.renderSettings = function() {
    const area = document.getElementById('settings-content-area');
    if (!area) return;
    let html = `<div class="mb-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"><h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4"><i class="fas fa-plus-circle text-indigo-500 mr-2"></i>Create Custom Category</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"><div><label class="block text-xs text-gray-500 uppercase tracking-wider mb-1">Database ID (e.g. Projectors)</label><input type="text" id="newMenuIdSettings" placeholder="No spaces" class="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700"></div><div><label class="block text-xs text-gray-500 uppercase tracking-wider mb-1">Display Name</label><input type="text" id="newMenuNameSettings" placeholder="Display Name" class="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700"></div><div><label class="block text-xs text-gray-500 uppercase tracking-wider mb-1">Icon (FontAwesome Class)</label><input type="text" id="newMenuIconSettings" placeholder="e.g., fa-video" class="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700"></div></div><button onclick="window.openAddMenuModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition shadow-sm">Advanced Configuration / Create</button></div><h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">Existing Custom Categories</h3><ul class="space-y-3">`;
    const customMenus = allData.CustomMenus || [];
    if (customMenus.length === 0) html += `<p class="text-gray-500 text-sm">No custom categories created yet.</p>`;
    else { customMenus.forEach(menu => { html += `<li class="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"><div class="flex items-center"><div class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4"><i class="fas ${menu.icon || 'fa-box'}"></i></div><div><strong class="text-gray-800 dark:text-white block">${menu.displayName}</strong><span class="text-xs text-gray-500">ID: ${menu.name} • Fields: ${menu.fields ? menu.fields.length : 0}</span></div></div><div><button onclick="window.cloneCustomMenu('${menu.name}', event)" class="text-green-500 hover:text-green-700 mr-3 p-2"><i class="fas fa-copy"></i></button><button onclick="window.openEditMenuModal('${menu.name}', event)" class="text-blue-500 hover:text-blue-700 mr-3 p-2"><i class="fas fa-edit"></i></button><button onclick="window.deleteCustomMenu('${menu.name}', event)" class="text-red-500 hover:text-red-700 p-2"><i class="fas fa-trash"></i></button></div></li>`; }); }
    html += `</ul>`; area.innerHTML = html;
};

window.openAddMenuModal = function() {
    const form = document.getElementById('addMenuForm'); if (form) form.reset();
    document.getElementById('addMenuModalTitle').innerHTML = `<i class="fas fa-folder-plus text-indigo-500 mr-2"></i> Create Custom Menu`; document.getElementById('editMenuMode').value = "create";
    const idInput = document.getElementById('newMenuIdSettings'); const nameInput = document.getElementById('newMenuNameSettings'); const iconInput = document.getElementById('newMenuIconSettings');
    if(idInput && idInput.value) document.getElementById('newMenuId').value = idInput.value; if(nameInput && nameInput.value) document.getElementById('newMenuDisplay').value = nameInput.value; if(iconInput && iconInput.value) document.getElementById('newMenuIcon').value = iconInput.value;
    document.getElementById('newMenuId').disabled = false; document.getElementById('newMenuId').classList.remove('bg-gray-200', 'cursor-not-allowed'); window.populateParentDropdown();
    document.querySelectorAll('.col-checkbox').forEach(cb => { if(!cb.disabled) cb.checked = true; }); document.querySelectorAll('.display-checkbox').forEach(cb => { cb.disabled = false; cb.checked = false; });
    ['SerialNumber', 'ItemName', 'Status', 'UserName', 'Location'].forEach(id => { const cb = document.getElementById(`display_${id}`); if(cb) cb.checked = true; });
    window.openModalWindow('addMenuModal');
};

window.openEditMenuModal = function(menuName, event) {
    if (event) event.stopPropagation(); const menu = allData.CustomMenus.find(m => m.name === menuName); if (!menu) return;
    document.getElementById('addMenuModalTitle').innerHTML = `<i class="fas fa-edit text-indigo-500 mr-2"></i> Edit Custom Menu`; document.getElementById('editMenuMode').value = "edit"; document.getElementById('newMenuId').value = menu.name; document.getElementById('newMenuId').disabled = true; document.getElementById('newMenuId').classList.add('bg-gray-200', 'cursor-not-allowed'); document.getElementById('newMenuDisplay').value = menu.displayName; document.getElementById('newMenuIcon').value = menu.icon || 'fa-box'; document.getElementById('newMenuOrder').value = menu.order || 0; window.populateParentDropdown(menu.parentId); 
    document.querySelectorAll('.col-checkbox').forEach(cb => cb.checked = false); document.querySelectorAll('.display-checkbox').forEach(cb => { cb.checked = false; cb.disabled = true; });
    if (menu.fields && Array.isArray(menu.fields)) { menu.fields.forEach(f => { const cb = document.getElementById(`field_${f.id}`); if(cb) cb.checked = true; const dCb = document.getElementById(`display_${f.id}`); if(dCb) dCb.disabled = false; }); }
    if (menu.displayColumns && Array.isArray(menu.displayColumns)) { menu.displayColumns.forEach(id => { const dCb = document.getElementById(`display_${id}`); if(dCb) dCb.checked = true; }); } else { const fallbackHeaders = menu.fields ? menu.fields.slice(0, 5).map(f => f.id) : []; if (!fallbackHeaders.includes('Status')) fallbackHeaders.push('Status'); fallbackHeaders.forEach(id => { const dCb = document.getElementById(`display_${id}`); if(dCb) dCb.checked = true; }); }
    window.openModalWindow('addMenuModal');
};

window.cloneCustomMenu = function(menuName, event) {
    if (event) event.stopPropagation(); const menu = allData.CustomMenus.find(m => m.name === menuName); if (!menu) return;
    document.getElementById('addMenuModalTitle').innerHTML = `<i class="fas fa-copy text-green-500 mr-2"></i> Clone Custom Menu`; document.getElementById('editMenuMode').value = "create"; document.getElementById('newMenuId').value = menu.name + "Copy"; document.getElementById('newMenuId').disabled = false; document.getElementById('newMenuId').classList.remove('bg-gray-200', 'cursor-not-allowed'); document.getElementById('newMenuDisplay').value = menu.displayName + " (Copy)"; document.getElementById('newMenuIcon').value = menu.icon || 'fa-box'; document.getElementById('newMenuOrder').value = menu.order || 0; window.populateParentDropdown(menu.parentId); 
    document.querySelectorAll('.col-checkbox').forEach(cb => cb.checked = false); document.querySelectorAll('.display-checkbox').forEach(cb => { cb.checked = false; cb.disabled = true; });
    if (menu.fields && Array.isArray(menu.fields)) { menu.fields.forEach(f => { const cb = document.getElementById(`field_${f.id}`); if(cb) cb.checked = true; const dCb = document.getElementById(`display_${f.id}`); if(dCb) dCb.disabled = false; }); }
    if (menu.displayColumns && Array.isArray(menu.displayColumns)) { menu.displayColumns.forEach(id => { const dCb = document.getElementById(`display_${id}`); if(dCb) dCb.checked = true; }); } else { const fallbackHeaders = menu.fields ? menu.fields.slice(0, 5).map(f => f.id) : []; if (!fallbackHeaders.includes('Status')) fallbackHeaders.push('Status'); fallbackHeaders.forEach(id => { const dCb = document.getElementById(`display_${id}`); if(dCb) dCb.checked = true; }); }
    window.openModalWindow('addMenuModal');
};

window.openModalWindow = function(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('show');
    modal.offsetHeight; // Force reflow
    modal.classList.remove('opacity-0', 'pointer-events-none');
    if (modal.querySelector('.modal-content')) { 
        modal.querySelector('.modal-content').classList.remove('scale-95'); 
        modal.querySelector('.modal-content').classList.add('scale-100'); 
    }
}

window.populateParentDropdown = function(selectedParentId = null) {
    const parentSelect = document.getElementById('newMenuParent'); if (!parentSelect) return; parentSelect.innerHTML = '<option value="">(None - Root Level)</option>'; const currentEditingId = document.getElementById('newMenuId').value;
    (allData.CustomMenus || []).forEach(menu => { if(collectionConfigs[menu.name] && menu.name !== currentEditingId) { const selected = menu.name === selectedParentId ? 'selected' : ''; parentSelect.innerHTML += `<option value="${menu.name}" ${selected}>${menu.displayName}</option>`; } });
};

function initColumnSelector() {
    const colContainer = document.getElementById('column-selector-container'); if(!colContainer) return; colContainer.innerHTML = '';
    const groups = {}; AVAILABLE_FIELDS.forEach(field => { const grp = field.group || 'Other'; if (!groups[grp]) groups[grp] = []; groups[grp].push(field); });
    let html = `<div class="flex justify-between items-end text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2 border-b dark:border-gray-700 pb-2"><span class="w-2/3">ชื่อฟิลด์ (Field Name)</span><div class="w-1/3 flex justify-between text-center"><span class="w-1/2" title="แสดงให้กรอกในแบบฟอร์ม">ในฟอร์ม</span><span class="w-1/2 text-green-600 dark:text-green-500" title="แสดงเป็นคอลัมน์ในตาราง Data Table">ในตาราง</span></div></div>`;
    for (const [groupName, fields] of Object.entries(groups)) {
        html += `<div class="col-span-full mt-2 mb-1 bg-gray-100 dark:bg-gray-800/50 px-2 py-1 rounded"><h4 class="text-sm font-bold text-indigo-600 dark:text-indigo-400">${groupName}</h4></div>`;
        fields.forEach(field => {
            const isRequired = field.id === 'SerialNumber' || field.id === 'ItemName' || field.id === 'Status'; 
            html += `<div class="flex items-center justify-between py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"><div class="w-2/3 flex items-center"><label for="field_${field.id}" class="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none flex items-center">${field.label} ${isRequired ? '<span class="text-xs text-red-500 ml-1" title="จำเป็นต้องมี">*</span>' : ''}</label></div><div class="w-1/3 flex justify-between items-center text-center"><div class="w-1/2 flex justify-center"><input type="checkbox" id="field_${field.id}" value="${field.id}" ${isRequired ? 'checked disabled' : 'checked'} onchange="window.toggleFieldDisplay('${field.id}')" class="col-checkbox rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"></div><div class="w-1/2 flex justify-center"><input type="checkbox" id="display_${field.id}" value="${field.id}" ${isRequired ? 'checked' : ''} class="display-checkbox rounded text-green-500 focus:ring-green-500 w-4 h-4 cursor-pointer" title="แสดงฟิลด์นี้เป็นคอลัมน์ในตาราง"></div></div></div>`;
        });
    }
    colContainer.innerHTML = html;
}
setTimeout(initColumnSelector, 1000);

window.toggleFieldDisplay = function(fieldId) {
    const fieldCb = document.getElementById(`field_${fieldId}`); const displayCb = document.getElementById(`display_${fieldId}`);
    if (fieldCb && displayCb) { if (!fieldCb.checked) { displayCb.checked = false; displayCb.disabled = true; } else { displayCb.disabled = false; } }
};

window.saveCustomMenu = async function() {
    const mode = document.getElementById('editMenuMode').value; const idInput = document.getElementById('newMenuId').value.trim(); const displayInput = document.getElementById('newMenuDisplay').value.trim(); const iconInput = document.getElementById('newMenuIcon').value; const parentInput = document.getElementById('newMenuParent').value; const orderInput = document.getElementById('newMenuOrder').value;
    if (!idInput || !displayInput) return showNotificationModal('warning', 'Missing Info', 'Please fill Menu Name and Display Name.');
    if (mode === 'create' && !/^[a-zA-Z0-9]+$/.test(idInput)) return showNotificationModal('warning', 'Invalid Name', 'Menu ID must only contain letters and numbers.');
    const selectedFields = []; document.querySelectorAll('.col-checkbox').forEach(cb => { if(cb.checked || cb.disabled) selectedFields.push(AVAILABLE_FIELDS.find(f => f.id === cb.value) || { id: cb.value, label: cb.value, type: 'text' }); });
    const selectedDisplayColumns = []; document.querySelectorAll('.display-checkbox').forEach(cb => { if(cb.checked) { selectedDisplayColumns.push(cb.value); } });
    if (selectedDisplayColumns.length === 0) return showNotificationModal('warning', 'Missing Columns', 'กรุณาเลือกคอลัมน์ที่จะให้แสดงในตารางอย่างน้อย 1 คอลัมน์ (ติ๊กช่อง "ในตาราง")');
    const payload = { name: idInput, displayName: displayInput, icon: iconInput, parentId: parentInput || null, order: orderInput, fields: selectedFields, displayColumns: selectedDisplayColumns };
    try {
        if (mode === 'edit') await apiRequest(`/api/custom-menus/${idInput}`, 'PUT', payload); else await apiRequest('/api/custom-menus', 'POST', payload);
        showNotificationModal('success', 'Menu Updated', `Custom menu saved.`); window.hideModal('addMenuModal'); await initializeAppLogic(); if(document.getElementById('settings-page').style.display === 'block') window.renderSettings();
    } catch (error) { showNotificationModal('warning', 'Error', error.message); }
};

window.deleteCustomMenu = async function(menuName, event) {
    if (event) event.stopPropagation(); if (!confirm(`Delete menu "${menuName}"? Data will NOT be deleted.`)) return;
    try { await apiRequest(`/api/custom-menus/${menuName}`, 'DELETE'); showNotificationModal('success', 'Deleted', `Menu deleted.`); await initializeAppLogic(); if(document.getElementById('settings-page').style.display === 'block') window.renderSettings(); } catch (error) { showNotificationModal('warning', 'Cannot Delete', error.message); }
};

window.toggleSelectAll = function(collectionName, checkbox) {
    const isChecked = checkbox.checked; const checkboxes = document.querySelectorAll(`.${collectionName}-row-cb`); selectedItems[collectionName] = selectedItems[collectionName] || [];
    checkboxes.forEach(cb => { cb.checked = isChecked; if (isChecked && !selectedItems[collectionName].includes(cb.value)) selectedItems[collectionName].push(cb.value); else if (!isChecked) selectedItems[collectionName] = selectedItems[collectionName].filter(id => id !== cb.value); });
    window.updateBulkActionBar(collectionName);
};

window.toggleSelectItem = function(collectionName, checkbox) {
    selectedItems[collectionName] = selectedItems[collectionName] || [];
    if (checkbox.checked) { if (!selectedItems[collectionName].includes(checkbox.value)) selectedItems[collectionName].push(checkbox.value); } else { selectedItems[collectionName] = selectedItems[collectionName].filter(id => id !== checkbox.value); document.getElementById(`selectAll_${collectionName}`).checked = false; }
    window.updateBulkActionBar(collectionName);
};

window.updateBulkActionBar = function(collectionName) {
    const count = (selectedItems[collectionName] || []).length; const bar = document.getElementById(`${collectionName}BulkActions`); if (!bar) return;
    if (count > 0) { bar.classList.remove('hidden'); bar.querySelector('.selected-count').textContent = `${count} ${t('items')}`; } else { bar.classList.add('hidden'); document.getElementById(`selectAll_${collectionName}`).checked = false; }
};

window.bulkDelete = async function(collectionName) {
    const ids = selectedItems[collectionName] || []; if (ids.length === 0) return;
    if (!confirm(`Are you sure you want to permanently delete ${ids.length} selected item(s)?`)) return;
    try { await apiRequest(`/api/inventory/${collectionName}/bulk-delete`, 'POST', { ids }); showNotificationModal('success', 'Bulk Delete Successful', `Deleted ${ids.length} item(s).`); selectedItems[collectionName] = []; await refreshAllData(); window.buildTable(collectionName); window.updateDashboard(currentDashboardFolder); } catch (error) { showNotificationModal('warning', 'Bulk Delete Failed', error.message); }
};

window.openBulkEditModal = function(collectionName) {
    const ids = selectedItems[collectionName] || []; if (ids.length === 0) return; const config = collectionConfigs[collectionName]; if (!config) return;
    document.getElementById('bulkEditCollection').value = collectionName; document.getElementById('bulkEditCount').textContent = ids.length; const formContainer = document.getElementById('bulkEditDynamicForm'); formContainer.innerHTML = ''; 
    let formHtml = '<div class="col-span-full mb-2 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-300"><i class="fas fa-info-circle mr-2"></i><strong>คำแนะนำ:</strong> กรอกเฉพาะช่องที่คุณต้องการแก้ไข ระบบจะ <u>ข้ามช่องที่ปล่อยว่างไว้</u> (ไม่นำไปทับข้อมูลเดิม)</div><div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">';
    config.formFields.forEach(fieldId => {
        if (fieldId === 'SerialNumber' || fieldId === 'MonitorSerial') return;
        const fieldDef = AVAILABLE_FIELDS.find(f => f.id === fieldId) || { label: fieldId, type: 'text' }; const dropdown = config.dropdowns && config.dropdowns[fieldId];
        formHtml += `<div class="col-span-1 relative"><label class="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">${fieldDef.label}</label>`;
        const inputClasses = `bulk-edit-input w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm`;
        if (dropdown) { formHtml += `<select name="${fieldId}" class="${inputClasses} appearance-none"><option value="">-- ไม่เปลี่ยนแปลง --</option>${dropdown.map(opt => `<option value="${opt}">${opt}</option>`).join('')}</select><div class="pointer-events-none absolute inset-y-0 right-0 top-5 flex items-center px-4 text-gray-500"><i class="fas fa-chevron-down text-xs"></i></div>`; } else if (fieldDef.type === 'date') { formHtml += `<input type="date" name="${fieldId}" class="${inputClasses}">`; } else if (fieldDef.type === 'number') { formHtml += `<input type="number" name="${fieldId}" class="${inputClasses}" placeholder="เว้นว่างถ้าไม่ต้องการแก้">`; } else if (fieldDef.type === 'textarea') { formHtml += `<textarea name="${fieldId}" rows="1" class="${inputClasses}" placeholder="เว้นว่างถ้าไม่ต้องการแก้"></textarea>`; } else { formHtml += `<input type="text" name="${fieldId}" class="${inputClasses}" placeholder="เว้นว่างถ้าไม่ต้องการแก้">`; } formHtml += `</div>`;
    });
    formHtml += '</div>'; formContainer.innerHTML = formHtml; window.openModalWindow('bulkEditModal');
};

window.saveBulkEdit = async function() {
    const collectionName = document.getElementById('bulkEditCollection').value; const ids = selectedItems[collectionName] || []; const updateData = {};
    document.querySelectorAll('.bulk-edit-input').forEach(input => { const val = input.value.trim(); if (val !== '') { updateData[input.name] = val; } });
    if (Object.keys(updateData).length === 0) { window.hideModal('bulkEditModal'); return showNotificationModal('info', 'ไม่มีการเปลี่ยนแปลง', 'คุณไม่ได้กรอกข้อมูลใดๆ เพื่อแก้ไขระบบจึงยกเลิกคำสั่ง'); }
    try { const response = await apiRequest(`/api/inventory/${collectionName}/bulk-update`, 'PUT', { ids, updateData }); showNotificationModal('success', 'Bulk Update Successful', response.message || `อัปเดตข้อมูลเรียบร้อยแล้ว`); window.hideModal('bulkEditModal'); selectedItems[collectionName] = []; await refreshAllData(); window.buildTable(collectionName); window.updateDashboard(currentDashboardFolder); } catch (error) { showNotificationModal('warning', 'Bulk Update Failed', error.message); }
};

window.buildTable = function(collectionName) {
    const table = document.getElementById(collectionName + 'Table'); if (!table) return;
    const state = paginationState[collectionName]; const fullData = allData[collectionName] || []; const config = collectionConfigs[collectionName];
    let filteredData = fullData.filter(i => i.Status !== 'Disposed');
    const summaryContainer = document.getElementById(`${collectionName}SummaryCards`);
    if (summaryContainer) {
        const rawData = fullData.filter(i => i.Status !== 'Disposed'); const total = rawData.length; let onlineCount = 0; let offlineCount = 0; let storageCount = 0; let activeCount = 0; let issueCount = 0; 
        rawData.forEach(item => {
            if (item.Status === 'Storage') storageCount++; else if (item.Status === 'Active' || item.Status === 'On Loan') activeCount++; else if (item.Status === 'Repair' || item.Status === 'Damaged') issueCount++;
            const lastSeen = item.lastSeenOnline; if (lastSeen) { const diffMins = (new Date() - new Date(lastSeen)) / 60000; if (diffMins <= 15) onlineCount++; else offlineCount++; } else { offlineCount++; }
        });
        summaryContainer.innerHTML = `<div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-3"><div class="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg text-indigo-600 dark:text-indigo-400"><i class="fas fa-cubes text-xl w-6 text-center"></i></div><div><p class="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">${t('total_assets')}</p><p class="text-xl font-bold text-gray-800 dark:text-white leading-none">${total}</p></div></div><div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-3"><div class="bg-green-100 dark:bg-green-900/50 p-2 rounded-lg text-green-600 dark:text-green-400"><i class="fas fa-signal text-xl w-6 text-center"></i></div><div><p class="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">${t('online')}</p><p class="text-xl font-bold text-gray-800 dark:text-white leading-none">${onlineCount}</p></div></div><div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-3"><div class="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-gray-600 dark:text-gray-400"><i class="fas fa-power-off text-xl w-6 text-center"></i></div><div><p class="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">${t('offline')}</p><p class="text-xl font-bold text-gray-800 dark:text-white leading-none">${offlineCount}</p></div></div><div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-3"><div class="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-blue-600 dark:text-blue-400"><i class="fas fa-box text-xl w-6 text-center"></i></div><div><p class="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">${t('storage')}</p><p class="text-xl font-bold text-gray-800 dark:text-white leading-none">${storageCount}</p></div></div><div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-3"><div class="bg-red-100 dark:bg-red-900/50 p-2 rounded-lg text-red-600 dark:text-red-400"><i class="fas fa-tools text-xl w-6 text-center"></i></div><div><p class="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">${t('repair_issue')}</p><p class="text-xl font-bold text-gray-800 dark:text-white leading-none">${issueCount}</p></div></div>`;
    }
    if (state.statusFilter) filteredData = filteredData.filter(i => i.Status === state.statusFilter); if (state.categoryFilter && config.categoryFilterField) filteredData = filteredData.filter(item => item[config.categoryFilterField] === state.categoryFilter); if (state.filterText) filteredData = filteredData.filter(i => JSON.stringify(Object.values(i)).toUpperCase().includes(state.filterText.toUpperCase()));
    const totalRows = filteredData.length; const startIndex = (state.currentPage - 1) * state.rowsPerPage; const paginatedData = filteredData.slice(startIndex, startIndex + state.rowsPerPage);
    let html = `<thead class="bg-gray-50 dark:bg-gray-700"><tr><th class="px-4 py-3 w-12 text-center"><input type="checkbox" id="selectAll_${collectionName}" onclick="window.toggleSelectAll('${collectionName}', this)" class="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"></th>`;
    config.headers.forEach(h => { const fieldDef = AVAILABLE_FIELDS.find(f => f.id === h); html += `<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">${fieldDef ? fieldDef.label : h}</th>` }); html += `<th class="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">${t('actions')}</th></tr></thead><tbody class="divide-y divide-gray-200 dark:divide-gray-700">`;
    if (paginatedData.length === 0) html += `<tr><td colspan="${config.headers.length + 2}" class="px-6 py-4 text-center text-gray-500">${t('no_data')}</td></tr>`;
    else {
        let allCurrentPageSelected = true;
        paginatedData.forEach(item => {
            const id = item._id || item.id; const isChecked = (selectedItems[collectionName] || []).includes(id); if (!isChecked) allCurrentPageSelected = false;
            html += `<tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"><td class="px-4 py-3 text-center"><input type="checkbox" value="${id}" onclick="window.toggleSelectItem('${collectionName}', this)" class="${collectionName}-row-cb rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer" ${isChecked ? 'checked' : ''}></td>`;
            config.headers.forEach(header => {
                let val = item[header] || '';
                if (header === 'Status') { let color = 'gray'; let tStatus = t(val.toLowerCase().replace(' ', '_')) || val; if (val === 'Active') color = 'green'; else if (val === 'On Loan') color = 'yellow'; else if (val === 'Repair') color = 'orange'; else if (val === 'Storage') color = 'blue'; else if (val === 'Damaged') color = 'red'; val = `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${color}-100 text-${color}-800 dark:bg-${color}-900/50 dark:text-${color}-300">${tStatus}</span>`; } else if (header === 'Last Seen') { let lastSeen = item.lastSeenOnline; if (lastSeen) { const diffMins = (new Date() - new Date(lastSeen)) / 60000; if (diffMins <= 15) val = `<div class="flex items-center space-x-2"><div class="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e] animate-pulse"></div><span class="font-medium text-green-600 dark:text-green-400">${t('online')}</span></div>`; else val = `<div class="flex flex-col"><div class="flex items-center space-x-2"><div class="h-2.5 w-2.5 rounded-full bg-gray-400"></div><span class="text-gray-500">${t('offline')}</span></div><span class="text-[10px] text-gray-400 mt-0.5" title="${new Date(lastSeen).toLocaleString('th-TH')}">${window.formatTimeAgo(lastSeen)}</span></div>`; } else { val = `<div class="flex items-center space-x-2"><div class="h-2.5 w-2.5 rounded-full bg-yellow-400"></div><span class="text-gray-500">${t('unknown')}</span></div>`; } }
                html += `<td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap max-w-xs truncate" title="${String(val).replace(/<[^>]*>?/gm, '')}">${val}</td>`;
            });
            html += `<td class="px-6 py-4 text-sm font-medium space-x-3 whitespace-nowrap text-center"><button onclick="window.openModal('edit', '${collectionName}', '${id}')" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300" title="Edit"><i class="fas fa-edit"></i></button><button onclick="window.openCloneModal('${collectionName}', '${id}')" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title="Clone"><i class="fas fa-copy"></i></button><button onclick="window.openMoveModal('${collectionName}', '${id}')" class="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300" title="Move Category"><i class="fas fa-exchange-alt"></i></button><button onclick="window.deleteItem('${collectionName}', '${id}')" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Delete"><i class="fas fa-trash"></i></button><button onclick="window.showQrModal('${item[config.serialField] || id}', '${item[config.nameField] || 'Asset'}')" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" title="QR Code"><i class="fas fa-qrcode"></i></button></td></tr>`;
        });
        setTimeout(() => { const selectAllCb = document.getElementById(`selectAll_${collectionName}`); if (selectAllCb) selectAllCb.checked = paginatedData.length > 0 && allCurrentPageSelected; }, 10);
    }
    table.innerHTML = html + `</tbody>`; window.renderPaginationControls(collectionName, totalRows); window.updateBulkActionBar(collectionName);
};

window.renderPaginationControls = function(collectionName, totalRows) {
    const container = document.getElementById(collectionName + 'Pagination'); if (!container) return; const state = paginationState[collectionName]; const totalPages = Math.ceil(totalRows / state.rowsPerPage); const startItem = totalRows > 0 ? (state.currentPage - 1) * state.rowsPerPage + 1 : 0; const endItem = Math.min(state.currentPage * state.rowsPerPage, totalRows);
    container.innerHTML = `<div class="text-sm">${t('showing')} <span class="font-semibold">${startItem}</span> ${t('to')} <span class="font-semibold">${endItem}</span> ${t('of')} <span class="font-semibold">${totalRows}</span> ${t('results')}</div><div class="flex items-center space-x-2"><label class="text-sm font-medium">${t('rows')}</label><select onchange="window.changeRowsPerPage('${collectionName}', this)" class="rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-sm"><option value="10" ${state.rowsPerPage == 10 ? 'selected' : ''}>10</option><option value="25" ${state.rowsPerPage == 25 ? 'selected' : ''}>25</option><option value="50" ${state.rowsPerPage == 50 ? 'selected' : ''}>50</option></select><button onclick="window.changePage('${collectionName}', -1)" ${state.currentPage===1?'disabled':''} class="px-2 py-1 border rounded disabled:opacity-50 bg-white dark:bg-gray-700"><i class="fas fa-chevron-left"></i></button><span class="text-sm">${t('page')} ${state.currentPage} / ${totalPages || 1}</span><button onclick="window.changePage('${collectionName}', 1)" ${state.currentPage>=totalPages?'disabled':''} class="px-2 py-1 border rounded disabled:opacity-50 bg-white dark:bg-gray-700"><i class="fas fa-chevron-right"></i></button></div>`;
};

window.buildDeviceHistoryInModal = function(item, collectionName) {
    const container = document.getElementById('deviceHistoryList'); if(!container) return; let historyEvents = []; const idStr = String(item._id || item.id);
    const txs = allData['TransactionHistory'] || []; txs.forEach(tx => { const isMatch = tx.devices && tx.devices.some(d => String(d.id) === idStr); if (isMatch) { historyEvents.push({ date: new Date(tx.timestamp), type: tx.type, user: tx.staffUserName, details: tx.type === 'Handover' ? `ส่งมอบอุปกรณ์ให้แก่ ${tx.staffUserName}` : tx.type === 'Auto-Sync' ? `ตรวจพบการใช้งานโดย ${tx.staffUserName} (อัปเดตอัตโนมัติ)` : `รับคืนอุปกรณ์จาก ${tx.staffUserName || 'System'}` }); } });
    const loans = allData['LoanHistory'] || []; loans.forEach(loan => { if (String(loan.DeviceId) === idStr) { historyEvents.push({ date: new Date(loan.LoanDate), type: 'Loan', user: loan.BorrowerName, details: `ยืมอุปกรณ์ชั่วคราวโดย ${loan.BorrowerName} (กำหนดคืน: ${new Date(loan.DueDate).toLocaleDateString('th-TH')})` }); if (loan.Status === 'Returned' && loan.ReturnDate) { historyEvents.push({ date: new Date(loan.ReturnDate), type: 'Loan Return', user: loan.BorrowerName, details: `รับคืนอุปกรณ์ที่ถูกยืมไปโดย ${loan.BorrowerName}` }); } } });
    if (item.Timestamp) { let createdDetails = 'ลงทะเบียนเพิ่มอุปกรณ์เข้าสู่ระบบ'; if (item.UserName && item.UserName.trim() !== '') { createdDetails += ` (ระบุผู้ครอบครองเริ่มต้น: ${item.UserName})`; } else { createdDetails += ` (จัดเก็บเข้าคลัง / Storage)`; } historyEvents.push({ date: new Date(item.Timestamp), type: 'Created', user: 'System', details: createdDetails }); }
    historyEvents.sort((a, b) => b.date - a.date);
    if (historyEvents.length === 0) { container.innerHTML = `<div class="flex flex-col items-center justify-center text-gray-400 py-10"><i class="fas fa-history text-4xl mb-3 opacity-50"></i><p>${t('no_data')}</p></div>`; return; }
    let html = '<div class="relative border-l-2 border-indigo-200 dark:border-indigo-800/50 ml-4 space-y-6">';
    historyEvents.forEach(ev => {
        let icon = 'fa-info'; let color = 'bg-gray-500'; let badgeColor = 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
        if (ev.type === 'Handover') { icon = 'fa-arrow-right'; color = 'bg-blue-500'; badgeColor = 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400'; } else if (ev.type === 'Return') { icon = 'fa-arrow-left'; color = 'bg-green-500'; badgeColor = 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'; } else if (ev.type === 'Loan') { icon = 'fa-hand-holding'; color = 'bg-yellow-500'; badgeColor = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400'; } else if (ev.type === 'Loan Return') { icon = 'fa-undo'; color = 'bg-teal-500'; badgeColor = 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400'; } else if (ev.type === 'Created') { icon = 'fa-plus'; color = 'bg-indigo-500'; badgeColor = 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400'; } else if (ev.type === 'Auto-Sync') { icon = 'fa-sync-alt'; color = 'bg-purple-500'; badgeColor = 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400'; }
        html += `<div class="relative pl-6"><div class="absolute -left-[17px] top-0 w-8 h-8 rounded-full ${color} text-white flex items-center justify-center shadow-md border-4 border-white dark:border-gray-800"><i class="fas ${icon} text-xs"></i></div><div class="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow transition-shadow"><div class="flex justify-between items-start mb-1"><span class="px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${badgeColor}">${ev.type}</span><p class="text-xs text-gray-500 dark:text-gray-400 font-mono"><i class="far fa-clock mr-1"></i> ${ev.date.toLocaleString('th-TH')}</p></div><p class="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-2">${ev.details}</p></div></div>`;
    }); html += '</div>'; container.innerHTML = html;
};

window.openModal = function(mode, collectionName, id = null) {
    currentEdit = { mode, collection: collectionName, id }; const form = document.getElementById('editForm'); if (!form) return; form.innerHTML = ''; const config = collectionConfigs[collectionName]; const itemData = (mode === 'edit' && allData[collectionName]) ? allData[collectionName].find(i => i._id === id || i.id === id) || {} : {};
    const actionText = mode === 'edit' ? 'Edit' : t('add_new'); const actionIcon = mode === 'edit' ? 'fa-edit' : 'fa-plus-circle';
    const modalHeaderTabsHTML = `<div class="flex space-x-1 bg-gray-100/80 dark:bg-gray-900/80 p-1.5 rounded-xl border border-gray-200/50 dark:border-gray-700/50" id="modal-tabs"><button onclick="window.switchModalTab('details', this)" class="tab-button active px-6 py-2 rounded-lg font-bold text-sm transition-all duration-200 bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm"><i class="fas fa-layer-group mr-2"></i> Specification</button><button onclick="window.switchModalTab('maintenance', this)" class="tab-button px-6 py-2 rounded-lg font-bold text-sm transition-all duration-200 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"><i class="fas fa-tools mr-2"></i> ${t('maintenance_history')}</button><button onclick="window.switchModalTab('history', this)" class="tab-button px-6 py-2 rounded-lg font-bold text-sm transition-all duration-200 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"><i class="fas fa-history mr-2"></i> ${t('device_history')}</button></div>`;
    const tabsContainer = document.querySelector('#editModal .bg-white.border-b.flex.justify-center.z-0'); if (tabsContainer) { tabsContainer.innerHTML = modalHeaderTabsHTML; }
    let historyTabContent = document.getElementById('history-tab'); if (!historyTabContent) { const modalBody = document.querySelector('#editModal .flex-1.overflow-y-auto.p-4'); historyTabContent = document.createElement('div'); historyTabContent.id = 'history-tab'; historyTabContent.className = 'tab-content'; historyTabContent.innerHTML = `<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"><div class="bg-gray-50 dark:bg-gray-900/50 px-5 py-3 border-b border-gray-200 dark:border-gray-700"><h4 class="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">${t('device_history')}</h4></div><div id="deviceHistoryList" class="p-6"></div></div>`; modalBody.appendChild(historyTabContent); }
    document.getElementById('editModalTitle').innerHTML = `<div class="flex items-center"><div class="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-4 shadow-inner"><i class="fas ${actionIcon} text-indigo-600 dark:text-indigo-400 text-xl"></i></div><div><h3 class="text-2xl font-bold text-gray-900 dark:text-white leading-tight">${actionText} <span class="text-indigo-600 dark:text-indigo-400">${config.isCustom ? config.displayName : t(collectionName.toLowerCase()) || config.displayName}</span></h3><p class="text-xs text-gray-500 font-medium mt-1 uppercase tracking-widest">${mode === 'edit' ? 'System ID: ' + (itemData[config.serialField] || id) : 'Fill in the specification details'}</p></div></div>`;
    const groups = { 'Core Identity': [], 'Hardware & Specs': [], 'Network & Connectivity': [], 'Assignment & Location': [], 'Purchase & Warranty': [], 'Inventory & Notes': [], 'Other': [] }; config.formFields.forEach(fieldId => { const fieldDef = AVAILABLE_FIELDS.find(f => f.id === fieldId) || { label: fieldId, type: 'text', group: 'Other' }; const grp = fieldDef.group || 'Other'; if(!groups[grp]) groups[grp] = []; groups[grp].push({ id: fieldId, def: fieldDef }); });
    const groupIcons = { 'Core Identity': 'fa-id-badge text-blue-500', 'Hardware & Specs': 'fa-microchip text-purple-500', 'Network & Connectivity': 'fa-network-wired text-green-500', 'Assignment & Location': 'fa-map-marker-alt text-red-500', 'Purchase & Warranty': 'fa-file-invoice-dollar text-yellow-500', 'Inventory & Notes': 'fa-clipboard-list text-teal-500', 'Other': 'fa-layer-group text-gray-500' };
    let formHtml = '';
    for (const [groupName, fields] of Object.entries(groups)) {
        if (fields.length === 0) continue; const iconClass = groupIcons[groupName] || 'fa-folder';
        formHtml += `<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-4"><div class="px-5 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex items-center"><i class="fas ${iconClass} mr-2"></i><h4 class="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">${groupName}</h4></div><div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">`;
        fields.forEach(f => {
            const fieldId = f.id; const fieldDef = f.def; let val = itemData[fieldId] !== undefined ? itemData[fieldId] : ''; const dropdown = config.dropdowns && config.dropdowns[fieldId];
            formHtml += `<div class="col-span-1 relative">`; const requiredHtml = (fieldDef.required || ['SerialNumber', 'ItemName', 'Status'].includes(fieldId)) ? `<span class="text-red-500 ml-1">*</span>` : ''; formHtml += `<label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">${fieldDef.label}${requiredHtml}</label>`;
            const inputClasses = `w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block dark:bg-gray-700/50 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all duration-200 hover:border-indigo-300`;
            if (dropdown) { formHtml += `<select name="${fieldId}" id="edit-${fieldId}" class="${inputClasses} appearance-none"><option value="">-- Select --</option>${dropdown.map(opt => `<option value="${opt}" ${val === opt ? 'selected' : ''}>${t(opt.toLowerCase().replace(' ', '_')) || opt}</option>`).join('')}</select><div class="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center px-4 text-gray-500"><i class="fas fa-chevron-down text-xs"></i></div>`; } else if (fieldDef.type === 'date') { const d = new Date(val); if(!isNaN(d) && val) val = d.toISOString().split('T')[0]; formHtml += `<input type="date" name="${fieldId}" id="edit-${fieldId}" value="${val}" class="${inputClasses}">`; } else if (fieldDef.type === 'number') { formHtml += `<input type="number" name="${fieldId}" id="edit-${fieldId}" value="${val}" class="${inputClasses}">`; } else if (fieldDef.type === 'textarea') { formHtml += `<textarea name="${fieldId}" id="edit-${fieldId}" rows="2" class="${inputClasses}">${val}</textarea>`; } else { formHtml += `<input type="text" name="${fieldId}" id="edit-${fieldId}" value="${val}" class="${inputClasses}">`; } formHtml += `</div>`;
        }); formHtml += `</div></div>`;
    }
    form.innerHTML = formHtml;
    const disposalSection = document.getElementById('disposal-evidence-section'); const existingEvidenceBox = document.getElementById('existingEvidenceBox'); const fileInput = document.getElementById('disposalFileInput'); const hiddenBase64 = document.getElementById('hiddenEvidenceBase64');
    if (fileInput) fileInput.value = ''; if (hiddenBase64) hiddenBase64.value = '';
    if (itemData.Status === 'Disposed') { if(disposalSection) disposalSection.classList.remove('hidden'); if (itemData.DisposalEvidence && existingEvidenceBox && hiddenBase64) { existingEvidenceBox.classList.remove('hidden'); hiddenBase64.value = itemData.DisposalEvidence; } else if (existingEvidenceBox) existingEvidenceBox.classList.add('hidden'); } else { if(disposalSection) disposalSection.classList.add('hidden'); if(existingEvidenceBox) existingEvidenceBox.classList.add('hidden'); }
    const tabBtn = document.querySelector('#modal-tabs .tab-button'); if (tabBtn) window.switchModalTab('details', tabBtn);
    window.buildMaintenanceLogInModal(itemData); window.buildDeviceHistoryInModal(itemData, collectionName); window.openModalWindow('editModal');
};

document.addEventListener('change', (e) => { if (e.target && e.target.id === 'edit-Status') { const disposalSection = document.getElementById('disposal-evidence-section'); if (!disposalSection) return; if (e.target.value === 'Disposed') { disposalSection.classList.remove('hidden'); disposalSection.classList.add('animate-pulse'); setTimeout(() => disposalSection.classList.remove('animate-pulse'), 1000); } else disposalSection.classList.add('hidden'); } });

window.saveData = async function() {
    const formData = new FormData(document.getElementById('editForm')); const data = Object.fromEntries(formData.entries()); const { mode, collection, id } = currentEdit;
    const statusInput = document.getElementById('edit-Status'); const fileInput = document.getElementById('disposalFileInput'); const hiddenBase64 = document.getElementById('hiddenEvidenceBase64');
    if (statusInput && statusInput.value === 'Disposed') {
        if (fileInput && fileInput.files.length > 0) { const file = fileInput.files[0]; if (file.size > 2 * 1024 * 1024) return alert("ไฟล์เอกสารต้องมีขนาดไม่เกิน 2MB"); try { data.DisposalEvidence = await convertFileToBase64(file); data.DisposalDate = new Date().toISOString(); } catch (err) { return alert("เกิดข้อผิดพลาดในการอ่านไฟล์"); } } else if (hiddenBase64 && hiddenBase64.value) data.DisposalEvidence = hiddenBase64.value; else { if (!confirm("คุณกำลังเปลี่ยนสถานะเป็น 'Disposed' แต่ไม่ได้แนบเอกสาร ต้องการดำเนินการต่อหรือไม่?")) return; data.DisposalDate = new Date().toISOString(); }
    } else if (statusInput && statusInput.value !== 'Disposed') { data.DisposalEvidence = null; data.DisposalDate = null; }
    try { if (mode === 'edit') await apiRequest(`/api/inventory/${collection}/${id}`, 'PUT', data); else await apiRequest(`/api/inventory/${collection}`, 'POST', data); showNotificationModal('success', 'Success', `Data saved successfully.`); window.hideModal('editModal'); await refreshAllData(); window.buildTable(collection); window.updateDashboard(currentDashboardFolder); } catch (error) { showNotificationModal('warning', 'Save Failed', error.message); }
};

window.deleteItem = async function(collectionName, id) { if (confirm(`Are you sure you want to delete this item?`)) { try { await apiRequest(`/api/inventory/${collectionName}/${id}`, 'DELETE'); showNotificationModal('success', 'Deleted', 'The item has been deleted.'); await refreshAllData(); window.buildTable(collectionName); window.updateDashboard(currentDashboardFolder); } catch (error) {} } };

window.updateDashboard = function(folderId) {
    if (folderId !== undefined) currentDashboardFolder = folderId;
    let total = 0, active = 0, storage = 0, issues = 0, disposed = 0; let online = 0, offline = 0; let warrantySoon = 0, warrantyExpired = 0;
    const skipKeys = ['Staff', 'CustomMenus', 'TransactionHistory', 'LoanHistory', 'Maintenance Log', 'admins', 'Software']; const allItems = []; const locationCounts = {};
    const now = new Date(); const thirtyDaysFromNow = new Date(); thirtyDaysFromNow.setDate(now.getDate() + 30);
    for (const [key, items] of Object.entries(allData)) { if (skipKeys.includes(key)) continue; if (Array.isArray(items)) { allItems.push(...items); } }
    allItems.forEach(i => {
        if (i.Status === 'Disposed') { disposed++; } else {
            total++; if (i.Status === 'Active' || i.Status === 'On Loan') active++; else if (i.Status === 'Storage') storage++; else if (i.Status === 'Repair' || i.Status === 'Damaged') issues++;
            if (i.IPAddress || i.lastSeenOnline) { const lastSeen = i.lastSeenOnline; if (lastSeen && (new Date() - new Date(lastSeen)) / 60000 <= 15) { online++; } else { offline++; } }
            if (i.WarrantyEndDate) { const wDate = new Date(i.WarrantyEndDate); if (wDate < now) { warrantyExpired++; } else if (wDate <= thirtyDaysFromNow) { warrantySoon++; } }
            const loc = i.Location || 'Unassigned'; locationCounts[loc] = (locationCounts[loc] || 0) + 1;
        }
    });
    if(document.getElementById('stat-total')) { document.getElementById('stat-total').innerText = total; document.getElementById('stat-active').innerText = active; document.getElementById('stat-storage').innerText = storage; document.getElementById('stat-issues').innerText = issues; document.getElementById('stat-disposed').innerText = disposed; document.getElementById('stat-online').innerText = online; document.getElementById('stat-offline').innerText = offline; document.getElementById('stat-warranty-soon').innerText = warrantySoon; document.getElementById('stat-warranty-expired').innerText = warrantyExpired; }
    let overviewGrid = document.getElementById('category-overview-grid');
    if (overviewGrid) {
        overviewGrid.innerHTML = '';
        const getChildren = (pid) => { return (allData.CustomMenus || []).filter(m => m.parentId === pid).map(m => m.name); };
        const getFolderStats = (folderName) => { let stats = { total: 0, active: 0, storage: 0, issues: 0 }; (allData[folderName] || []).forEach(item => { if (item.Status !== 'Disposed') { stats.total++; if (item.Status === 'Active' || item.Status === 'On Loan') stats.active++; else if (item.Status === 'Storage') stats.storage++; else if (item.Status === 'Repair' || item.Status === 'Damaged') stats.issues++; } }); const children = getChildren(folderName); children.forEach(child => { const childStats = getFolderStats(child); stats.total += childStats.total; stats.active += childStats.active; stats.storage += childStats.storage; stats.issues += childStats.issues; }); return stats; };
        const generateFolderCardHTML = (colName, config, displayName, children, isBackBtn = false) => {
            if (isBackBtn) { let mDef = (allData.CustomMenus || []).find(m => m.name === currentDashboardFolder); const goBackId = mDef && mDef.parentId ? `'${mDef.parentId}'` : `null`; return `<div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 flex items-center space-x-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors transform hover:-translate-y-1" onclick="window.updateDashboard(${goBackId})"><div class="bg-gray-200 dark:bg-gray-600 w-10 h-10 rounded-full flex items-center justify-center shrink-0"><i class="fas fa-arrow-left text-gray-600 dark:text-gray-300"></i></div><div class="overflow-hidden"><p class="text-xs text-gray-500 dark:text-gray-400 truncate">${t('go_back')}</p><p class="text-sm font-bold text-gray-800 dark:text-white truncate">${t('back')}</p></div></div>`; }
            const action = children.length > 0 ? `window.updateDashboard('${colName}')` : `window.loadPage('${colName}')`; const iconMarker = children.length > 0 ? `<div class="absolute top-2 right-2 text-xs text-indigo-400"><i class="fas fa-folder"></i></div>` : ''; const stats = getFolderStats(colName); const finalDisplayName = config.isCustom ? displayName : t(colName.toLowerCase()) || displayName;
            return `<div class="relative bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center cursor-pointer hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors transform hover:-translate-y-1" onclick="${action}">${iconMarker}<div class="flex items-center space-x-3 w-full"><div class="bg-indigo-100 dark:bg-indigo-900/50 w-10 h-10 rounded-full flex items-center justify-center shrink-0"><i class="fas ${config.icon || 'fa-box'} text-indigo-600 dark:text-indigo-400"></i></div><div class="flex-1 min-w-0"><p class="text-sm font-bold text-gray-800 dark:text-white truncate">${finalDisplayName}</p><p class="text-xs text-gray-500 dark:text-gray-400">${stats.total} ${t('items_count')}</p></div></div><div class="mt-3 flex items-center gap-1.5 flex-wrap"><span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400" title="Active / On Loan"><i class="fas fa-check-circle mr-1"></i>${stats.active}</span><span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400" title="Storage"><i class="fas fa-box mr-1"></i>${stats.storage}</span><span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400" title="Issues / Repair"><i class="fas fa-tools mr-1"></i>${stats.issues}</span></div></div>`;
        };
        if (currentDashboardFolder === null) { const rootCollections = []; Object.keys(collectionConfigs).forEach(colName => { if (colName === 'Software') return; const menuDef = (allData.CustomMenus || []).find(m => m.name === colName); const isDefaultRoot = ['Computers', 'Monitors', 'Printers', 'Network'].includes(colName); const isCustomRoot = menuDef && !menuDef.parentId; if (isDefaultRoot || isCustomRoot) { rootCollections.push(colName); } }); rootCollections.forEach(colName => { const config = collectionConfigs[colName]; const displayName = config.displayName || colName; const children = getChildren(colName); overviewGrid.innerHTML += generateFolderCardHTML(colName, config, displayName, children, false); }); } else { const parentConfig = collectionConfigs[currentDashboardFolder]; const parentDisplayName = parentConfig.isCustom ? parentConfig.displayName : t(currentDashboardFolder.toLowerCase()) || currentDashboardFolder; overviewGrid.innerHTML += generateFolderCardHTML(null, null, null, null, true); overviewGrid.innerHTML += `<div class="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl shadow-sm border border-indigo-200 dark:border-indigo-700 flex flex-col justify-center cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-800/50 transition-colors transform hover:-translate-y-1" onclick="window.loadPage('${currentDashboardFolder}')"><div class="flex items-center space-x-3 w-full"><div class="bg-indigo-200 dark:bg-indigo-800 w-10 h-10 rounded-full flex items-center justify-center shrink-0"><i class="fas fa-list text-indigo-700 dark:text-indigo-300"></i></div><div class="flex-1 min-w-0"><p class="text-xs text-indigo-500 dark:text-indigo-400 truncate">${t('view_items')}</p><p class="text-sm font-bold text-indigo-900 dark:text-indigo-100 truncate">${parentDisplayName}</p></div></div></div>`; const children = getChildren(currentDashboardFolder); children.forEach(colName => { const config = collectionConfigs[colName]; const displayName = config.displayName || colName; const subChildren = getChildren(colName); overviewGrid.innerHTML += generateFolderCardHTML(colName, config, displayName, subChildren, false); }); }
    }
    const statusCounts = {}; allItems.filter(i => i.Status !== 'Disposed').forEach(i => { statusCounts[i.Status] = (statusCounts[i.Status] || 0) + 1; }); window.renderStatusChart(statusCounts);
    const categoryCounts = {}; for (const [key, items] of Object.entries(allData)) { if (skipKeys.includes(key)) continue; if (Array.isArray(items)) { const activeItems = items.filter(i => i.Status !== 'Disposed'); if (activeItems.length > 0) { const displayName = collectionConfigs[key] ? collectionConfigs[key].displayName : key; const translatedDisplayName = collectionConfigs[key].isCustom ? displayName : t(key.toLowerCase()) || displayName; categoryCounts[translatedDisplayName] = activeItems.length; } } } window.renderCategoryChart(categoryCounts);
    window.renderLocationChart(locationCounts);
    const activityContainer = document.getElementById('recent-activity-list');
    if (activityContainer) { const transactions = allData['TransactionHistory'] || []; if (transactions.length === 0) { activityContainer.innerHTML = `<p class="text-gray-500 text-sm">${t('no_data')}</p>`; } else { const sorted = transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5); let html = ''; sorted.forEach(tx => { const date = new Date(tx.timestamp).toLocaleString('th-TH'); const color = tx.type === 'Handover' ? 'text-blue-500' : 'text-green-500'; const icon = tx.type === 'Handover' ? 'fa-arrow-right' : 'fa-arrow-left'; html += `<div class="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"><div class="mt-1 ${color}"><i class="fas ${icon}"></i></div><div><p class="text-sm font-semibold text-gray-800 dark:text-gray-200">${t(tx.type.toLowerCase()) || tx.type}: <span class="font-normal text-gray-600 dark:text-gray-400">${tx.staffUserName || 'Unknown'}</span></p><p class="text-xs text-gray-500">${tx.devices ? tx.devices.length : 0} ${t('items')} • ${date}</p></div></div>`; }); activityContainer.innerHTML = html; } }
};

window.renderStatusChart = function(data) { const ctx = document.getElementById('statusChart'); if(!ctx) return; const translatedLabels = Object.keys(data).map(key => t(key.toLowerCase().replace(' ', '_')) || key); if(window.statusChartInstance) { window.statusChartInstance.data.labels = translatedLabels; window.statusChartInstance.data.datasets[0].data = Object.values(data); window.statusChartInstance.update(); } else { window.statusChartInstance = new Chart(ctx, { type: 'doughnut', data: { labels: translatedLabels, datasets: [{ data: Object.values(data), backgroundColor: ['#22c55e', '#eab308', '#f97316', '#3b82f6', '#9ca3af'] }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } } }); } };
window.renderCategoryChart = function(data) { const ctx = document.getElementById('categoryChart'); if(!ctx) return; if(window.categoryChartInstance) { window.categoryChartInstance.data.labels = Object.keys(data); window.categoryChartInstance.data.datasets[0].data = Object.values(data); window.categoryChartInstance.update(); } else { window.categoryChartInstance = new Chart(ctx, { type: 'bar', data: { labels: Object.keys(data), datasets: [{ label: 'Assets', data: Object.values(data), backgroundColor: '#6366f1', borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } }); } };
window.renderLocationChart = function(data) { const ctx = document.getElementById('locationChart'); if(!ctx) return; const sortedLocations = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 5); const labels = sortedLocations.map(item => item[0]); const values = sortedLocations.map(item => item[1]); if(window.locationChartInstance) { window.locationChartInstance.data.labels = labels; window.locationChartInstance.data.datasets[0].data = values; window.locationChartInstance.update(); } else { window.locationChartInstance = new Chart(ctx, { type: 'bar', data: { labels: labels, datasets: [{ label: 'Assets', data: values, backgroundColor: '#14b8a6', borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } } }); } };

window.showNotificationModal = function(type, title, msg) { document.getElementById('modalTitle').textContent = title; document.getElementById('modalMessage').textContent = msg; const icon = document.getElementById('modalIcon'); if(type === 'success') icon.innerHTML = '<i class="fas fa-check-circle text-4xl text-green-500"></i>'; else if(type === 'warning') icon.innerHTML = '<i class="fas fa-exclamation-triangle text-4xl text-yellow-500"></i>'; else icon.innerHTML = '<i class="fas fa-info-circle text-4xl text-blue-500"></i>'; window.openModalWindow('notificationModal'); };
window.hideModal = function(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('opacity-0', 'pointer-events-none');
    if (modal.querySelector('.modal-content')) { 
        modal.querySelector('.modal-content').classList.remove('scale-100'); 
        modal.querySelector('.modal-content').classList.add('scale-95'); 
    }
    // Delay hiding display until transition finishes
    setTimeout(() => {
        if (modal.classList.contains('opacity-0')) {
            modal.classList.remove('show');
        }
    }, 300);
};
window.switchModalTab = function(tab, btn) { document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active')); document.getElementById(tab+'-tab').classList.add('active'); document.querySelectorAll('.tab-button').forEach(b => { b.classList.remove('active', 'bg-white', 'dark:bg-gray-700', 'text-indigo-600', 'dark:text-indigo-400', 'shadow-sm'); b.classList.add('text-gray-500'); }); btn.classList.remove('text-gray-500'); btn.classList.add('active', 'bg-white', 'dark:bg-gray-700', 'text-indigo-600', 'dark:text-indigo-400', 'shadow-sm'); };
window.changeRowsPerPage = function(col, el) { paginationState[col].rowsPerPage = parseInt(el.value); paginationState[col].currentPage=1; window.buildTable(col); };
window.changePage = function(col, dir) { paginationState[col].currentPage += dir; window.buildTable(col); };
window.handleSearch = function(col, val) { paginationState[col].filterText = val; paginationState[col].currentPage=1; window.buildTable(col); };
window.handleStatusFilter = function(col, val) { paginationState[col].statusFilter = val; paginationState[col].currentPage=1; window.buildTable(col); };

window.buildHandoverReturnPage = function() {
    const handoverTab = document.getElementById('handover-tab-content');
    if(handoverTab) {
        handoverTab.innerHTML = `<div class="grid grid-cols-1 xl:grid-cols-2 gap-8"><div class="space-y-4"><div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700"><h3 class="font-bold mb-3 text-gray-800 dark:text-white flex items-center"><span class="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span> Select Staff</h3><input type="text" onkeyup="window.filterStaffList(this, 'handoverStaffList')" placeholder="${t('search')}" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg mb-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-sm"><div id="handoverStaffList" class="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 dark:border-gray-600 bg-white dark:bg-gray-800 custom-scrollbar space-y-1"></div></div><div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700"><h3 class="font-bold mb-3 text-gray-800 dark:text-white flex items-center"><span class="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span> Select Device (From Storage)</h3><input type="text" onkeyup="window.filterDeviceList(this, 'handoverDeviceList')" placeholder="${t('search')}" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg mb-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-sm"><div id="handoverDeviceList" class="max-h-80 overflow-y-auto border border-gray-200 rounded-lg dark:border-gray-600 bg-white dark:bg-gray-800 custom-scrollbar"></div></div></div><div><div class="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-xl border border-indigo-100 dark:border-indigo-800/50 h-full flex flex-col"><h3 class="font-bold mb-4 text-indigo-900 dark:text-indigo-100 flex items-center"><span class="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">3</span> Cart Summary</h3><div class="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"><p class="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Assignee</p><p id="selectedHandoverStaff" class="text-lg font-bold text-gray-800 dark:text-white">None selected</p></div><div id="handoverCartList" class="flex-1 overflow-y-auto custom-scrollbar space-y-3 mb-4 min-h-[250px]"><div class="h-full flex flex-col items-center justify-center text-gray-400"><i class="fas fa-box-open text-4xl mb-3 opacity-50"></i><p>Cart is empty</p></div></div><button id="confirmHandoverBtn" onclick="window.confirmHandover()" class="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-indigo-700 transition shadow-md flex justify-center items-center" disabled><i class="fas fa-check-circle mr-2"></i> ${t('confirm_move')}</button></div></div></div>`;
        window.populateStaffLists('handoverStaffList', 'selectedHandoverStaff'); window.populateHandoverDeviceList();
    }
    const returnTab = document.getElementById('return-tab-content');
    if(returnTab) {
        returnTab.innerHTML = `<div class="grid grid-cols-1 lg:grid-cols-12 gap-8"><div class="lg:col-span-5 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700"><h3 class="font-bold mb-3 text-gray-800 dark:text-white flex items-center"><span class="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span> Find Staff</h3><input type="text" onkeyup="window.filterStaffList(this, 'returnStaffList')" placeholder="${t('search')}" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg mb-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-green-500 shadow-sm"><div id="returnStaffList" class="max-h-[500px] overflow-y-auto border border-gray-200 rounded-lg p-2 dark:border-gray-600 bg-white dark:bg-gray-800 custom-scrollbar space-y-1"></div></div><div class="lg:col-span-7 bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-full"><h3 class="font-bold mb-4 text-gray-800 dark:text-white flex items-center"><span class="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span> Select Devices to Return</h3><div class="mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"><p class="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Current Staff</p><p id="selectedReturnStaff" class="text-lg font-bold text-gray-800 dark:text-white">None selected</p></div><div id="returnDeviceList" class="flex-1 overflow-y-auto custom-scrollbar space-y-3 mb-4 min-h-[300px]"><div class="h-full flex flex-col items-center justify-center text-gray-400"><i class="fas fa-arrow-left text-4xl mb-3 opacity-50"></i><p>Select a staff member first</p></div></div><button id="confirmReturnBtn" onclick="window.confirmReturn()" class="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-green-700 transition shadow-md flex justify-center items-center" disabled><i class="fas fa-undo mr-2"></i> Confirm Return to Storage</button></div></div>`;
        window.populateStaffLists('returnStaffList', 'selectedReturnStaff', true);
    }
};

window.populateStaffLists = function(listId, labelId, isReturn = false) {
    const list = document.getElementById(listId); if (!list) return; const staff = allData.Staff || []; if (staff.length === 0) { list.innerHTML = `<p class="p-4 text-center text-gray-500">${t('no_data')}</p>`; return; }
    list.innerHTML = staff.map(s => {
        const autoBadge = s.isAuto ? `<span class="ml-2 px-1.5 py-0.5 text-[9px] bg-yellow-100 text-yellow-800 rounded shadow-sm border border-yellow-200"><i class="fas fa-magic mr-1"></i>${t('auto_detected')}</span>` : '';
        return `<div class="staff-item p-3 hover:bg-indigo-50 dark:hover:bg-gray-700 border border-transparent hover:border-indigo-100 dark:hover:border-gray-600 cursor-pointer rounded-lg transition-colors flex justify-between items-center" onclick="window.selectStaff('${s.UserName}', '${listId}', '${labelId}', ${isReturn})"><div><p class="font-bold text-sm dark:text-white">${s.FirstName === 'Auto' ? s.UserName : s.FirstName || s.UserName} ${s.LastName === 'Detected' ? '' : s.LastName || ''} ${autoBadge}</p><p class="text-xs text-gray-500 dark:text-gray-400">User: ${s.UserName}</p></div>${s.Department && s.Department !== 'N/A' ? `<span class="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-xs rounded font-medium">${s.Department}</span>` : ''}</div>`;
    }).join('');
};

window.selectStaff = function(name, listId, labelId, isReturn) {
    document.getElementById(labelId).textContent = name; document.querySelectorAll(`#${listId} .staff-item`).forEach(el => el.classList.remove('bg-indigo-100', 'dark:bg-indigo-900', 'border-indigo-300')); event.currentTarget.classList.add('bg-indigo-100', 'dark:bg-indigo-900', 'border-indigo-300');
    if (isReturn) {
        const allDevices = Object.keys(collectionConfigs).flatMap(cat => (allData[cat] || []).map(d => ({ ...d, collection: cat }))); const userDevices = allDevices.filter(d => d.UserName === name && d.Status !== 'Storage' && d.Status !== 'Disposed'); const returnList = document.getElementById('returnDeviceList');
        if(userDevices.length === 0) returnList.innerHTML = `<div class="h-full flex flex-col items-center justify-center text-gray-400"><i class="fas fa-box-open text-4xl mb-3 opacity-50"></i><p>${t('no_data')}</p></div>`;
        else {
            returnList.innerHTML = userDevices.map(d => {
                const config = collectionConfigs[d.collection]; const deviceName = d[config.nameField] || d.ComputerName || d.DeviceName || d.ItemName || 'Unnamed Device'; const serial = d[config.serialField] || d.SerialNumber || 'No SN'; const brandModel = [d.Manufacturer, d.Model].filter(Boolean).join(' ') || '-'; const dispName = config.isCustom ? config.displayName : t(d.collection.toLowerCase()) || d.collection;
                return `<div class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center space-x-3 shadow-sm hover:border-indigo-300 transition-colors"><input type="checkbox" class="return-checkbox rounded w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer" value="${d._id || d.id}" data-col="${d.collection}"><div class="flex-1 min-w-0"><div class="flex items-center space-x-2"><span class="px-2 py-0.5 text-[10px] font-bold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded uppercase tracking-wider">${dispName}</span><p class="font-bold text-sm text-gray-800 dark:text-white truncate">${deviceName}</p></div><div class="mt-1 flex text-xs text-gray-500 dark:text-gray-400 space-x-3"><span title="Serial Number" class="truncate"><i class="fas fa-barcode mr-1"></i>${serial}</span><span title="Brand/Model" class="truncate"><i class="fas fa-info-circle mr-1"></i>${brandModel}</span></div></div></div>`;
            }).join('');
            document.querySelectorAll('.return-checkbox').forEach(cb => cb.addEventListener('change', () => document.getElementById('confirmReturnBtn').disabled = !document.querySelector('.return-checkbox:checked')));
        }
    } else { window.updateHandoverButtonState(); }
};

window.populateHandoverDeviceList = function() {
    const list = document.getElementById('handoverDeviceList'); const allDevices = Object.keys(collectionConfigs).flatMap(cat => (allData[cat] || []).map(d => ({ ...d, collection: cat }))); const available = allDevices.filter(d => d.Status === 'Storage');
    if (available.length === 0) { list.innerHTML = `<div class="h-full flex flex-col items-center justify-center text-gray-400 py-10"><i class="fas fa-box-open text-4xl mb-3 opacity-50"></i><p>${t('no_data')}</p></div>`; return; }
    list.innerHTML = available.map(d => {
        const config = collectionConfigs[d.collection]; const name = d[config.nameField] || d.ComputerName || d.DeviceName || d.ItemName || 'Unnamed Device'; const serial = d[config.serialField] || d.SerialNumber || 'No SN'; const brandModel = [d.Manufacturer, d.Model].filter(Boolean).join(' ') || '-'; const dispName = config.isCustom ? config.displayName : t(d.collection.toLowerCase()) || d.collection;
        return `<div class="device-item p-3 hover:bg-indigo-50 dark:hover:bg-gray-700 border-b dark:border-gray-600 cursor-pointer flex justify-between items-center transition-colors" onclick="window.addDeviceToHandoverCart('${d._id || d.id}', '${d.collection}')"><div class="flex-1 min-w-0 pr-3"><div class="flex items-center space-x-2"><span class="shrink-0 px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 rounded uppercase tracking-wider">${dispName}</span><p class="font-bold text-sm text-gray-800 dark:text-white truncate">${name}</p></div><div class="mt-1 flex text-xs text-gray-500 dark:text-gray-400 space-x-3"><span title="Serial Number" class="truncate max-w-[120px]"><i class="fas fa-barcode mr-1"></i>${serial}</span><span title="Brand/Model" class="truncate"><i class="fas fa-info-circle mr-1"></i>${brandModel}</span></div></div><div class="shrink-0 bg-white dark:bg-gray-800 w-8 h-8 flex items-center justify-center rounded-full shadow-sm border border-gray-200 dark:border-gray-600"><i class="fas fa-plus text-green-500"></i></div></div>`;
    }).join('');
};

window.addDeviceToHandoverCart = function(id, col) { if(!handoverCart.some(i => (i._id === id || i.id === id))) { const item = allData[col].find(i => (i._id === id || i.id === id)); handoverCart.push({...item, collection: col}); window.renderHandoverCart(); window.updateHandoverButtonState(); } };

window.renderHandoverCart = function() {
    const list = document.getElementById('handoverCartList');
    if(handoverCart.length === 0) list.innerHTML = `<div class="h-full flex flex-col items-center justify-center text-gray-400"><i class="fas fa-box-open text-4xl mb-3 opacity-50"></i><p>Cart is empty</p></div>`;
    else {
        list.innerHTML = handoverCart.map(d => {
            const config = collectionConfigs[d.collection]; const id = d._id || d.id; const name = d[config.nameField] || d.ComputerName || d.DeviceName || d.ItemName || 'Unnamed Device'; const serial = d[config.serialField] || d.SerialNumber || 'No SN'; const dispName = config.isCustom ? config.displayName : t(d.collection.toLowerCase()) || d.collection;
            return `<div class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-sm flex justify-between items-center"><div class="flex-1 min-w-0 pr-2"><p class="font-bold text-sm text-indigo-900 dark:text-indigo-100 truncate">${name}</p><p class="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5 font-mono truncate"><span class="font-semibold px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 rounded mr-1">${dispName}</span> ${serial}</p></div><button onclick="window.removeHandoverItem('${id}')" class="shrink-0 text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"><i class="fas fa-trash-alt"></i></button></div>`;
        }).join('');
    }
};

window.removeHandoverItem = function(id) { handoverCart = handoverCart.filter(i => (i._id !== id && i.id !== id)); window.renderHandoverCart(); window.updateHandoverButtonState(); };
window.updateHandoverButtonState = function() { const staffSelected = document.getElementById('selectedHandoverStaff').textContent !== 'None selected'; document.getElementById('confirmHandoverBtn').disabled = !(staffSelected && handoverCart.length > 0); };

window.confirmHandover = async function() {
    const staff = document.getElementById('selectedHandoverStaff').textContent;
    if(confirm(`Handover ${handoverCart.length} items to ${staff}?`)) {
        try { await apiRequest('/api/transactions/handover', 'POST', { staffUserName: staff, devices: handoverCart }); handoverCart = []; await refreshAllData(); window.renderHandoverCart(); window.populateHandoverDeviceList(); window.updateDashboard(currentDashboardFolder); showNotificationModal('success', 'Success', 'Items assigned successfully.'); } catch (error) { showNotificationModal('warning', 'Error', error.message); }
    }
};

window.confirmReturn = async function() {
    const items = Array.from(document.querySelectorAll('.return-checkbox:checked')).map(cb => ({ id: cb.value, collection: cb.dataset.col }));
    if(confirm(`Return ${items.length} items?`)) {
        try { await apiRequest('/api/transactions/return', 'POST', { devices: items }); await refreshAllData(); document.getElementById('returnDeviceList').innerHTML = `<div class="h-full flex flex-col items-center justify-center text-gray-400"><i class="fas fa-arrow-left text-4xl mb-3 opacity-50"></i><p>Select a staff member first</p></div>`; document.getElementById('selectedReturnStaff').textContent = 'None selected'; window.populateStaffLists('returnStaffList', 'selectedReturnStaff', true); window.updateDashboard(currentDashboardFolder); showNotificationModal('success', 'Success', 'Items returned successfully.'); } catch (error) { showNotificationModal('warning', 'Error', error.message); }
    }
};

window.switchHandoverTab = function(tab, btn) { document.getElementById('handover-tab-content').style.display = tab==='handover'?'block':'none'; document.getElementById('return-tab-content').style.display = tab==='return'?'block':'none'; document.querySelectorAll('#handover-tabs button').forEach(b => { b.classList.remove('border-indigo-600', 'text-indigo-600', 'dark:text-indigo-400'); b.classList.add('border-transparent', 'text-gray-500'); }); btn.classList.add('border-indigo-600', 'text-indigo-600', 'dark:text-indigo-400'); btn.classList.remove('border-transparent', 'text-gray-500'); };
window.filterStaffList = function(input, listId) { const term = input.value.toUpperCase(); document.querySelectorAll(`#${listId} .staff-item`).forEach(el => el.style.display = el.textContent.toUpperCase().includes(term) ? '' : 'none'); };
window.filterDeviceList = function(input, listId) { const term = input.value.toUpperCase(); document.querySelectorAll(`#${listId} .device-item`).forEach(el => el.style.display = el.textContent.toUpperCase().includes(term) ? '' : 'none'); };

window.buildStaffManagementPage = function() {
    const page = document.getElementById('staffmanagement-page');
    page.innerHTML = `<div class="flex justify-between items-center mb-6"><h2 class="text-2xl font-bold dark:text-white">${t('staff_management')}</h2><button onclick="window.openStaffModal('add')" class="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold">${t('add_new')}</button></div><div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto"><table class="min-w-full"><thead class="bg-gray-50 dark:bg-gray-700"><tr><th class="px-6 py-3 text-left text-xs uppercase text-gray-500 font-semibold">Username</th><th class="px-6 py-3 text-left text-xs uppercase text-gray-500 font-semibold">Name</th><th class="px-6 py-3 text-left text-xs uppercase text-gray-500 font-semibold">Dept</th><th class="px-6 py-3"></th></tr></thead><tbody id="staffTableBody" class="divide-y divide-gray-200 dark:divide-gray-700"></tbody></table></div>`;
    window.renderStaffTable();
};

window.renderStaffTable = function() {
    const tbody = document.getElementById('staffTableBody'); const staff = allData.Staff || [];
    if(staff.length === 0) tbody.innerHTML = `<tr><td colspan="4" class="text-center p-4 text-gray-500">${t('no_data')}</td></tr>`;
    else tbody.innerHTML = staff.map(s => {
        const id = s._id || s.id; const autoBadge = s.isAuto ? `<span class="ml-2 px-2 py-0.5 text-[10px] bg-yellow-100 text-yellow-800 rounded-full border border-yellow-200 shadow-sm"><i class="fas fa-magic mr-1"></i>${t('auto_detected')}</span>` : '';
        const actionBtns = s.isAuto ? `<button onclick="window.openStaffModal('auto','${id}')" class="text-green-600 hover:text-green-800 text-xs font-bold px-3 py-1.5 bg-green-50 rounded border border-green-200 shadow-sm transition"><i class="fas fa-plus mr-1"></i> ${t('add_to_system')}</button>` : `<button onclick="window.openStaffModal('edit','${id}')" class="text-indigo-600 mr-4 text-lg hover:text-indigo-800"><i class="fas fa-edit"></i></button><button onclick="window.deleteStaff('${id}')" class="text-red-600 text-lg hover:text-red-800"><i class="fas fa-trash"></i></button>`;
        const fName = s.FirstName === 'Auto' ? '' : (s.FirstName||''); const lName = s.LastName === 'Detected' ? '' : (s.LastName||''); const dept = s.Department === 'N/A' ? '' : (s.Department||'');
        return `<tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"><td class="px-6 py-4 font-medium">${s.UserName} ${autoBadge}</td><td class="px-6 py-4 text-gray-600 dark:text-gray-300">${fName} ${lName}</td><td class="px-6 py-4 text-gray-600 dark:text-gray-300">${dept}</td><td class="px-6 py-4 text-right">${actionBtns}</td></tr>`;
    }).join('');
};

window.openStaffModal = function(mode, id) {
    currentStaffEdit = { mode: mode === 'auto' ? 'add' : mode, id: mode === 'auto' ? null : id }; const form = document.getElementById('editStaffForm'); form.reset();
    document.getElementById('editStaffModalTitle').innerHTML = (mode === 'edit' || mode === 'auto') ? '<i class="fas fa-user-edit text-indigo-500 mr-2"></i> Edit Staff' : '<i class="fas fa-user-plus text-indigo-500 mr-2"></i> Add Staff';
    if (mode === 'edit' || mode === 'auto') { const s = allData.Staff.find(i => i._id === id || i.id === id); if(s) { document.getElementById('editStaffUserName').value = s.UserName; document.getElementById('editStaffFirstName').value = s.FirstName === 'Auto' ? '' : s.FirstName; document.getElementById('editStaffLastName').value = s.LastName === 'Detected' ? '' : s.LastName; document.getElementById('editStaffDepartment').value = s.Department === 'N/A' ? '' : s.Department; } }
    window.openModalWindow('editStaffModal');
};

window.saveStaffChanges = async function() {
    const data = { UserName: document.getElementById('editStaffUserName').value, FirstName: document.getElementById('editStaffFirstName').value, LastName: document.getElementById('editStaffLastName').value, Department: document.getElementById('editStaffDepartment').value };
    if(!data.UserName) return alert("Username required"); const { mode, id } = currentStaffEdit;
    if (mode === 'edit') await apiRequest(`/api/staff/${id}`, 'PUT', data); else await apiRequest('/api/staff', 'POST', data);
    window.hideModal('editStaffModal'); await refreshAllData(); window.renderStaffTable();
};

window.deleteStaff = async function(id) { if(confirm("Delete this staff?")) { await apiRequest(`/api/staff/${id}`, 'DELETE'); await refreshAllData(); window.renderStaffTable(); } };

window.buildAdminManagementPage = function() {
    const page = document.getElementById('adminmanagement-page');
    page.innerHTML = `<div class="flex justify-between items-center mb-6"><h2 class="text-2xl font-bold dark:text-white">${t('admin_management')}</h2><button onclick="window.openModalWindow('addUserModal')" class="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold">${t('add_new')}</button></div><div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto"><table class="min-w-full"><thead class="bg-gray-50 dark:bg-gray-700"><tr><th class="px-6 py-3 text-left text-xs uppercase text-gray-500 font-semibold">Email</th><th class="px-6 py-3 text-left text-xs uppercase text-gray-500 font-semibold">ID</th><th class="px-6 py-3"></th></tr></thead><tbody id="adminTableBody" class="divide-y divide-gray-200 dark:divide-gray-700"><tr><td colspan="3" class="text-center p-4">Loading...</td></tr></tbody></table></div>`;
    window.renderAdminTable();
};

window.renderAdminTable = async function() { const res = await apiRequest('/api/admins/list'); const tbody = document.getElementById('adminTableBody'); if(!res || !res.users) return; tbody.innerHTML = res.users.map(u => `<tr><td class="px-6 py-4 font-medium">${u.email}</td><td class="px-6 py-4 text-xs text-gray-500">${u._id}</td><td class="px-6 py-4 text-right"><button onclick="window.deleteAdmin('${u._id}')" class="text-red-600"><i class="fas fa-trash"></i></button></td></tr>`).join(''); };
window.deleteAdmin = async function(id) { if(confirm("Delete admin?")) { await apiRequest('/api/admins/delete', 'DELETE', { uid: id }); window.renderAdminTable(); } };

window.buildMaintenanceLogInModal = function(item) {
    const list = document.getElementById('maintenanceLogList'); if(!list) return; list.innerHTML = '';
    const logs = (allData['Maintenance Log'] || []).filter(l => l.deviceId === item._id || l.deviceId === item.id);
    if(logs.length === 0) list.innerHTML = `<p class="text-xs text-gray-500">${t('no_data')}</p>`;
    logs.forEach(l => { list.innerHTML += `<div class="border-b py-2 dark:border-gray-700"><p class="text-sm font-semibold dark:text-gray-200">${new Date(l.logDate).toLocaleDateString()}</p><p class="text-sm dark:text-gray-400">${l.description}</p></div>`; });
};

window.addMaintenanceLog = function() {
    const { collection, id } = currentEdit; const desc = document.getElementById('newLogDescription').value; const date = document.getElementById('newLogDate').value; const cost = document.getElementById('newLogCost').value; const tech = document.getElementById('newLogTechnician').value;
    if(!desc || !date) return alert("Date and Description required");
    apiRequest('/api/inventory/maintenance', 'POST', { deviceId: id, deviceCollection: collection, description: desc, logDate: date, cost: cost, technician: tech }).then(() => { alert("Log added"); document.getElementById('maintenanceLogForm').reset(); refreshAllData(); });
};

window.openImportModal = function(collectionName) {
    currentImportCollection = collectionName; const dispName = collectionConfigs[collectionName].isCustom ? collectionConfigs[collectionName].displayName : t(collectionName.toLowerCase()) || collectionName;
    document.getElementById('importModalTitle').innerHTML = `<i class="fas fa-file-import text-green-500 mr-2"></i> ${t('import_csv')} -> ${dispName}`;
    const config = collectionConfigs[collectionName]; if (config) document.getElementById('importHeadersExample').textContent = config.formFields.join(', ');
    window.openModalWindow('importModal');
};

window.downloadCsvTemplate = function() {
    if(!currentImportCollection) return; const config = collectionConfigs[currentImportCollection]; const headers = config.formFields.join(',');
    const blob = new Blob(["\uFEFF" + headers], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `${currentImportCollection}_template.csv`; link.click();
};

window.processCsvImport = function() {
    const file = document.getElementById('csvFileInput').files[0]; if (!file) { showNotificationModal('warning', 'No File', 'Please select a file.'); return; }
    Papa.parse(file, { header: true, skipEmptyLines: true, encoding: document.getElementById('csvEncoding').value, complete: async (results) => { try { if(results.data.length === 0) throw new Error("Empty CSV"); await apiRequest(`/api/inventory/${currentImportCollection}/bulk`, 'POST', results.data); showNotificationModal('success', 'Imported', `Imported ${results.data.length} items.`); window.hideModal('importModal'); refreshAllData(); } catch (e) { showNotificationModal('warning', 'Error', e.message); } }});
};

window.showQrModal = function(sn, name) { document.getElementById('qrModalTitle').innerText = name; QRCode.toCanvas(document.getElementById('qrCanvas'), `${window.location.origin}/details.html?sn=${sn}`, { width: 200 }); window.openModalWindow('qrModal'); };

window.buildLoanHistoryCards = function() {
    const container = document.getElementById('LoanHistoryContainer'); if(!container) return; container.innerHTML = ''; const loans = allData.LoanHistory || [];
    if(loans.length === 0) { container.innerHTML = `<p class="text-center text-gray-500">${t('no_data')}</p>`; return; }
    const grouped = {}; loans.forEach(l => { if(!grouped[l.LoanGroupID]) grouped[l.LoanGroupID] = { ...l, items: [] }; grouped[l.LoanGroupID].items.push(l); });
    let html = ''; const groupsArray = Object.values(grouped).sort((a,b) => new Date(b.LoanDate) - new Date(a.LoanDate));
    groupsArray.forEach(g => {
        html += `<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-3 border-l-4 ${g.Status==='Returned'?'border-green-500':'border-yellow-500'}"><div class="flex justify-between items-center cursor-pointer" onclick="this.nextElementSibling.classList.toggle('hidden')"><div><h4 class="font-bold text-gray-800 dark:text-white">${g.BorrowerName}</h4><p class="text-xs text-gray-500">${new Date(g.LoanDate).toLocaleDateString('th-TH')} - ${g.LoanGroupID}</p></div><span class="px-2 py-1 rounded text-xs font-semibold ${g.Status==='Returned'?'bg-green-100 text-green-800':'bg-yellow-100 text-yellow-800'}">${t(g.Status.toLowerCase().replace(' ', '_')) || g.Status}</span></div><div class="hidden mt-3 pt-3 border-t dark:border-gray-700"><ul class="text-sm space-y-2 mb-4">${g.items.map(i => `<li class="flex justify-between border-b dark:border-gray-700 pb-1 border-dashed"><span>${i.DeviceSerial} <span class="text-xs text-gray-500 ml-1">(${t(i.DeviceType.toLowerCase()) || i.DeviceType})</span></span><span class="${i.Status==='Returned'?'text-green-500':'text-yellow-500'} font-medium">${t(i.Status.toLowerCase().replace(' ', '_')) || i.Status}</span></li>`).join('')}</ul><div class="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl flex flex-col items-center border border-gray-100 dark:border-gray-700"><p class="text-sm font-bold mb-3 text-gray-700 dark:text-gray-300"><i class="fas fa-qrcode mr-2 text-indigo-500"></i>QR Code คืนอุปกรณ์</p><div class="bg-white p-2 rounded-lg shadow-sm border border-gray-200 mb-4 inline-block"><canvas id="qr-loan-${g.LoanGroupID}"></canvas></div><div class="flex space-x-3 w-full justify-center"><button onclick="window.copyLoanLink('${g.LoanGroupID}')" class="flex-1 max-w-[140px] text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-400 py-2 rounded-lg font-bold transition shadow-sm border border-indigo-200 dark:border-indigo-800 flex items-center justify-center"><i class="fas fa-link mr-1"></i> คัดลอกลิงก์</button><button onclick="window.downloadLoanQR('${g.LoanGroupID}', '${g.BorrowerName}', '${new Date(g.LoanDate).toLocaleDateString('th-TH')}')" class="flex-1 max-w-[140px] text-xs bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-400 py-2 rounded-lg font-bold transition shadow-sm border border-green-200 dark:border-green-800 flex items-center justify-center"><i class="fas fa-download mr-1"></i> โหลดภาพ</button></div></div></div></div>`;
    });
    container.innerHTML = html;
    groupsArray.forEach(g => { const canvas = document.getElementById(`qr-loan-${g.LoanGroupID}`); if (canvas) { const returnUrl = `${window.location.origin}/return.html?id=${g.LoanGroupID}`; QRCode.toCanvas(canvas, returnUrl, { width: 140, margin: 1, color: { dark: '#000000', light: '#ffffff' } }); } });
};

window.copyLoanLink = function(loanId) {
    const url = `${window.location.origin}/return.html?id=${loanId}`; const textArea = document.createElement("textarea"); textArea.value = url; document.body.appendChild(textArea); textArea.select();
    try { document.execCommand("copy"); showNotificationModal('success', 'คัดลอกลิงก์แล้ว', 'สามารถนำลิงก์นี้ไปส่งให้ผู้ยืมผ่าน Line/Chat เพื่อกดทำรายการคืนได้ทันที'); } catch (err) { showNotificationModal('warning', 'ผิดพลาด', 'ไม่สามารถคัดลอกลิงก์ได้'); } document.body.removeChild(textArea);
};

window.downloadLoanQR = function(loanId, borrowerName, loanDate) {
    const qrCanvas = document.getElementById(`qr-loan-${loanId}`);
    if(qrCanvas) {
        const compositeCanvas = document.createElement('canvas'); const ctx = compositeCanvas.getContext('2d');
        const qrSize = qrCanvas.width; const textHeight = 80; 
        compositeCanvas.width = qrSize; compositeCanvas.height = qrSize + textHeight;
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);
        ctx.drawImage(qrCanvas, 0, 0);
        ctx.fillStyle = '#1f2937'; ctx.textAlign = 'center';
        ctx.font = 'bold 13px sans-serif'; ctx.fillText(`รหัสยืม: ${loanId}`, qrSize / 2, qrSize + 20);
        ctx.font = '12px sans-serif'; ctx.fillText(`ผู้ยืม: ${borrowerName}`, qrSize / 2, qrSize + 40);
        ctx.fillStyle = '#6b7280'; ctx.fillText(`วันที่ยืม: ${loanDate}`, qrSize / 2, qrSize + 60);
        const link = document.createElement('a'); link.download = `Return_QRCode_${loanId}.png`; link.href = compositeCanvas.toDataURL("image/png"); link.click();
    }
};

window.buildMaintenancePage = function() {
    const container = document.getElementById('MaintenanceContainer'); if(!container) return; container.innerHTML = ''; const logs = allData['Maintenance Log'] || [];
    logs.sort((a,b) => new Date(b.logDate) - new Date(a.logDate)).forEach(log => { container.innerHTML += `<div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-3"><div class="flex justify-between"><span class="font-bold text-gray-800 dark:text-white">${log.deviceCollection} (ID: ${log.deviceId})</span><span class="text-sm text-gray-500">${new Date(log.logDate).toLocaleDateString()}</span></div><p class="text-gray-600 dark:text-gray-300 mt-1">${log.description}</p><div class="mt-2 text-xs text-gray-400 flex justify-between"><span>Tech: ${log.technician || '-'}</span><span>Cost: ${log.cost || 0}</span></div></div>`; });
};

window.filterLoanHistory = function(val) { const term=val.toUpperCase(); document.querySelectorAll('#LoanHistoryContainer > div').forEach(el => el.style.display = el.textContent.toUpperCase().includes(term)?'':'none'); };
window.filterMaintenanceHistory = function(val) { const term=val.toUpperCase(); document.querySelectorAll('#MaintenanceContainer > div').forEach(el => el.style.display = el.textContent.toUpperCase().includes(term)?'':'none'); };
window.filterAssetsByUser = function(val) { const term=val.toUpperCase(); document.querySelectorAll('#AssetsByUserContainer > details').forEach(el => el.style.display = el.textContent.toUpperCase().includes(term)?'':'none'); };

window.buildAssetsByUserPage = function() {
    const container = document.getElementById('AssetsByUserContainer'); if(!container) return; container.innerHTML = ''; const byUser = {}; const skipKeys = ['Staff', 'CustomMenus', 'TransactionHistory', 'LoanHistory', 'Maintenance Log', 'admins', 'Software'];
    Object.keys(allData).forEach(key => { if (skipKeys.includes(key)) return; (allData[key] || []).forEach(item => { const u = item.UserName || 'Unassigned'; if(!byUser[u]) byUser[u] = []; byUser[u].push({...item, type: key}); }); });
    Object.keys(byUser).sort().forEach(user => {
        if(user === 'Unassigned') return; const assets = byUser[user];
        container.innerHTML += `<details class="group bg-white dark:bg-gray-800 rounded-lg shadow mb-3"><summary class="p-4 flex justify-between items-center cursor-pointer list-none"><span class="font-bold text-gray-800 dark:text-white"><i class="fas fa-user mr-2"></i>${user}</span><span class="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">${assets.length} items</span></summary><div class="p-4 border-t dark:border-gray-700"><ul class="text-sm space-y-2">${assets.map(a => `<li class="flex justify-between items-center"><span>${a.ComputerName || a.DeviceName || a.ItemName || a.Model} <span class="text-xs text-gray-500">(${t(a.type.toLowerCase()) || a.type})</span></span><span class="text-xs font-mono">${a.SerialNumber || a.MonitorSerial || '-'}</span></li>`).join('')}</ul></div></details>`;
    });
};

function injectRapidEntryModal() {
    if (document.getElementById('rapidEntryModal')) return;
    const modalHtml = `<div id="rapidEntryModal" class="modal opacity-0 pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-gray-900/60 transition-opacity duration-300"><div class="modal-content bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700 transition-all transform scale-95"><div class="px-6 py-5 bg-white dark:bg-gray-800 flex justify-between items-start border-b border-gray-200 dark:border-gray-700 relative z-10 shadow-sm"><div class="flex items-center"><div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-4 shadow-inner"><i class="fas fa-barcode text-blue-600 dark:text-blue-400 text-xl"></i></div><div><h3 class="text-xl font-bold text-gray-900 dark:text-white leading-tight">${t('rapid_scan')}</h3><p class="text-xs text-gray-500 font-medium mt-1 uppercase tracking-widest" id="rapidCollectionName">Category</p></div></div><button onclick="window.closeRapidEntryModal()" class="absolute top-5 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-red-100 hover:text-red-500 transition-colors"><i class="fas fa-times text-lg"></i></button></div><div class="p-6 bg-white dark:bg-gray-800 flex-1"><p class="text-sm text-gray-600 dark:text-gray-400 mb-4">สแกนบาร์โค้ด หรือพิมพ์ Serial Number แล้วกด Enter ระบบจะเพิ่มเข้าคลังเป็นสถานะ <span class="font-bold text-blue-600">Storage</span> ทันที</p><div class="relative mb-6"><div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><i class="fas fa-search text-gray-400"></i></div><input type="text" id="rapidScanInput" onkeypress="window.handleRapidScan(event)" class="block w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500 text-lg font-mono rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all shadow-inner" placeholder="Scan Barcode here..." autocomplete="off"></div><h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Recent Scans (รอบนี้)</h4><div id="rapidScanLog" class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar border border-gray-100 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-900/50"></div></div></div></div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

window.openRapidEntryModal = function(collectionName) {
    window.currentRapidCollection = collectionName;
    document.getElementById('rapidCollectionName').innerText = collectionConfigs[collectionName].isCustom ? collectionConfigs[collectionName].displayName : t(collectionName.toLowerCase()) || collectionName;
    document.getElementById('rapidScanInput').value = ''; document.getElementById('rapidScanLog').innerHTML = '';
    window.openModalWindow('rapidEntryModal'); setTimeout(() => document.getElementById('rapidScanInput').focus(), 100);
};

window.closeRapidEntryModal = async function() { window.hideModal('rapidEntryModal'); await refreshAllData(); window.buildTable(window.currentRapidCollection); window.updateDashboard(currentDashboardFolder); };

window.handleRapidScan = async function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); const inputEl = document.getElementById('rapidScanInput'); const serial = inputEl.value.trim(); if (!serial) return;
        inputEl.value = ''; inputEl.disabled = true; 
        await window.processRapidEntry(serial);
        inputEl.disabled = false; inputEl.focus();
    }
};

window.processRapidEntry = async function(serial) {
    const col = window.currentRapidCollection; const config = collectionConfigs[col]; const logEl = document.getElementById('rapidScanLog');
    let payload = { Status: 'Storage', Description: 'Added via Rapid Scan Mode' }; payload[config.serialField] = serial;
    if (config.nameField && config.nameField !== config.serialField) { payload[config.nameField] = `New-${serial}`; }
    const logId = 'log-' + Date.now();
    logEl.insertAdjacentHTML('afterbegin', `<div id="${logId}" class="text-sm text-gray-500 flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 mb-2"><span class="font-mono dark:text-gray-200">${serial}</span><span class="text-yellow-500"><i class="fas fa-spinner fa-spin"></i> Saving...</span></div>`);
    try { await apiRequest(`/api/inventory/${col}`, 'POST', payload); document.getElementById(logId).innerHTML = `<span class="font-mono text-gray-800 dark:text-gray-200">${serial}</span><span class="text-green-500 font-bold"><i class="fas fa-check-circle"></i> Success</span>`; } catch (error) { document.getElementById(logId).innerHTML = `<span class="font-mono text-red-500">${serial}</span><span class="text-red-500 font-bold" title="${error.message}"><i class="fas fa-times-circle"></i> Failed</span>`; }
};

window.buildLabelPrinterPage = function() {
    const pageId = 'labelprinter-page'; let pageDiv = document.getElementById(pageId); if (!pageDiv) return;
    pageDiv.innerHTML = `<div class="flex justify-between items-center mb-6"><h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">${t('label_printer')}</h2><button onclick="window.printLabel()" class="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 shadow-md flex items-center"><i class="fas fa-print mr-2"></i> Print Label</button></div><div class="grid grid-cols-1 lg:grid-cols-12 gap-6"><div class="lg:col-span-4 space-y-6"><div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"><h3 class="font-semibold text-lg border-b dark:border-gray-700 pb-2 mb-4 text-gray-800 dark:text-white">1. Select Assets</h3><div class="space-y-4"><div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label><select id="labelCategorySelect" onchange="window.updateLabelItemDropdown()" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500"><option value="">-- Select Category --</option></select></div><div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex justify-between"><span>Items to Print</span><span class="text-indigo-600 dark:text-indigo-400 text-xs font-bold" id="selectedLabelCount">0 selected</span></label><div class="mb-2 px-1"><label class="inline-flex items-center cursor-pointer"><input type="checkbox" id="selectAllLabelItemsCb" onchange="window.toggleAllLabelItems(this.checked)" class="rounded text-indigo-600 focus:ring-indigo-500" disabled><span class="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">Select All</span></label></div><div id="labelItemList" class="max-h-48 overflow-y-auto space-y-1 border rounded-md p-2 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50"><p class="text-sm text-gray-500 text-center py-2">Select category first</p></div></div></div></div><div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"><h3 class="font-semibold text-lg border-b dark:border-gray-700 pb-2 mb-4 text-gray-800 dark:text-white">2. Label Dimensions</h3><div class="grid grid-cols-2 gap-4 mb-4"><div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Width (mm)</label><input type="number" id="labelWidth" value="50" onchange="window.updateLabelPreview()" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500"></div><div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Height (mm)</label><input type="number" id="labelHeight" value="30" onchange="window.updateLabelPreview()" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500"></div></div><label class="flex items-center space-x-2 cursor-pointer bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800"><input type="checkbox" id="labelSplitMode" onchange="window.updateLabelPreview()" class="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"><span class="text-sm font-bold text-indigo-800 dark:text-indigo-200">Split Label (Top/Bottom - 2 items)</span></label></div><div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"><h3 class="font-semibold text-lg border-b dark:border-gray-700 pb-2 mb-4 text-gray-800 dark:text-white">3. Data to Print</h3><div id="labelFieldsContainer" class="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar"><p class="text-sm text-gray-500 text-center">Select category first</p></div></div></div><div class="lg:col-span-8"><div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex flex-col items-center justify-center min-h-[500px] border-2 border-dashed border-gray-300 dark:border-gray-600"><h3 class="text-gray-400 dark:text-gray-500 mb-6 font-bold tracking-widest uppercase">Live Preview</h3><div class="bg-gray-100 dark:bg-gray-900 p-6 rounded-lg overflow-auto max-w-full max-h-[600px] custom-scrollbar"><div id="print-area" class="flex flex-col gap-4 items-center"><div class="text-[10px] text-gray-400 text-center py-10 font-medium">No Items Selected</div></div></div><p class="text-xs text-gray-500 mt-6 max-w-md text-center"><i class="fas fa-info-circle mr-1 text-indigo-500"></i> When printing, make sure to set <strong>Margins to "None"</strong> and disable headers/footers in your browser's print dialog.</p></div></div></div>`;
    const catSelect = document.getElementById('labelCategorySelect');
    const skipKeys = ['Staff', 'CustomMenus', 'TransactionHistory', 'LoanHistory', 'Maintenance Log', 'admins', 'Software'];
    Object.keys(allData).forEach(cat => { if (!skipKeys.includes(cat) && Array.isArray(allData[cat])) { const displayName = collectionConfigs[cat].isCustom ? collectionConfigs[cat].displayName : t(cat.toLowerCase()) || cat; catSelect.innerHTML += `<option value="${cat}">${displayName}</option>`; } });
};

window.updateLabelItemDropdown = function() {
    const cat = document.getElementById('labelCategorySelect').value;
    currentLabelCategory = cat; currentLabelItems = []; document.getElementById('selectedLabelCount').textContent = `0 selected`; window.updateLabelPreview(); 
    if (!cat) return;
    const items = allData[cat] || []; const config = collectionConfigs[cat] || { nameField: 'SerialNumber', serialField: 'SerialNumber', formFields: ['SerialNumber', 'Status'] }; 
    document.getElementById('selectAllLabelItemsCb').disabled = false; document.getElementById('selectAllLabelItemsCb').checked = false;
    document.getElementById('labelItemList').innerHTML = items.length === 0 ? '<p class="text-sm text-gray-500 text-center py-2">No items found</p>' : items.map(item => {
        const name = item[config.nameField] || item.ComputerName || item.DeviceName || item.ItemName || item.Model || 'Unnamed'; const serial = item[config.serialField] || item.SerialNumber || item._id; const id = item._id || item.id;
        return `<label class="flex items-center space-x-2 cursor-pointer p-1.5 hover:bg-white dark:hover:bg-gray-600 rounded border border-transparent hover:border-gray-200 dark:hover:border-gray-500 transition-colors"><input type="checkbox" class="label-item-cb rounded text-indigo-600 focus:ring-indigo-500" value="${id}" onchange="window.toggleLabelItem('${id}', this.checked)"><span class="text-sm text-gray-700 dark:text-gray-300 truncate w-full" title="${name} (${serial})"><span class="font-medium">${name}</span> <span class="text-xs text-gray-500 ml-1">(${serial})</span></span></label>`;
    }).join('');
    document.getElementById('labelFieldsContainer').innerHTML = '';
    config.formFields.forEach(field => { const isChecked = field === config.nameField || field === config.serialField ? 'checked' : ''; document.getElementById('labelFieldsContainer').innerHTML += `<label class="flex items-center space-x-2 cursor-pointer p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"><input type="checkbox" class="label-field-cb rounded text-indigo-600 focus:ring-indigo-500" value="${field}" ${isChecked} onchange="window.updateLabelPreview()"><span class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">${field}</span></label>`; });
};

window.toggleLabelItem = function(id, isChecked) {
    if (isChecked) { if (!currentLabelItems.includes(id)) currentLabelItems.push(id); } else { currentLabelItems = currentLabelItems.filter(i => i !== id); document.getElementById('selectAllLabelItemsCb').checked = false; }
    document.getElementById('selectedLabelCount').textContent = `${currentLabelItems.length} selected`; window.updateLabelPreview();
};

window.toggleAllLabelItems = function(isChecked) {
    currentLabelItems = []; document.querySelectorAll('.label-item-cb').forEach(cb => { cb.checked = isChecked; if (isChecked) currentLabelItems.push(cb.value); });
    document.getElementById('selectedLabelCount').textContent = `${currentLabelItems.length} selected`; window.updateLabelPreview();
};

function generateLabelHTML(item, isSplit) {
    if (!item) return `<div class="w-full ${isSplit ? 'h-1/2' : 'h-full'} bg-white"></div>`; 
    const checkedFields = Array.from(document.querySelectorAll('.label-field-cb:checked')).map(cb => cb.value);
    let textHtml = ''; let fontSizeClass = isSplit ? 'text-[6pt] leading-[7pt]' : 'text-[7pt] leading-[8pt]';
    if(checkedFields.length <= 2) fontSizeClass = isSplit ? 'text-[8pt] leading-[9pt] font-bold' : 'text-[10pt] leading-[11pt] font-bold'; else if(checkedFields.length <= 4) fontSizeClass = isSplit ? 'text-[7pt] leading-[8pt]' : 'text-[8pt] leading-[9pt]';
    checkedFields.forEach((field, index) => { const val = item[field] || '-'; const extraClass = index === 0 ? 'font-bold' : ''; textHtml += `<div class="${fontSizeClass} ${extraClass} truncate text-black font-sans" style="max-width: 100%;">${val}</div>`; });
    const config = collectionConfigs[currentLabelCategory] || {}; const serial = item[config.serialField] || item.SerialNumber || item._id;
    return `<div class="w-full flex p-1 box-border bg-white ${isSplit ? 'h-1/2' : 'h-full'}"><div class="h-full flex flex-col items-center justify-center pr-1 shrink-0" style="width: 35%;"><canvas data-serial="${serial}" class="qr-render-target max-w-full max-h-full"></canvas></div><div class="h-full w-full pl-1 flex flex-col justify-center overflow-hidden border-l border-gray-300 bg-white">${textHtml}</div></div>`;
}

window.updateLabelPreview = function() {
    const printArea = document.getElementById('print-area'); const w = document.getElementById('labelWidth').value || 50; const h = document.getElementById('labelHeight').value || 30; const isSplit = document.getElementById('labelSplitMode').checked;
    if (currentLabelItems.length === 0) { printArea.innerHTML = '<div class="text-[10px] text-gray-400 text-center py-10 font-medium">No Items Selected</div>'; return; }
    let previewHtml = ''; const itemsData = currentLabelItems.map(id => allData[currentLabelCategory].find(i => i._id === id || i.id === id)).filter(Boolean);
    if (isSplit) { for (let i = 0; i < itemsData.length; i += 2) { previewHtml += `<div class="label-page preview-border relative box-border bg-white text-black flex flex-col overflow-hidden" style="width: ${w}mm; height: ${h}mm; border: 1px solid #ccc; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">${generateLabelHTML(itemsData[i], true)}${itemsData[i+1] ? `<div style="border-top: 1px dashed #999; width: 100%;"></div>` : ''}${generateLabelHTML(itemsData[i+1], true)}</div>`; } } else { itemsData.forEach(item => { previewHtml += `<div class="label-page preview-border relative box-border bg-white text-black flex overflow-hidden" style="width: ${w}mm; height: ${h}mm; border: 1px solid #ccc; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">${generateLabelHTML(item, false)}</div>`; }); }
    printArea.innerHTML = previewHtml;
    printArea.querySelectorAll('.qr-render-target').forEach(canvas => { QRCode.toCanvas(canvas, `${window.location.origin.replace(/\/$/, '')}/details.html?sn=${canvas.dataset.serial}`, { width: 256, margin: 0, color: { dark: '#000000', light: '#ffffff' } }); });
};

window.printLabel = function() {
    if (currentLabelItems.length === 0) return showNotificationModal('warning', 'No Items Selected', 'Please select at least one item to print.');
    const w = document.getElementById('labelWidth').value || 50; const h = document.getElementById('labelHeight').value || 30;
    let dynamicStyle = document.getElementById('dynamic-print-style'); if (!dynamicStyle) { dynamicStyle = document.createElement('style'); dynamicStyle.id = 'dynamic-print-style'; document.head.appendChild(dynamicStyle); }
    dynamicStyle.innerHTML = `@media print { @page { size: ${w}mm ${h}mm; margin: 0mm; } }`;
    window.print();
};

window.openCloneModal = function(collectionName, id) {
    const item = allData[collectionName].find(i => i._id === id || i.id === id); if (!item) return;
    const config = collectionConfigs[collectionName]; const name = item[config.nameField] || item.ComputerName || item.ItemName || item.DeviceName || 'Unknown Device'; const serial = item[config.serialField] || item.SerialNumber || id;
    document.getElementById('cloneSourceInfo').textContent = `${name} (${serial})`; document.getElementById('cloneCollection').value = collectionName; document.getElementById('cloneSourceId').value = id; document.getElementById('cloneSerialNumbers').value = '';
    window.openModalWindow('cloneModal');
};

window.processClone = async function() {
    const collectionName = document.getElementById('cloneCollection').value; const sourceId = document.getElementById('cloneSourceId').value; const serialsText = document.getElementById('cloneSerialNumbers').value;
    const serialNumbers = serialsText.split('\n').map(s => s.trim()).filter(s => s !== '');
    if (serialNumbers.length === 0) return showNotificationModal('warning', 'ไม่มีข้อมูล', 'กรุณาระบุ Serial Number อย่างน้อย 1 รายการ');
    try { await apiRequest(`/api/inventory/${collectionName}/clone-bulk`, 'POST', { sourceId: sourceId, serialNumbers: serialNumbers, overrides: { lastSeenOnline: null, IPAddress: '', MacAddress: '' } }); showNotificationModal('success', 'โคลนสำเร็จ', `โคลนอุปกรณ์เสร็จสิ้นจำนวน ${serialNumbers.length} รายการ ระบบบันทึกเข้า Storage แล้ว`); window.hideModal('cloneModal'); await refreshAllData(); window.buildTable(collectionName); window.updateDashboard(currentDashboardFolder); } catch (error) { showNotificationModal('warning', 'การโคลนล้มเหลว', error.message); }
};

window.openMoveModal = function(collectionName, id) {
    const item = allData[collectionName].find(i => i._id === id || i.id === id); if (!item) return;
    const config = collectionConfigs[collectionName]; const name = item[config.nameField] || item.ComputerName || item.ItemName || item.DeviceName || 'Unknown Device'; const serial = item[config.serialField] || item.SerialNumber || id;
    document.getElementById('moveSourceInfo').textContent = `${name} (${serial}) จากหมวด ${config.displayName || collectionName}`; document.getElementById('moveSourceCollection').value = collectionName; document.getElementById('moveSourceId').value = id;
    const targetSelect = document.getElementById('moveTargetCollection'); targetSelect.innerHTML = '<option value="">-- เลือกหมวดหมู่ปลายทาง --</option>';
    Object.keys(collectionConfigs).forEach(cat => { const skipKeys = ['Software', 'Staff', 'CustomMenus', 'TransactionHistory', 'LoanHistory', 'Maintenance Log', 'admins']; if (cat !== collectionName && !skipKeys.includes(cat)) { const displayName = collectionConfigs[cat].isCustom ? collectionConfigs[cat].displayName : t(cat.toLowerCase()) || cat; targetSelect.innerHTML += `<option value="${cat}">${displayName}</option>`; } });
    window.openModalWindow('moveModal');
};

window.processMove = async function() {
    const sourceCollection = document.getElementById('moveSourceCollection').value; const sourceId = document.getElementById('moveSourceId').value; const targetCollection = document.getElementById('moveTargetCollection').value;
    if (!targetCollection) return showNotificationModal('warning', 'ข้อมูลไม่ครบ', 'กรุณาเลือกหมวดหมู่ปลายทาง');
    if (confirm(`คุณแน่ใจหรือไม่ที่จะย้ายอุปกรณ์นี้ไปยังหมวดหมู่ ${collectionConfigs[targetCollection]?.displayName || targetCollection} ?`)) { try { await apiRequest(`/api/inventory/${sourceCollection}/move`, 'POST', { targetCollection: targetCollection, id: sourceId }); showNotificationModal('success', 'ย้ายสำเร็จ', `ย้ายอุปกรณ์ไปยังหมวดหมู่ ${collectionConfigs[targetCollection]?.displayName || targetCollection} เรียบร้อยแล้ว`); window.hideModal('moveModal'); await refreshAllData(); window.buildTable(sourceCollection); window.updateDashboard(currentDashboardFolder); } catch (error) { showNotificationModal('warning', 'การย้ายล้มเหลว', error.message); } }
};
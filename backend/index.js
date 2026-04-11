const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const ping = require('ping');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 🌟 ตั้งค่าให้ Express ให้บริการไฟล์ Static (Frontend)
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Configuration
const mongoUri = "mongodb+srv://kaaom3:Kaaom321A@cluster0.fx7nlup.mongodb.net/inventoryDB_Cloned?appName=Cluster0"; 
const dbName = "inventoryDB_Cloned"; 
const jwtSecret = "your_super_secret_key_change_this"; 
const API_SECRET_KEY = "KAAOM321A"; 

let db;

// ===================================================================
// 🌟 ID HELPER FUNCTIONS (ป้องกัน Error MongoDB ID ทุกรูปแบบ)
// ===================================================================
const isValidObjectId = (id) => {
    if (!id) return false;
    if (typeof id === 'string') {
        return id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id);
    }
    return ObjectId.isValid(id);
};

const buildIdQuery = (id) => {
    if (isValidObjectId(id)) {
        return { $or: [{ _id: new ObjectId(id) }, { _id: id }, { id: id }] };
    }
    return { $or: [{ _id: id }, { id: id }] };
};

const buildBulkIdQuery = (ids) => {
    const validObjIds = [];
    const stringIds = [];

    ids.forEach(id => {
        if (isValidObjectId(id)) {
            validObjIds.push(new ObjectId(id));
        }
        if (typeof id === 'string') {
            stringIds.push(id);
        } else if (id && id.toString) {
            stringIds.push(id.toString());
        }
    });

    const orConditions = [];
    if (validObjIds.length > 0) {
        orConditions.push({ _id: { $in: validObjIds } });
    }
    if (stringIds.length > 0) {
        orConditions.push({ _id: { $in: stringIds } });
        orConditions.push({ id: { $in: stringIds } });
    }

    if (orConditions.length === 0) return { _id: null }; 
    return { $or: orConditions };
};

// ===================================================================
// --- Connect to MongoDB ---
// ===================================================================
MongoClient.connect(mongoUri)
    .then(async client => {
        db = client.db(dbName);
        console.log(`Connected to MongoDB: ${dbName}`);

        try {
            const adminCollection = db.collection('admins');
            if (await adminCollection.countDocuments() === 0) {
                const hashedPassword = await bcrypt.hash('admin123', 10);
                await adminCollection.insertOne({ email: 'admin', password: hashedPassword });
                console.log("Default admin created (admin / admin123)");
            }
        } catch (e) { console.error("Error creating default admin:", e); }
    })
    .catch(error => console.error("Failed to connect to MongoDB", error));

// ===================================================================
// --- Middlewares ---
// ===================================================================
const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const token = bearerHeader.split(' ')[1];
        jwt.verify(token, jwtSecret, (err, decoded) => {
            if (err) return res.status(403).json({ message: "Invalid token" });
            req.user = decoded;
            next();
        });
    } else {
        res.status(401).json({ message: "No token provided" });
    }
};

const verifyApiKey = (req, res, next) => {
    const key = req.headers['x-api-key'];
    if (key && key === API_SECRET_KEY) next();
    else res.status(401).json({ status: "error", message: "Unauthorized: Invalid API Key" });
};

// ===================================================================
// --- Authentication Routes ---
// ===================================================================
app.post('/api/login', async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { email, password } = req.body;
        const admin = await db.collection('admins').findOne({ email });
        if (admin && await bcrypt.compare(password, admin.password)) {
            const token = jwt.sign({ id: admin._id, email: admin.email }, jwtSecret, { expiresIn: '24h' });
            res.json({ token, user: { email: admin.email } });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.post('/api/admins', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { email, password } = req.body;
        if (await db.collection('admins').findOne({ email })) return res.status(400).json({ message: "Admin already exists" });
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.collection('admins').insertOne({ email, password: hashedPassword });
        res.status(201).json({ message: "Admin created" });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.get('/api/admins/list', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const users = await db.collection('admins').find({}, { projection: { password: 0 } }).toArray();
        res.json({ users });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.delete('/api/admins/delete', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        await db.collection('admins').deleteOne(buildIdQuery(req.body.uid));
        res.json({ message: "Admin deleted" });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// ===================================================================
// --- PowerShell Script Integration (Sync & Heartbeat) ---
// ===================================================================
app.post('/api/inventory/sync', verifyApiKey, async (req, res) => {
    if (!db) return res.status(500).json({ status: "error", message: "Database not connected" });
    try {
        const data = req.body;
        if (!data || !data.computerName) return res.status(400).json({ status: "error", message: "Invalid payload: missing computerName" });

        const now = new Date();
        
        // 🌟 ฟังก์ชันตรวจสอบ S/N ว่าเป็นค่าขยะหรือไม่ (N/A, None, ค่าว่าง)
        const isInvalidSN = (sn) => {
            if (!sn) return true;
            const cleanSn = sn.trim().toUpperCase();
            return cleanSn === '' || cleanSn === 'N/A' || cleanSn === 'NONE';
        };

        const scriptHasInvalidSN = isInvalidSN(data.serialNumber);

        // 🌟 กำหนด Collection ปลายทางจาก Type ที่สคริปต์ส่งมา (เช่น Desktop, Laptop)
        // ถ้าไม่รู้จักหรือไม่ส่งมา ให้ลง Collection 'Computers' แทน
        const targetCollection = (data.type && data.type !== 'Unknown') ? data.type : 'Computers';

        // 1. ค้นหาอุปกรณ์เดิมในระบบด้วยเงื่อนไขที่รัดกุมขึ้น
        let existingDevice = null;
        
        // 1.1 ลองหาจาก Serial Number ก่อน (ถ้าสคริปต์ส่งค่ามาและไม่ใช่ N/A หรือ None)
        if (!scriptHasInvalidSN) {
            existingDevice = await db.collection(targetCollection).findOne({ SerialNumber: data.serialNumber });
        }
        
        // 1.2 ถ้าไม่เจอจาก S/N ให้ลองหาจากชื่อ ComputerName (กรณีในเว็บแก้ S/N ไปแล้ว แต่สคริปต์ยังส่ง N/A/None มา)
        if (!existingDevice && data.computerName) {
            existingDevice = await db.collection(targetCollection).findOne({ ComputerName: data.computerName });
        }

        // 2. เตรียมข้อมูลอัปเดตสเปคเครื่อง (อัปเดตเฉพาะฝั่งฮาร์ดแวร์/OS)
        const updatePayload = {
            $set: {
                ComputerName: data.computerName,
                Manufacturer: data.manufacturer,
                Model: data.model,
                Type: data.type,
                CPU: data.cpu,
                RAM_GB: data.ramGB,
                DiskSize_GB: data.diskSizeGB,
                OS: data.os,
                IPAddress: data.ipAddress,
                Timestamp: now,
                lastSeenOnline: now
            }
        };

        // 🌟 จัดการสถานะ (Status)
        if (existingDevice) {
            // ถ้าของเดิมเป็น Storage แต่สคริปต์รันมาได้ แสดงว่าเครื่องถูกเปิดใช้งานแล้ว ให้เปลี่ยนเป็น Active
            if (existingDevice.Status === 'Storage') {
                updatePayload.$set.Status = 'Active';
            }
            // ถ้านอกเหนือจากนี้ (เช่น Repair, Damaged, On Loan) ให้คงสถานะเดิมเอาไว้ ไม่เอา Active ไปทับ
        } else {
            updatePayload.$set.Status = 'Active'; // เครื่องใหม่ให้เป็น Active เลย
        }

        // 🌟 อัปเดต Serial Number เฉพาะเมื่อสคริปต์อ่านค่ามาได้จริง (ไม่ใช่ N/A หรือ None)
        // ป้องกันการเอาคำว่า None ไปเขียนทับ S/N ที่แอดมินแก้ไขไว้ในเว็บแล้ว
        if (!scriptHasInvalidSN) {
            updatePayload.$set.SerialNumber = data.serialNumber;
        } else if (!existingDevice) {
            // กรณีสร้างใหม่และสคริปต์ส่ง None มา ก็ให้ใช้ค่าที่ส่งมา (สร้างครั้งแรก)
            updatePayload.$set.SerialNumber = data.serialNumber || 'None';
        }

        // 🌟 จัดการ Location: ไม่อัปเดตทับถ้าผู้ใช้งานกรอกไว้ในระบบแล้ว
        if (existingDevice && existingDevice.Location && existingDevice.Location.trim() !== '') {
            // คงค่า Location เดิมไว้
        } else {
            updatePayload.$set.Location = data.location || '';
        }

        // 🌟 จัดการ UserName: ไม่อัปเดตทับถ้าผู้ใช้งานกรอก/Assign ไว้ในระบบแล้ว
        if (existingDevice && existingDevice.UserName && existingDevice.UserName.trim() !== '') {
            // คงค่า UserName เดิมไว้
        } else {
            updatePayload.$set.UserName = data.userName || '';
        }

        // 3. บันทึกลง Database
        if (existingDevice) {
            // เจอเครื่องเดิม -> ให้อัปเดตข้อมูลทับเครื่องเดิม
            await db.collection(targetCollection).updateOne({ _id: existingDevice._id }, updatePayload);
        } else {
            // ไม่เจอเครื่องเดิมเลย -> สร้างอุปกรณ์ใหม่
            await db.collection(targetCollection).insertOne(updatePayload.$set);
        }

        if (data.monitors && Array.isArray(data.monitors)) {
            for (const mon of data.monitors) {
                // ป้องกันการสร้าง Monitor ขยะที่ไม่มี S/N
                if (!isInvalidSN(mon.serial)) {
                    await db.collection('Monitors').updateOne(
                        { MonitorSerial: mon.serial },
                        { $set: { Manufacturer: mon.manufacturer, Model: mon.model, AssignedComputer: data.computerName, Status: "Active", Timestamp: now } },
                        { upsert: true }
                    );
                }
            }
        }

        if (data.accessories && Array.isArray(data.accessories)) {
            for (const acc of data.accessories) {
                // ป้องกันการสร้าง Accessory ขยะที่ไม่มี S/N
                if (!isInvalidSN(acc.SerialNumber)) {
                    await db.collection('Accessory').updateOne(
                        { SerialNumber: acc.SerialNumber },
                        { $set: { AccessoryType: acc.AccessoryType, Manufacturer: acc.Manufacturer, Model: acc.Model, AssignedComputer: data.computerName, Status: "Active", Timestamp: now } },
                        { upsert: true }
                    );
                }
            }
        }

        res.status(200).json({ status: "success", message: "Data synced successfully" });
    } catch (error) { res.status(500).json({ status: "error", message: error.message }); }
});

app.post('/api/heartbeat', async (req, res) => {
    if (!db) return res.status(500).json({ status: "error", message: "Database not connected" });
    try {
        const { hostname, collectionName = 'Computers' } = req.body;
        if (!hostname) return res.status(400).json({ status: "error", message: "Missing hostname" });
        
        await db.collection(collectionName).updateOne(
            { ComputerName: hostname },
            { $set: { lastSeenOnline: new Date() } }
        );
        res.status(200).json({ status: "success", message: "Heartbeat updated" });
    } catch (error) { res.status(500).json({ status: "error", message: error.message }); }
});

// ===================================================================
// --- LOCAL PING RELAY ROUTES ---
// ===================================================================
app.get('/api/relay/devices', verifyApiKey, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const customMenus = await db.collection('CustomMenus').find().toArray();
        const collectionsToCheck = ['Network', 'Printers', ...customMenus.map(m => m.name)];
        let allIpDevices = [];

        for (const collectionName of collectionsToCheck) {
            const devices = await db.collection(collectionName).find({ IPAddress: { $exists: true, $ne: "", $ne: "N/A" } }).toArray();
            devices.forEach(d => allIpDevices.push({ _id: d._id, collection: collectionName, IPAddress: d.IPAddress, Name: d.DeviceName || d.Name || d.ComputerName || d.ItemName || 'Unknown Device' }));
        }
        res.status(200).json(allIpDevices);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/relay/heartbeat', verifyApiKey, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { devices } = req.body;
        if (!devices || !Array.isArray(devices)) return res.status(400).json({ message: "Invalid payload" });
        const now = new Date();
        for (const dev of devices) {
            await db.collection(dev.collection).updateOne(buildIdQuery(dev.id), { $set: { lastSeenOnline: now } });
        }
        res.status(200).json({ message: `Updated ${devices.length} devices.` });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ===================================================================
// 🌟 Bulk Operations (แก้ไขหลายรายการ & นำเข้า CSV)
// ต้องวางไว้ด้านบนก่อน General CRUD เพื่อป้องกันการตีความ Route ผิดพลาด
// ===================================================================
app.post('/api/inventory/:collection/bulk', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const dataArray = req.body;
        if (!Array.isArray(dataArray) || dataArray.length === 0) return res.status(400).json({ message: "Invalid payload" });
        dataArray.forEach(d => { d.Timestamp = new Date(); if(!d.Status) d.Status = 'Storage'; });
        await db.collection(req.params.collection).insertMany(dataArray);
        res.status(201).json({ message: `Imported ${dataArray.length} items` });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.post('/api/inventory/:collection/bulk-delete', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ message: "Invalid payload" });
        
        const result = await db.collection(req.params.collection).deleteMany(buildBulkIdQuery(ids));
        res.status(200).json({ message: `ลบอุปกรณ์สำเร็จ ${result.deletedCount} ชิ้น (จากที่เลือก ${ids.length} ชิ้น)` });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.put('/api/inventory/:collection/bulk-update', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { ids, updateData } = req.body;
        if (!Array.isArray(ids) || ids.length === 0 || !updateData) return res.status(400).json({ message: "Invalid payload" });
        
        const result = await db.collection(req.params.collection).updateMany(
            buildBulkIdQuery(ids),
            { $set: updateData }
        );
        res.status(200).json({ message: `อัปเดตข้อมูลเปลี่ยนสำเร็จ ${result.modifiedCount} ชิ้น (จากอุปกรณ์ที่พบ ${result.matchedCount} ชิ้น)` });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.post('/api/inventory/:collection/clone-bulk', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { sourceId, serialNumbers, overrides } = req.body;
        if (!sourceId || !serialNumbers || !Array.isArray(serialNumbers)) return res.status(400).json({ message: "Invalid payload" });

        const sourceDevice = await db.collection(req.params.collection).findOne(buildIdQuery(sourceId));
        if (!sourceDevice) return res.status(404).json({ message: "Source device not found." });

        delete sourceDevice._id;
        const newDevices = serialNumbers.map(sn => {
            const newDevice = { ...sourceDevice, ...overrides };
            if (newDevice.hasOwnProperty('SerialNumber')) newDevice.SerialNumber = sn;
            if (newDevice.hasOwnProperty('MonitorSerial')) newDevice.MonitorSerial = sn;
            
            newDevice.Timestamp = new Date();
            if(!overrides || !overrides.Status) newDevice.Status = 'Storage';
            if(!overrides || !overrides.UserName) newDevice.UserName = '';
            newDevice.DisposalDate = null;
            newDevice.DisposalEvidence = null;
            return newDevice;
        });

        await db.collection(req.params.collection).insertMany(newDevices);
        res.status(201).json({ message: `Successfully cloned devices.` });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// ===================================================================
// --- Inventory General CRUD ---
// ===================================================================
app.get('/api/inventory/all', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const collections = await db.listCollections().toArray();
        const allData = {};
        for (let col of collections) {
            if (col.name !== 'admins') allData[col.name] = await db.collection(col.name).find().toArray();
        }
        res.json(allData);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.post('/api/inventory/:collection', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const data = req.body; data.Timestamp = new Date();
        const result = await db.collection(req.params.collection).insertOne(data);
        res.status(201).json(result);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.put('/api/inventory/:collection/:id', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const data = req.body; delete data._id; 
        await db.collection(req.params.collection).updateOne(buildIdQuery(req.params.id), { $set: data });
        res.json({ message: "Updated successfully" });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.delete('/api/inventory/:collection/:id', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        await db.collection(req.params.collection).deleteOne(buildIdQuery(req.params.id));
        res.json({ message: "Deleted successfully" });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// ===================================================================
// --- Device Finder (Public/Scanner) ---
// ===================================================================
app.get('/api/inventory/find/:sn', async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const sn = req.params.sn;
        const collections = await db.listCollections().toArray();
        for (let col of collections) {
            const skipKeys = ['admins', 'CustomMenus', 'Staff', 'TransactionHistory', 'LoanHistory', 'Maintenance Log'];
            if (skipKeys.includes(col.name)) continue;

            const searchIds = [sn];
            if (sn.length === 24 && /^[0-9a-fA-F]{24}$/.test(sn)) searchIds.push(new ObjectId(sn));

            const item = await db.collection(col.name).findOne({
                $or: [ { SerialNumber: sn }, { MonitorSerial: sn }, { _id: { $in: searchIds } }, { id: { $in: searchIds } } ]
            });
            if (item) return res.json({ item, collectionName: col.name });
        }
        res.status(404).json({ message: "Device not found" });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// ===================================================================
// --- Admin Handover & Return ---
// ===================================================================
app.post('/api/transactions/handover', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { staffUserName, devices } = req.body;
        if (!staffUserName || !devices || !Array.isArray(devices)) return res.status(400).json({ message: "Invalid payload" });

        for (const device of devices) {
            const colName = device.collection;
            const deviceId = device._id || device.id;
            if (!colName || !deviceId) continue;
            await db.collection(colName).updateOne(buildIdQuery(deviceId), { $set: { Status: 'Active', UserName: staffUserName } });
        }

        await db.collection('TransactionHistory').insertOne({
            type: 'Handover', staffUserName, timestamp: new Date(),
            devices: devices.map(d => ({ id: d._id || d.id, collection: d.collection, serial: d.SerialNumber || d.MonitorSerial || 'N/A' }))
        });
        res.status(200).json({ message: "Handover successful" });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.post('/api/transactions/return', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { devices } = req.body;
        if (!devices || !Array.isArray(devices)) return res.status(400).json({ message: "Invalid payload" });

        for (const device of devices) {
            const colName = device.collection;
            const deviceId = device.id || device._id;
            if (!colName || !deviceId) continue;
            await db.collection(colName).updateOne(buildIdQuery(deviceId), { $set: { Status: 'Storage', UserName: '' } });
        }

        await db.collection('TransactionHistory').insertOne({
            type: 'Return', staffUserName: 'System (Returned)', timestamp: new Date(),
            devices: devices.map(d => ({ id: d.id, collection: d.collection }))
        });
        res.status(200).json({ message: "Return successful" });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// ===================================================================
// --- Public Loan System ---
// ===================================================================
app.get('/api/public/loanable-items', async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const collections = await db.listCollections().toArray();
        const allData = {};
        for (let col of collections) {
            const skipKeys = ['admins', 'CustomMenus', 'Staff', 'TransactionHistory', 'LoanHistory', 'Maintenance Log'];
            if (!skipKeys.includes(col.name)) allData[col.name] = await db.collection(col.name).find({ Status: 'Storage' }).toArray();
        }
        res.json(allData);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.post('/api/loans/submit', async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { borrowerName, dueDate, notes, items } = req.body;
        if (!borrowerName || !dueDate || !items || !items.length) return res.status(400).json({ message: "Missing required fields" });

        const loanGroupId = "GRP-" + Date.now().toString().slice(-6);
        for (const item of items) {
            await db.collection(item.deviceType).updateOne(buildIdQuery(item.deviceId), { $set: { Status: 'On Loan', UserName: borrowerName } });
            await db.collection('LoanHistory').insertOne({
                LoanGroupID: loanGroupId, DeviceId: item.deviceId, DeviceSerial: item.deviceSerial, DeviceType: item.deviceType,
                BorrowerName: borrowerName, LoanDate: new Date(), DueDate: dueDate, Notes: notes, Status: 'On Loan'
            });
        }
        res.status(200).json({ message: "Loan submitted successfully", loanGroupId });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.get('/api/loans/group/:id', async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const loanItems = await db.collection('LoanHistory').find({ LoanGroupID: req.params.id }).toArray();
        if (loanItems.length === 0) return res.status(404).json({ message: "Loan group not found" });

        const devicesInfo = [];
        for (const item of loanItems) {
            const device = await db.collection(item.DeviceType).findOne(buildIdQuery(item.DeviceId));
            if (device) devicesInfo.push(device);
        }
        res.status(200).json({ loanItems, devices: devicesInfo });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.post('/api/loans/return', async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { transactionIds } = req.body;
        if (!transactionIds || !transactionIds.length) return res.status(400).json({ message: "Missing transactionIds" });

        for (const id of transactionIds) {
            const loanRecord = await db.collection('LoanHistory').findOne(buildIdQuery(id));
            if (loanRecord && loanRecord.Status === 'On Loan') {
                await db.collection(loanRecord.DeviceType).updateOne(buildIdQuery(loanRecord.DeviceId), { $set: { Status: 'Storage', UserName: '' } });
                await db.collection('LoanHistory').updateOne(buildIdQuery(id), { $set: { Status: 'Returned', ReturnDate: new Date() } });
            }
        }
        res.status(200).json({ message: "Return processed successfully" });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// ===================================================================
// --- Custom Menus & Staff Settings ---
// ===================================================================
app.post('/api/custom-menus', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const menuData = req.body;
        if (await db.collection('CustomMenus').findOne({ name: menuData.name })) return res.status(400).json({ message: "Menu ID already exists." });
        await db.collection('CustomMenus').insertOne(menuData);
        await db.createCollection(menuData.name).catch(()=>{});
        res.status(201).json({ message: "Menu created" });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.put('/api/custom-menus/:id', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        await db.collection('CustomMenus').updateOne(
            { name: req.params.id }, 
            { $set: { 
                displayName: req.body.displayName, 
                icon: req.body.icon, 
                parentId: req.body.parentId, 
                order: req.body.order, 
                fields: req.body.fields,
                displayColumns: req.body.displayColumns
            } }
        );
        res.json({ message: "Menu updated" });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.delete('/api/custom-menus/:id', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        await db.collection('CustomMenus').deleteOne({ name: req.params.id });
        res.json({ message: "Menu removed" });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.post('/api/staff', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try { await db.collection('Staff').insertOne(req.body); res.status(201).json({ message: "Staff added" }); } catch (error) { res.status(500).json({ message: error.message }); }
});

app.put('/api/staff/:id', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try { const d = req.body; delete d._id; await db.collection('Staff').updateOne(buildIdQuery(req.params.id), { $set: d }); res.json({ message: "Staff updated" }); } catch (error) { res.status(500).json({ message: error.message }); }
});

app.delete('/api/staff/:id', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try { await db.collection('Staff').deleteOne(buildIdQuery(req.params.id)); res.json({ message: "Staff deleted" }); } catch (error) { res.status(500).json({ message: error.message }); }
});

app.post('/api/inventory/maintenance', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const data = req.body; data.Timestamp = new Date();
        await db.collection('Maintenance Log').insertOne(data);
        res.status(201).json({ message: "Maintenance log added" });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.get('/api/ping/:target', verifyToken, async (req, res) => {
    try {
        const result = await ping.promise.probe(req.params.target, { timeout: 2 });
        res.json({ alive: result.alive, time: result.time });
    } catch (error) { res.status(500).json({ error: "Ping failed" }); }
});

// 🌟 ตั้งค่าให้รองรับ SPA (Single Page Application) Routing 
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start Server
app.listen(port, () => {
    console.log(`Inventory Backend API listening on port ${port}`);
});
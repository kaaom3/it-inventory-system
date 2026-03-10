const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // เปลี่ยนเป็น bcryptjs
const ping = require('ping');
const path = require('path'); // เพิ่ม module path สำหรับจัดการที่อยู่ไฟล์

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 🌟 ตั้งค่าให้ Express ให้บริการไฟล์ Static (Frontend)
// สมมติว่าไฟล์ HTML/JS ของคุณอยู่ในโฟลเดอร์เดียวกับ backend หรือโฟลเดอร์ frontend ที่แยกไว้
// หากไฟล์ Frontend อยู่ในโฟลเดอร์ชื่อ 'frontend' ที่ระดับเดียวกับ 'backend' ให้ใช้ path.join(__dirname, '../frontend')
// แต่ถ้าไฟล์ index.html อยู่ในโฟลเดอร์เดียวกับโฟลเดอร์รันโปรเจกต์ ใช้ path.join(__dirname, 'public') หรือโฟลเดอร์ที่ถูกต้อง
// ในที่นี้สมมติให้ใช้โฟลเดอร์ 'public' (คุณต้องเอาไฟล์ frontend ทั้งหมดไปใส่ในโฟลเดอร์นี้) หรือปรับ path ให้ตรงกับโครงสร้างจริงของคุณ
app.use(express.static(path.join(__dirname, '../frontend'))); // ปรับบรรทัดนี้ให้ตรงกับโครงสร้างโฟลเดอร์โปรเจกต์ของคุณ

// Configuration
const mongoUri = "mongodb+srv://kaaom3:Kaaom321A@cluster0.fx7nlup.mongodb.net/inventoryDB_Cloned?appName=Cluster0"; 
const dbName = "inventoryDB_Cloned"; 
const jwtSecret = "your_super_secret_key_change_this"; 
const API_SECRET_KEY = "KAAOM321A"; 

let db;

// --- Connect to MongoDB ---
MongoClient.connect(mongoUri)
    .then(async client => {
        db = client.db(dbName);
        console.log(`Connected to MongoDB: ${dbName}`);

        // Create default admin if not exists
        try {
            const adminCollection = db.collection('admins');
            const adminCount = await adminCollection.countDocuments();
            if (adminCount === 0) {
                const hashedPassword = await bcrypt.hash('admin123', 10);
                await adminCollection.insertOne({ email: 'admin', password: hashedPassword });
                console.log("Default admin created (admin / admin123)");
            }
        } catch (e) {
            console.error("Error creating default admin:", e);
        }

        // เริ่มต้น Background Ping Service
        startBackgroundPingService();
    })
    .catch(error => {
        console.error("Failed to connect to MongoDB", error);
        // อย่าใช้ process.exit(1) ตรงนี้ เพราะจะทำให้เซิร์ฟเวอร์ตายไปเลย ปล่อยให้มันรันต่อไปเผื่อ DB จะกลับมาเชื่อมต่อได้ในภายหลัง
    });

// --- Middleware สำหรับยืนยันตัวตน ---
const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const token = bearer[1];
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
    if (key && key === API_SECRET_KEY) {
        next();
    } else {
        res.status(401).json({ status: "error", message: "Unauthorized: Invalid API Key" });
    }
};

// --- Authentication Routes ---
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const admin = await db.collection('admins').findOne({ email });
        if (admin && await bcrypt.compare(password, admin.password)) {
            const token = jwt.sign({ id: admin._id, email: admin.email }, jwtSecret, { expiresIn: '24h' });
            res.json({ token, user: { email: admin.email } });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/admins', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { email, password } = req.body;
        const existing = await db.collection('admins').findOne({ email });
        if (existing) return res.status(400).json({ message: "Admin already exists" });
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.collection('admins').insertOne({ email, password: hashedPassword });
        res.status(201).json({ message: "Admin created" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/admins/list', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const users = await db.collection('admins').find({}, { projection: { password: 0 } }).toArray();
        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/admins/delete', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { uid } = req.body;
        await db.collection('admins').deleteOne({ _id: new ObjectId(uid) });
        res.json({ message: "Admin deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- PowerShell Script Integration (Sync & Heartbeat) ---
app.post('/api/inventory/sync', verifyApiKey, async (req, res) => {
    if (!db) return res.status(500).json({ status: "error", message: "Database not connected" });
    try {
        const data = req.body;
        if (!data || !data.computerName || !data.serialNumber) {
            return res.status(400).json({ status: "error", message: "Invalid payload: missing computerName or serialNumber" });
        }

        const now = new Date();
        const collection = db.collection('Computers');
        
        await collection.updateOne(
            { SerialNumber: data.serialNumber },
            {
                $set: {
                    ComputerName: data.computerName,
                    Manufacturer: data.manufacturer,
                    Model: data.model,
                    Type: data.type,
                    Location: data.location,
                    UserName: data.userName,
                    CPU: data.cpu,
                    RAM_GB: data.ramGB,
                    DiskSize_GB: data.diskSizeGB,
                    OS: data.os,
                    IPAddress: data.ipAddress,
                    Status: "Active",
                    Timestamp: now,
                    lastSeenOnline: now
                }
            },
            { upsert: true }
        );

        if (data.monitors && Array.isArray(data.monitors)) {
            const monitorCol = db.collection('Monitors');
            for (const mon of data.monitors) {
                if (mon.serial && mon.serial !== 'N/A') {
                    await monitorCol.updateOne(
                        { MonitorSerial: mon.serial },
                        { $set: { Manufacturer: mon.manufacturer, Model: mon.model, AssignedComputer: data.computerName, Status: "Active", Timestamp: now } },
                        { upsert: true }
                    );
                }
            }
        }

        if (data.accessories && Array.isArray(data.accessories)) {
            const accCol = db.collection('Accessory');
            for (const acc of data.accessories) {
                if (acc.SerialNumber && acc.SerialNumber !== 'N/A') {
                    await accCol.updateOne(
                        { SerialNumber: acc.SerialNumber },
                        { $set: { AccessoryType: acc.AccessoryType, Manufacturer: acc.Manufacturer, Model: acc.Model, AssignedComputer: data.computerName, Status: "Active", Timestamp: now } },
                        { upsert: true }
                    );
                }
            }
        }

        res.status(200).json({ status: "success", message: "Data synced successfully" });
    } catch (error) {
        console.error(`[SYNC] Error processing data:`, error);
        res.status(500).json({ status: "error", message: error.message });
    }
});

app.post('/api/heartbeat', async (req, res) => {
    if (!db) return res.status(500).json({ status: "error", message: "Database not connected" });
    try {
        const { hostname, collectionName } = req.body;
        if (!hostname) return res.status(400).json({ status: "error", message: "Missing hostname" });
        
        const col = collectionName || 'Computers';
        await db.collection(col).updateOne(
            { ComputerName: hostname },
            { $set: { lastSeenOnline: new Date() } }
        );
        res.status(200).json({ status: "success", message: "Heartbeat updated" });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

// --- LOCAL PING RELAY ROUTES ---
app.get('/api/relay/devices', verifyApiKey, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const customMenus = await db.collection('CustomMenus').find().toArray();
        const customCollectionNames = customMenus.map(m => m.name);
        const collectionsToCheck = ['Network', 'Printers', ...customCollectionNames];

        let allIpDevices = [];

        for (const collectionName of collectionsToCheck) {
            const devices = await db.collection(collectionName).find({
                IPAddress: { $exists: true, $ne: "", $ne: "N/A" }
            }).toArray();

            devices.forEach(d => {
                allIpDevices.push({
                    _id: d._id,
                    collection: collectionName,
                    IPAddress: d.IPAddress,
                    Name: d.DeviceName || d.Name || d.ComputerName || d.ItemName || 'Unknown Device'
                });
            });
        }
        res.status(200).json(allIpDevices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/relay/heartbeat', verifyApiKey, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { devices } = req.body;
        if (!devices || !Array.isArray(devices)) return res.status(400).json({ message: "Invalid payload" });

        let updatedCount = 0;
        const now = new Date();

        for (const dev of devices) {
            await db.collection(dev.collection).updateOne(
                { _id: new ObjectId(dev.id) },
                { $set: { lastSeenOnline: now } }
            );
            updatedCount++;
        }
        res.status(200).json({ message: `Updated ${updatedCount} devices as online.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

async function startBackgroundPingService() {
    console.log("[Ping Service] Starting background ping service for IP devices...");
    setInterval(async () => {
        if (!db) return;
        try {
            const customMenus = await db.collection('CustomMenus').find().toArray();
            const customCollectionNames = customMenus.map(m => m.name);
            const collectionsToCheck = ['Network', 'Printers', ...customCollectionNames];

            for (const collectionName of collectionsToCheck) {
                const devices = await db.collection(collectionName).find({
                    IPAddress: { $exists: true, $ne: "", $ne: "N/A" }
                }).toArray();

                for (const device of devices) {
                    try {
                        const targetIp = device.IPAddress;
                        const res = await ping.promise.probe(targetIp, { timeout: 2 });
                        
                        if (res.alive) {
                            await db.collection(collectionName).updateOne(
                                { _id: device._id },
                                { $set: { lastSeenOnline: new Date() } }
                            );
                        }
                    } catch (pingError) { }
                }
            }
        } catch (error) {}
    }, 600000); 
}

// --- Inventory General CRUD ---
app.get('/api/inventory/all', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const collections = await db.listCollections().toArray();
        const allData = {};
        for (let col of collections) {
            if (col.name !== 'admins') {
                allData[col.name] = await db.collection(col.name).find().toArray();
            }
        }
        res.json(allData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/inventory/:collection', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const collectionName = req.params.collection;
        const data = req.body;
        data.Timestamp = new Date();
        const result = await db.collection(collectionName).insertOne(data);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/inventory/:collection/:id', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { collection, id } = req.params;
        const data = req.body;
        delete data._id; 
        
        await db.collection(collection).updateOne(
            { _id: new ObjectId(id) },
            { $set: data }
        );
        res.json({ message: "Updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/inventory/:collection/:id', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { collection, id } = req.params;
        await db.collection(collection).deleteOne({ _id: new ObjectId(id) });
        res.json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Bulk Operations
app.post('/api/inventory/:collection/bulk', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const collectionName = req.params.collection;
        const dataArray = req.body;
        if (!Array.isArray(dataArray) || dataArray.length === 0) return res.status(400).json({ message: "Invalid payload" });
        
        dataArray.forEach(d => { d.Timestamp = new Date(); if(!d.Status) d.Status = 'Storage'; });
        await db.collection(collectionName).insertMany(dataArray);
        res.status(201).json({ message: `Imported ${dataArray.length} items` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/inventory/:collection/bulk-delete', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const collectionName = req.params.collection;
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ message: "Invalid payload" });

        const objectIds = ids.map(id => new ObjectId(id));
        await db.collection(collectionName).deleteMany({ _id: { $in: objectIds } });
        res.status(200).json({ message: `Deleted ${ids.length} items` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/inventory/:collection/bulk-update', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const collectionName = req.params.collection;
        const { ids, updateData } = req.body;
        if (!Array.isArray(ids) || ids.length === 0 || !updateData) return res.status(400).json({ message: "Invalid payload" });

        const objectIds = ids.map(id => new ObjectId(id));
        await db.collection(collectionName).updateMany(
            { _id: { $in: objectIds } },
            { $set: updateData }
        );
        res.status(200).json({ message: `Updated ${ids.length} items` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- Device Finder (Public/Scanner) ---
app.get('/api/inventory/find/:sn', async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const sn = req.params.sn;
        const collections = await db.listCollections().toArray();
        
        for (let col of collections) {
            const skipKeys = ['admins', 'CustomMenus', 'Staff', 'TransactionHistory', 'LoanHistory', 'Maintenance Log'];
            if (skipKeys.includes(col.name)) continue;

            const item = await db.collection(col.name).findOne({
                $or: [ { SerialNumber: sn }, { MonitorSerial: sn }, { _id: sn.length === 24 ? new ObjectId(sn) : null } ]
            });

            if (item) {
                return res.json({ item, collectionName: col.name });
            }
        }
        res.status(404).json({ message: "Device not found" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- Admin Handover & Return ---
app.post('/api/transactions/handover', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { staffUserName, devices } = req.body;
        if (!staffUserName || !devices || !Array.isArray(devices)) return res.status(400).json({ message: "Invalid payload" });

        for (const device of devices) {
            const colName = device.collection;
            const deviceId = device._id || device.id;
            if (!colName || !deviceId) continue;

            await db.collection(colName).updateOne(
                { _id: new ObjectId(deviceId) },
                { $set: { Status: 'Active', UserName: staffUserName } }
            );
        }

        await db.collection('TransactionHistory').insertOne({
            type: 'Handover',
            staffUserName: staffUserName,
            devices: devices.map(d => ({ id: d._id || d.id, collection: d.collection, serial: d.SerialNumber || d.MonitorSerial || 'N/A' })),
            timestamp: new Date()
        });

        res.status(200).json({ message: "Handover successful" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
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

            await db.collection(colName).updateOne(
                { _id: new ObjectId(deviceId) },
                { $set: { Status: 'Storage', UserName: '' } }
            );
        }

        await db.collection('TransactionHistory').insertOne({
            type: 'Return',
            staffUserName: 'System (Returned)',
            devices: devices.map(d => ({ id: d.id, collection: d.collection })),
            timestamp: new Date()
        });

        res.status(200).json({ message: "Return successful" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- Public Loan System ---
app.get('/api/public/loanable-items', async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const collections = await db.listCollections().toArray();
        const allData = {};
        for (let col of collections) {
            const skipKeys = ['admins', 'CustomMenus', 'Staff', 'TransactionHistory', 'LoanHistory', 'Maintenance Log'];
            if (!skipKeys.includes(col.name)) {
                allData[col.name] = await db.collection(col.name).find({ Status: 'Storage' }).toArray();
            }
        }
        res.json(allData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/loans/submit', async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { borrowerName, dueDate, notes, items } = req.body;
        if (!borrowerName || !dueDate || !items || !items.length) return res.status(400).json({ message: "Missing required fields" });

        const loanGroupId = "GRP-" + Date.now().toString().slice(-6);

        for (const item of items) {
            await db.collection(item.deviceType).updateOne(
                { _id: new ObjectId(item.deviceId) },
                { $set: { Status: 'On Loan', UserName: borrowerName } }
            );

            await db.collection('LoanHistory').insertOne({
                LoanGroupID: loanGroupId,
                DeviceId: item.deviceId,
                DeviceSerial: item.deviceSerial,
                DeviceType: item.deviceType,
                BorrowerName: borrowerName,
                LoanDate: new Date(),
                DueDate: dueDate,
                Notes: notes,
                Status: 'On Loan'
            });
        }
        res.status(200).json({ message: "Loan submitted successfully", loanGroupId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/loans/group/:id', async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const loanGroupId = req.params.id;
        const loanItems = await db.collection('LoanHistory').find({ LoanGroupID: loanGroupId }).toArray();
        if (loanItems.length === 0) return res.status(404).json({ message: "Loan group not found" });

        const devicesInfo = [];
        for (const item of loanItems) {
            const device = await db.collection(item.DeviceType).findOne({ _id: new ObjectId(item.DeviceId) });
            if (device) devicesInfo.push(device);
        }
        res.status(200).json({ loanItems, devices: devicesInfo });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/loans/return', async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { transactionIds } = req.body;
        if (!transactionIds || !transactionIds.length) return res.status(400).json({ message: "Missing transactionIds" });

        for (const id of transactionIds) {
            const loanRecord = await db.collection('LoanHistory').findOne({ _id: new ObjectId(id) });
            if (loanRecord && loanRecord.Status === 'On Loan') {
                await db.collection(loanRecord.DeviceType).updateOne(
                    { _id: new ObjectId(loanRecord.DeviceId) },
                    { $set: { Status: 'Storage', UserName: '' } }
                );
                await db.collection('LoanHistory').updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { Status: 'Returned', ReturnDate: new Date() } }
                );
            }
        }
        res.status(200).json({ message: "Return processed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- Custom Menus Settings ---
app.post('/api/custom-menus', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const menuData = req.body;
        const existing = await db.collection('CustomMenus').findOne({ name: menuData.name });
        if (existing) return res.status(400).json({ message: "Menu ID already exists." });
        
        await db.collection('CustomMenus').insertOne(menuData);
        await db.createCollection(menuData.name).catch(()=>console.log("Collection already exists or auto-created."));
        res.status(201).json({ message: "Menu created" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/custom-menus/:id', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { id } = req.params;
        const updateData = req.body;
        await db.collection('CustomMenus').updateOne(
            { name: id },
            { $set: { displayName: updateData.displayName, icon: updateData.icon, parentId: updateData.parentId, order: updateData.order, fields: updateData.fields } }
        );
        res.json({ message: "Menu updated" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/custom-menus/:id', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { id } = req.params;
        await db.collection('CustomMenus').deleteOne({ name: id });
        res.json({ message: "Menu removed from sidebar" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- Staff & Maintenance ---
app.post('/api/staff', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        await db.collection('Staff').insertOne(req.body);
        res.status(201).json({ message: "Staff added" });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.put('/api/staff/:id', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const data = req.body; delete data._id;
        await db.collection('Staff').updateOne({ _id: new ObjectId(req.params.id) }, { $set: data });
        res.json({ message: "Staff updated" });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.delete('/api/staff/:id', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        await db.collection('Staff').deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ message: "Staff deleted" });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.post('/api/inventory/maintenance', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const data = req.body;
        data.Timestamp = new Date();
        await db.collection('Maintenance Log').insertOne(data);
        res.status(201).json({ message: "Maintenance log added" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Fallback Ping Route
app.get('/api/ping/:target', verifyToken, async (req, res) => {
    const target = req.params.target;
    try {
        const result = await ping.promise.probe(target, { timeout: 2 });
        res.json({ alive: result.alive, time: result.time });
    } catch (error) {
        res.status(500).json({ error: "Ping failed" });
    }
});

// 🌟 ตั้งค่าให้รองรับ SPA (Single Page Application) Routing 
// หากเข้า URL อื่นๆ ที่ไม่ใช่ /api ให้ทำการส่งไฟล์ index.html กลับไป
app.get('*', (req, res) => {
    // แก้ไข path ให้ชี้ไปยังไฟล์ index.html ที่ถูกต้อง
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start Server
app.listen(port, () => {
    console.log(`Inventory Backend API listening on port ${port}`);
});
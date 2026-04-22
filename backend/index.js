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
const mongoUri = process.env.MONGO_URI || "mongodb+srv://kaaom3:Kaaom321A@cluster0.fx7nlup.mongodb.net/inventoryDB_Cloned?appName=Cluster0"; 
const dbName = "inventoryDB_Cloned"; 
const jwtSecret = process.env.JWT_SECRET || "your_super_secret_key_change_this"; 
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

        startBackgroundPingService();
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
        
        const isInvalidSN = (sn) => {
            if (!sn) return true;
            const cleanSn = sn.trim().toUpperCase();
            return cleanSn === '' || cleanSn === 'N/A' || cleanSn === 'NONE';
        };

        const scriptHasInvalidSN = isInvalidSN(data.serialNumber);
        const targetCollection = (data.type && data.type !== 'Unknown') ? data.type : 'Computers';

        let existingDevice = null;
        if (!scriptHasInvalidSN) existingDevice = await db.collection(targetCollection).findOne({ SerialNumber: data.serialNumber });
        if (!existingDevice && data.computerName) existingDevice = await db.collection(targetCollection).findOne({ ComputerName: data.computerName });

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

        if (existingDevice) {
            if (existingDevice.Status === 'Storage') updatePayload.$set.Status = 'Active';
        } else {
            updatePayload.$set.Status = 'Active'; 
        }

        if (!scriptHasInvalidSN) {
            updatePayload.$set.SerialNumber = data.serialNumber;
        } else if (!existingDevice) {
            updatePayload.$set.SerialNumber = data.serialNumber || 'None';
        }

        if (existingDevice && existingDevice.Location && existingDevice.Location.trim() !== '') { } else { updatePayload.$set.Location = data.location || ''; }
        if (existingDevice && existingDevice.UserName && existingDevice.UserName.trim() !== '') { } else { updatePayload.$set.UserName = data.userName || ''; }

        if (existingDevice) {
            await db.collection(targetCollection).updateOne({ _id: existingDevice._id }, updatePayload);
        } else {
            await db.collection(targetCollection).insertOne(updatePayload.$set);
        }

        try {
            const syncedDevice = await db.collection(targetCollection).findOne({ ComputerName: data.computerName });
            if (syncedDevice) {
                let oldUser = existingDevice && existingDevice.UserName ? existingDevice.UserName : '';
                let newUser = data.userName || '';
                
                if (newUser !== '' && newUser !== oldUser) {
                    await db.collection('TransactionHistory').insertOne({
                        type: 'Auto-Sync',
                        staffUserName: newUser,
                        timestamp: now,
                        devices: [{
                            id: syncedDevice._id,
                            collection: targetCollection,
                            serial: syncedDevice.SerialNumber || 'N/A'
                        }]
                    });
                }
            }
        } catch (historyErr) { console.error("Error saving auto-sync history:", historyErr); }

        // 🌟 Sync Monitors (อัปเดตให้เชื่อมโยง UserName ให้ด้วย และข้ามการบันทึกหากเป็น POS)
        if (targetCollection !== 'POS' && data.monitors && Array.isArray(data.monitors)) {
            for (const mon of data.monitors) {
                if (!isInvalidSN(mon.serial)) {
                    await db.collection('Monitors').updateOne(
                        { MonitorSerial: mon.serial },
                        { $set: { 
                            Manufacturer: mon.manufacturer, 
                            Model: mon.model, 
                            AssignedComputer: data.computerName, 
                            ComputerName: data.computerName, 
                            UserName: existingDevice?.UserName || data.userName || '',
                            Status: "Active", 
                            Timestamp: now 
                        } },
                        { upsert: true }
                    );
                }
            }
        }

        // 🌟 Sync Keyboards (แยกออกมาจาก Accessories เดิม)
        if (data.keyboards && Array.isArray(data.keyboards)) {
            for (const kb of data.keyboards) {
                if (!isInvalidSN(kb.SerialNumber)) {
                    await db.collection('Keyboards').updateOne(
                        { SerialNumber: kb.SerialNumber },
                        { $set: { 
                            AccessoryType: kb.AccessoryType, 
                            Manufacturer: kb.Manufacturer, 
                            Model: kb.Model, 
                            AssignedComputer: data.computerName, 
                            ComputerName: data.computerName, 
                            UserName: existingDevice?.UserName || data.userName || '', 
                            Status: "Active", 
                            Timestamp: now 
                        } },
                        { upsert: true }
                    );
                }
            }
        }

        // 🌟 Sync Mice (แยกออกมาจาก Accessories เดิม)
        if (data.mice && Array.isArray(data.mice)) {
            for (const mouse of data.mice) {
                if (!isInvalidSN(mouse.SerialNumber)) {
                    await db.collection('Mice').updateOne(
                        { SerialNumber: mouse.SerialNumber },
                        { $set: { 
                            AccessoryType: mouse.AccessoryType, 
                            Manufacturer: mouse.Manufacturer, 
                            Model: mouse.Model, 
                            AssignedComputer: data.computerName, 
                            ComputerName: data.computerName, 
                            UserName: existingDevice?.UserName || data.userName || '', 
                            Status: "Active", 
                            Timestamp: now 
                        } },
                        { upsert: true }
                    );
                }
            }
        }

        // 🌟 Sync Printers (เพิ่มการบันทึกเครื่องพิมพ์ที่ต่อพ่วงกับคอมพิวเตอร์)
        if (data.printers && Array.isArray(data.printers)) {
            for (const prn of data.printers) {
                if (!isInvalidSN(prn.SerialNumber)) {
                    await db.collection('Printers').updateOne(
                        { SerialNumber: prn.SerialNumber },
                        { $set: { 
                            Name: prn.Name,
                            Manufacturer: prn.Manufacturer, 
                            Model: prn.Model, 
                            DriverName: prn.DriverName,
                            PortName: prn.PortName,
                            AssignedComputer: data.computerName, 
                            ComputerName: data.computerName, 
                            UserName: existingDevice?.UserName || data.userName || '',
                            Status: "Active", 
                            Timestamp: now 
                        } },
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

async function startBackgroundPingService() {
    setInterval(async () => {
        if (!db) return;
        try {
            const customMenus = await db.collection('CustomMenus').find().toArray();
            const collectionsToCheck = ['Network', 'Printers', ...customMenus.map(m => m.name)];
            for (const collectionName of collectionsToCheck) {
                const devices = await db.collection(collectionName).find({ IPAddress: { $exists: true, $ne: "", $ne: "N/A" } }).toArray();
                for (const device of devices) {
                    try {
                        const res = await ping.promise.probe(device.IPAddress, { timeout: 2 });
                        if (res.alive) await db.collection(collectionName).updateOne({ _id: device._id }, { $set: { lastSeenOnline: new Date() } });
                    } catch (pingError) { }
                }
            }
        } catch (error) {}
    }, 600000); 
}

// ===================================================================
// 🌟 Bulk Operations & Utility (แก้ไขหลายรายการ, นำเข้า, โคลน, ย้าย)
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
            const clone = { ...sourceDevice, ...overrides, Timestamp: new Date() };
            if (req.params.collection === 'Monitors') clone.MonitorSerial = sn;
            else clone.SerialNumber = sn;
            return clone;
        });

        await db.collection(req.params.collection).insertMany(newDevices);
        res.status(201).json({ message: `Cloned ${newDevices.length} items successfully.` });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// ===================================================================
// 🌟 Search Serial Number Across All Collections
// ===================================================================
app.get('/api/inventory/search/serial/:sn', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const sn = req.params.sn;
        if (!sn) return res.status(400).json({ message: "Serial number is required" });

        const customMenus = await db.collection('CustomMenus').find().toArray();
        const collectionsToCheck = ['Computers', 'Monitors', 'Printers', 'Network', ...customMenus.map(m => m.name)];
        
        for (const colName of collectionsToCheck) {
            const item = await db.collection(colName).findOne({
                $or: [
                    { SerialNumber: sn },
                    { MonitorSerial: sn },
                    { serialNumber: sn },
                    { monitorSerial: sn },
                    // Case-insensitive search if needed, but let's stick to exact match first for performance
                    { SerialNumber: sn.toUpperCase() },
                    { MonitorSerial: sn.toUpperCase() }
                ]
            });
            if (item) {
                return res.json({ collection: colName, item });
            }
        }
        res.status(404).json({ message: "Serial number not found" });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.post('/api/inventory/:collection/move', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const sourceCollection = req.params.collection;
        const { targetCollection, id } = req.body;

        if (!targetCollection || !id) return res.status(400).json({ message: "Missing required fields" });
        if (sourceCollection === targetCollection) return res.status(400).json({ message: "Cannot move to the same collection" });

        const query = buildIdQuery(id);
        const item = await db.collection(sourceCollection).findOne(query);
        if (!item) return res.status(404).json({ message: "Item not found" });

        await db.collection(targetCollection).insertOne(item);
        await db.collection(sourceCollection).deleteOne(query);

        await db.collection('Maintenance Log').updateMany(
            { deviceId: id, deviceCollection: sourceCollection },
            { $set: { deviceCollection: targetCollection } }
        );
        
        await db.collection('LoanHistory').updateMany(
            { DeviceId: id, DeviceType: sourceCollection },
            { $set: { DeviceType: targetCollection } }
        );

        await db.collection('TransactionHistory').updateMany(
            { "devices.id": id, "devices.collection": sourceCollection },
            { $set: { "devices.$[elem].collection": targetCollection } },
            { arrayFilters: [ { "elem.id": id, "elem.collection": sourceCollection } ] }
        );

        res.status(200).json({ message: `Successfully moved to ${targetCollection}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
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

app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(port, () => {
    console.log(`Inventory Backend API listening on port ${port}`);
});
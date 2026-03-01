const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ping = require('ping');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // ขยาย limit เผื่อไฟล์ CSV มีขนาดใหญ่
app.use(express.static(__dirname));
// --- Configuration ---
// ใช้ 127.0.0.1 เพื่อความเสถียร
const mongoUri = "mongodb://127.0.0.1:27017";
const dbName = "inventoryDB_Cloned"; 
const jwtSecret = "your_super_secret_key_change_this"; 
const API_SECRET_KEY = "KAAOM321A"; 

let db;

// --- Connect to MongoDB ---
MongoClient.connect(mongoUri)
  .then(client => {
    console.log("Successfully connected to MongoDB!");
    db = client.db(dbName);
  })
  .catch(error => {
    console.error("Failed to connect to MongoDB", error);
    console.log("Server started but DB connection failed. Check MongoDB service.");
  });

// --- Middleware ---
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const verifyApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== API_SECRET_KEY) {
        return res.status(401).json({ message: 'Unauthorized: Invalid API Key' });
    }
    next();
};

// ===================================================================
// **API Route for Automated Data Synchronization (PowerShell)**
// ===================================================================
app.post('/api/inventory/sync', verifyApiKey, async (req, res) => {
    if (!db) return res.status(500).json({ status: "error", message: "Database not connected" });
    try {
        const data = req.body;
        console.log(`[SYNC] Processing data for: ${data.computerName}`);
        
        // 1. Update/Insert User (Staff)
        if (data.userName && data.userName.trim() !== "") {
            await db.collection('Staff').updateOne(
                { UserName: data.userName },
                { $setOnInsert: { UserName: data.userName, FirstName: "", LastName: "", Department: "" } },
                { upsert: true }
            );
        }

        // 2. Update/Insert Computer
        const computerQuery = data.serialNumber ? { SerialNumber: data.serialNumber } : { ComputerName: data.computerName };
        const computerData = {
            $set: {
                ComputerName: data.computerName,
                Manufacturer: data.manufacturer,
                Model: data.model,
                Type: data.type || "Unknown",
                Status: "Active",
                UserName: data.userName,
                CPU: data.cpu,
                RAM_GB: data.ramGB,
                DiskSize_GB: data.diskSizeGB,
                OS: data.os,
                IPAddress: data.ipAddress,
                Timestamp: new Date(),
                ...(data.warrantyStartDate ? { WarrantyStartDate: data.warrantyStartDate } : {}),
                ...(data.warrantyEndDate ? { WarrantyEndDate: data.warrantyEndDate } : {}),
                SerialNumber: data.serialNumber,
                Location: data.location
            }
        };
        await db.collection('Computers').updateOne(computerQuery, computerData, { upsert: true });

        // 3. Process Monitors
        if (data.monitors && Array.isArray(data.monitors)) {
            for (const monitor of data.monitors) {
                if (!monitor.serial) continue;
                await db.collection('Monitors').updateOne(
                    { MonitorSerial: monitor.serial },
                    { $set: {
                        ComputerName: data.computerName,
                        UserName: data.userName,
                        Manufacturer: monitor.manufacturer,
                        Model: monitor.model,
                        MonitorSerial: monitor.serial,
                        Status: "Active",
                        Timestamp: new Date()
                    }},
                    { upsert: true }
                );
            }
        }

        // 4. Process Accessories
        if (data.accessories && Array.isArray(data.accessories)) {
            for (const acc of data.accessories) {
                 if (!acc.SerialNumber) continue;
                 await db.collection('Accessory').updateOne(
                    { SerialNumber: acc.SerialNumber },
                    { $set: {
                        AccessoryType: acc.AccessoryType,
                        Model: acc.Model,
                        SerialNumber: acc.SerialNumber,
                        Manufacturer: acc.Manufacturer,
                        Status: "Active",
                        AssignedComputer: data.computerName,
                        UserName: data.userName,
                        Timestamp: new Date()
                    }},
                    { upsert: true }
                );
            }
        }

        // 5. Process Printers
        if (data.printers && Array.isArray(data.printers)) {
            for (const printer of data.printers) {
                if (!printer.SerialNumber || printer.SerialNumber === "N/A") continue;
                await db.collection('Printers').updateOne(
                    { SerialNumber: printer.SerialNumber },
                    { $set: {
                        Name: printer.Name,
                        Manufacturer: printer.Manufacturer,
                        Model: printer.Model,
                        DriverName: printer.DriverName,
                        PortName: printer.PortName,
                        SerialNumber: printer.SerialNumber,
                        Status: "Active",
                        AssignedComputer: data.computerName,
                        UserName: data.userName,
                        Timestamp: new Date()
                    }},
                    { upsert: true }
                );
            }
        }

        // 6. Process Software
        if (data.software && Array.isArray(data.software)) {
            await db.collection('Software').deleteMany({ ComputerName: data.computerName });
            
            const softwareDocs = data.software.map(sw => ({
                ComputerName: data.computerName,
                SoftwareName: sw.name,
                Version: sw.version,
                UserName: data.userName,
                Timestamp: new Date()
            }));
            
            if(softwareDocs.length > 0) {
                await db.collection('Software').insertMany(softwareDocs);
            }
        }

        res.status(200).json({ status: "success", message: `Successfully synced data for ${data.computerName}` });
    } catch (error) {
        console.error(`[SYNC] Error processing data:`, error);
        res.status(500).json({ status: "error", message: error.message });
    }
});

// ===================================================================
// API Routes (Authenticated) - Core Functionality
// ===================================================================

// --- Custom Menu Management ---

app.post('/api/custom-menus', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { name, displayName, icon, parentId, fields, order } = req.body;
        
        if (!name || !displayName || !fields || fields.length === 0) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const existing = await db.collection('CustomMenus').findOne({ name });
        if (existing) return res.status(400).json({ message: 'Menu ID/Name already exists.' });

        const newMenu = {
            name, 
            displayName,
            icon,
            parentId: parentId || null,
            order: parseInt(order) || 0,
            fields,
            isSystem: false,
            createdAt: new Date()
        };

        await db.collection('CustomMenus').insertOne(newMenu);
        res.status(201).json({ message: 'Menu created successfully', menu: newMenu });
    } catch (error) {
        res.status(500).json({ message: 'Error creating menu', error: error.message });
    }
});

app.put('/api/custom-menus/:name', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { name } = req.params;
        const { displayName, icon, parentId, order, fields } = req.body;

        if (!displayName) return res.status(400).json({ message: 'Display Name is required' });
        if (parentId === name) return res.status(400).json({ message: 'Cannot set parent to self' });

        const updateData = {
            displayName,
            icon,
            parentId: parentId || null,
            order: parseInt(order) || 0
        };

        if (fields && Array.isArray(fields) && fields.length > 0) {
            updateData.fields = fields;
        }

        await db.collection('CustomMenus').updateOne(
            { name }, 
            { $set: updateData }
        );
        res.status(200).json({ message: 'Menu updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating menu', error: error.message });
    }
});

app.delete('/api/custom-menus/:name', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { name } = req.params;
        
        const children = await db.collection('CustomMenus').find({ parentId: name }).toArray();
        if (children.length > 0) return res.status(400).json({ message: 'Cannot delete menu that contains sub-menus.' });

        const menu = await db.collection('CustomMenus').findOne({ name });
        if (menu && menu.isSystem) return res.status(403).json({ message: 'Cannot delete system menus.' });

        await db.collection('CustomMenus').deleteOne({ name });
        res.status(200).json({ message: 'Menu deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting menu', error: error.message });
    }
});

// --- Main Data Fetching ---

app.get('/api/inventory/all', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        let customMenus = [];
        try { customMenus = await db.collection('CustomMenus').find().toArray(); } catch (e) {}

        const baseCollections = ['Computers', 'Monitors', 'Audio', 'Accessory', 'Printers', 'Network', 'Mobile', 'Storage', 'Projector', 'SpareParts', 'Software', 'LoanHistory', 'Maintenance Log', 'Staff', 'TransactionHistory'];
        const customCollectionNames = customMenus.map(m => m.name);
        const allCollectionsToFetch = [...new Set([...baseCollections, ...customCollectionNames])];

        const promises = allCollectionsToFetch.map(c => db.collection(c).find().toArray());
        const results = await Promise.all(promises);
        
        const allData = allCollectionsToFetch.reduce((acc, c, index) => {
            acc[c] = results[index];
            return acc;
        }, {});

        allData.CustomMenus = customMenus;
        res.status(200).json(allData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all data', error: error.message });
    }
});

// --- Ping Status ---

app.get('/api/ping/:hostname', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { hostname } = req.params;
        const collectionName = req.query.collection || 'Computers';

        if (!hostname) return res.status(400).json({ message: "Hostname/IP is required." });

        const result = await ping.promise.probe(hostname, { timeout: 2 });

        if (result.alive) {
            let query = {};
            if (collectionName === 'Computers') {
                query = { ComputerName: hostname };
            } else {
                query = { IPAddress: hostname };
            }

            await db.collection(collectionName).updateOne(
                query, 
                { $set: { lastSeenOnline: new Date() } }
            );
        }
        res.status(200).json({ alive: result.alive });
    } catch (error) {
        res.status(500).json({ message: 'Error during ping process', error: error.message, alive: false });
    }
});

// --- Transactions (Handover/Return) ---

app.post('/api/transactions/handover', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { staffUserName, devices } = req.body;
        const adminEmail = req.user.email;
        for (const device of devices) {
            await db.collection(device.collection).updateOne({ _id: new ObjectId(device.id) }, { $set: { Status: 'Active', UserName: staffUserName } });
        }
        await db.collection('TransactionHistory').insertOne({ type: 'Handover', adminEmail, staffUserName, devices, timestamp: new Date() });
        res.status(200).json({ message: 'Handover successful' });
    } catch (error) { res.status(500).json({ message: 'Error', error: error.message }); }
});

app.post('/api/transactions/return', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { devices } = req.body;
        const adminEmail = req.user.email;
        for (const device of devices) {
            await db.collection(device.collection).updateOne({ _id: new ObjectId(device.id) }, { $set: { Status: 'Storage', UserName: '' } });
        }
        await db.collection('TransactionHistory').insertOne({ type: 'Return', adminEmail, staffUserName: devices.length > 0 ? devices[0].userName : 'N/A', devices, timestamp: new Date() });
        res.status(200).json({ message: 'Return successful' });
    } catch (error) { res.status(500).json({ message: 'Error', error: error.message }); }
});

// --- Staff Management ---

app.post('/api/staff', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { UserName, FirstName, LastName, Department } = req.body;
        const existingStaff = await db.collection('Staff').findOne({ UserName });
        if(existingStaff) return res.status(400).json({ message: 'Username already exists.' });
        await db.collection('Staff').insertOne({ UserName, FirstName, LastName, Department });
        res.status(201).json({ message: 'Staff member created.'});
    } catch (error) { res.status(500).json({ message: 'Error', error: error.message }); }
});

app.put('/api/staff/:id', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try { await db.collection('Staff').updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body }); res.status(200).json({ message: 'Updated' }); } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/staff/:id', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try { await db.collection('Staff').deleteOne({ _id: new ObjectId(req.params.id) }); res.status(200).json({ message: 'Deleted' }); } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- Generic CRUD ---

app.post('/api/inventory/:collection', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try { const result = await db.collection(req.params.collection).insertOne(req.body); res.status(201).json(result); } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/inventory/:collection/bulk', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try { 
        const items = req.body.filter(i => Object.keys(i).length > 0);
        if(items.length===0) return res.status(400).json({message:"No valid data"});
        const result = await db.collection(req.params.collection).insertMany(items); 
        res.status(201).json(result); 
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// =========================================================================
// *** BULK UPDATE & BULK DELETE MUST BE DEFINED BEFORE /:collection/:id ***
// =========================================================================

app.post('/api/inventory/:collection/bulk-delete', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) return res.status(400).json({ message: 'Invalid data format' });
        
        const objectIds = ids.map(id => new ObjectId(id));
        const result = await db.collection(req.params.collection).deleteMany({ _id: { $in: objectIds } });
        
        res.json({ message: `Deleted ${result.deletedCount} items` });
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    }
});

app.put('/api/inventory/:collection/bulk-update', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { ids, updateData } = req.body;
        if (!ids || !Array.isArray(ids) || !updateData) return res.status(400).json({ message: 'Invalid data format' });
        
        const objectIds = ids.map(id => new ObjectId(id));
        const result = await db.collection(req.params.collection).updateMany(
            { _id: { $in: objectIds } }, 
            { $set: updateData }
        );
        
        res.json({ message: `Updated ${result.modifiedCount} items` });
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    }
});

// --- Regular Updates and Deletes (Single item) ---

app.put('/api/inventory/:collection/:id', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try { const { _id, ...d } = req.body; const result = await db.collection(req.params.collection).updateOne({ _id: new ObjectId(req.params.id) }, { $set: d }); res.json(result); } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/inventory/:collection/:id', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try { const result = await db.collection(req.params.collection).deleteOne({ _id: new ObjectId(req.params.id) }); res.json(result); } catch (e) { res.status(500).json({ error: e.message }); }
});


app.post('/api/inventory/maintenance', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try { const logData = { ...req.body, timestamp: new Date() }; await db.collection('Maintenance Log').insertOne(logData); res.status(201).json({message:'Logged'}); } catch(e){ res.status(500).json({error:e.message}); }
});

// --- Admin Management ---

app.post('/api/admins/create', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try { const { email, password } = req.body; const hashed = await bcrypt.hash(password, 10); await db.collection('admins').insertOne({ email, password: hashed, createdAt: new Date() }); res.status(201).json({message:'Created'}); } catch(e){ res.status(500).json({error:e.message}); }
});

app.get('/api/admins/list', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try { const users = await db.collection('admins').find({}, { projection: { password: 0 } }).toArray(); res.json({ users }); } catch(e){ res.status(500).json({error:e.message}); }
});

app.delete('/api/admins/delete', verifyToken, async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try { await db.collection('admins').deleteOne({ _id: new ObjectId(req.body.uid) }); res.json({message:'Deleted'}); } catch(e){ res.status(500).json({error:e.message}); }
});

// --- Auth & Public ---

app.post('/api/login', async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { email, password } = req.body;
        const user = await db.collection('admins').findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
        const token = jwt.sign({ id: user._id, email: user.email }, jwtSecret, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, email: user.email } });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/public/loanable-items', async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        let customMenus = [];
        try { customMenus = await db.collection('CustomMenus').find().toArray(); } catch(e){}
        const baseCollections = ['Computers', 'Monitors', 'Audio', 'Accessory', 'Network', 'Mobile', 'Storage', 'Projector'];
        const collections = [...new Set([...baseCollections, ...customMenus.map(m=>m.name)])];
        
        const promises = collections.map(c => db.collection(c).find({Status: 'Storage'}).toArray());
        const results = await Promise.all(promises);
        const data = collections.reduce((acc, c, i) => { acc[c] = results[i]; return acc; }, {});
        res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/inventory/find/:serial', async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const serial = req.params.serial;
        let customMenus = [];
        try { customMenus = await db.collection('CustomMenus').find().toArray(); } catch(e){}
        const baseCollections = ['Computers', 'Monitors', 'Audio', 'Accessory', 'Printers', 'Network', 'Mobile', 'Storage', 'Projector', 'SpareParts'];
        const collectionsToSearch = [...new Set([...baseCollections, ...customMenus.map(m=>m.name)])];

        for (const col of collectionsToSearch) {
            const serialField = col === 'Monitors' ? 'MonitorSerial' : 'SerialNumber';
            const item = await db.collection(col).findOne({ [serialField]: serial });
            if (item) return res.status(200).json({ item, collectionName: col });
        }
        res.status(404).json({ message: 'Device not found' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- Loans ---

app.post('/api/loans/submit', async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { borrowerName, dueDate, notes, items } = req.body;
        const loanGroupId = `GRP-${Date.now()}`;
        for (const item of items) {
            await db.collection('LoanHistory').insertOne({
                LoanGroupID: loanGroupId, DeviceSerial: item.deviceSerial, DeviceType: item.deviceType,
                BorrowerName: borrowerName, LoanDate: new Date(), DueDate: new Date(dueDate), Status: 'On Loan', Notes: notes || ""
            });
            await db.collection(item.deviceType).updateOne({ _id: new ObjectId(item.deviceId) }, { $set: { Status: 'On Loan' } });
        }
        res.status(201).json({ message: 'Loan submitted', loanGroupId });
    } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/loans/group/:id', async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const loanItems = await db.collection('LoanHistory').find({ LoanGroupID: req.params.id }).toArray();
        if (!loanItems || loanItems.length === 0) return res.status(404).json({ message: 'Loan group not found' });
        
        const deviceSerials = loanItems.map(item => item.DeviceSerial);
        let customMenus = [];
        try { customMenus = await db.collection('CustomMenus').find().toArray(); } catch(e){}
        const baseCollections = ['Computers', 'Monitors', 'Accessory', 'Audio', 'Printers', 'Network', 'Mobile', 'Storage', 'Projector', 'SpareParts'];
        const collectionsToCheck = [...new Set([...baseCollections, ...customMenus.map(m => m.name)])];
        
        let allMatchedDevices = [];
        for (const col of collectionsToCheck) {
            const serialField = col === 'Monitors' ? 'MonitorSerial' : 'SerialNumber';
            const matched = await db.collection(col).find({ [serialField]: { $in: deviceSerials } }).toArray();
            allMatchedDevices = allMatchedDevices.concat(matched);
        }

        const devices = allMatchedDevices.map(d => ({
            DeviceSerial: d.SerialNumber || d.MonitorSerial,
            Name: d.ComputerName || d.DeviceName || d.ItemName || d.Model || d.Name || d.PartName
        }));

        res.status(200).json({ loanItems, devices });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching loan group', error: error.message });
    }
});

app.post('/api/loans/return', async (req, res) => {
    if (!db) return res.status(500).json({ message: "Database not connected" });
    try {
        const { transactionIds } = req.body;
        const returnDate = new Date();
        let updatedCount = 0;

        for (const transId of transactionIds) {
            const loanDoc = await db.collection('LoanHistory').findOneAndUpdate(
                { _id: new ObjectId(transId) },
                { $set: { Status: 'Returned', ReturnDate: returnDate } },
                { returnDocument: 'after' } 
            );

            if (loanDoc) {
                const serialField = loanDoc.DeviceType === 'Monitors' ? 'MonitorSerial' : 'SerialNumber';
                await db.collection(loanDoc.DeviceType).updateOne(
                    { [serialField]: loanDoc.DeviceSerial },
                    { $set: { Status: 'Storage' } }
                );
                updatedCount++;
            }
        }
        
        if (updatedCount === 0) return res.status(404).json({ message: 'No matching loan records found to return.' });
        res.status(200).json({ message: `Successfully returned ${updatedCount} items.` });
    } catch (error) {
        res.status(500).json({ message: 'Error returning items', error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Cloned project server running on http://127.0.0.1:${PORT}`);
});
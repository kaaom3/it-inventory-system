const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const readline = require('readline');

// --- การตั้งค่า ---
// ตรวจสอบให้แน่ใจว่า URI และชื่อ DB นี้ตรงกับในไฟล์ index.js ของคุณ
const mongoUri = "mongodb://localhost:27017";
const dbName = "inventoryDB_Cloned"; // <--- แก้ไขชื่อฐานข้อมูลให้ถูกต้อง
const collectionName = "admins"; // <--- ตรวจสอบให้แน่ใจว่าชื่อนี้ถูกต้อง (ตัวพิมพ์เล็ก)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function createAdmin() {
  let client;
  try {
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');

    if (!email || !password) {
      console.error('Email and password cannot be empty.');
      rl.close();
      return;
    }

    client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db(dbName);
    const adminsCollection = db.collection(collectionName);

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // ใช้ upsert: ถ้าเจอ email นี้อยู่แล้วให้อัปเดต password, ถ้าไม่เจอให้สร้างใหม่
    const result = await adminsCollection.updateOne(
      { email: email },
      { 
        $set: { password: hashedPassword, createdAt: new Date() },
        $setOnInsert: { email: email } // ตั้งค่า email เฉพาะตอนที่สร้างเอกสารใหม่
      },
      { upsert: true }
    );
    
    if (result.upsertedCount > 0) {
        console.log(`\nSuccessfully CREATED new admin user:`);
    } else if (result.modifiedCount > 0) {
        console.log(`\nSuccessfully UPDATED password for admin user:`);
    } else {
        console.log(`\nAdmin user "${email}" already exists with the same password. No changes made.`);
    }

    console.log(`  Email: ${email}`);
    console.log(`  Password: [PROTECTED]`);

  } catch (error) {
    console.error('\nAn error occurred:', error);
  } finally {
    if (client) {
      await client.close();
    }
    rl.close();
  }
}

createAdmin();


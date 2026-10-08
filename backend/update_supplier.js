const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://kaaom3:Kaaom321A@cluster0.fx7nlup.mongodb.net/inventoryDB_Cloned?appName=Cluster0';
MongoClient.connect(uri).then(async client => {
    const db = client.db('inventoryDB_Cloned');
    const sns = ['HR3280-SF-CC00197', 'HR3280-SF-DG00200', 'HR3280-SF-DG00300', 'HR3280-SF-DG00299'];
    const supplierInfo = 'บริษัท ฆเนศศร โซลูชั่น จำกัด (สำนักงานใหญ่) 75 ซอยสุขสวัสดิ์ 26 แยก 6-1 แขวงบางปะกอก เขตราษฎร์บูรณะ กรุงเทพมหานคร 10140 โทร: 024275973';
    
    const collections = await db.listCollections().toArray();
    let updatedCount = 0;
    
    for (let col of collections) {
        if (['admins', 'CustomMenus', 'Staff'].includes(col.name)) continue;
        const result = await db.collection(col.name).updateMany(
            { SerialNumber: { $in: sns } },
            { $set: { Supplier: supplierInfo, Vendor: 'บริษัท ฆเนศศร โซลูชั่น จำกัด' } }
        );
        if (result.modifiedCount > 0) {
            console.log(`Updated ${result.modifiedCount} items in ${col.name}`);
            updatedCount += result.modifiedCount;
        }
    }
    console.log('Total updated:', updatedCount);
    client.close();
});

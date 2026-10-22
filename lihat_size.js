require('dotenv').config();
const mongoose = require('mongoose');

async function cekUkuranDatabase() {
    try {
        // 1. Hubungkan pakai MONGO_URI (sama kayak kode Express lu)
        console.log("Menghubungkan ke database...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Terhubung ke database!\n");

        // 2. Ambil objek database native dari Mongoose connection
        const db = mongoose.connection.db;
        
        // 3. Ambil statistik database
        const stats = await db.stats();

        // 4. Hitung ukuran dalam MB
        const dataSizeMB = (stats.dataSize / (1024 * 1024)).toFixed(4);
        const storageSizeMB = (stats.storageSize / (1024 * 1024)).toFixed(4);
        const batasMaxMB = 512;
        const perkiraanSisaMB = (batasMaxMB - dataSizeMB).toFixed(4);

        // 5. Cetak laporan ke console
        console.log("=== STATISTIK DATABASE MONGODB ===");
        console.log(`Nama Database    : ${stats.db}`);
        console.log(`Jumlah Koleksi   : ${stats.collections}`);
        console.log(`Jumlah Dokumen   : ${stats.objects}`);
        console.log(`Ukuran Data Asli : ${dataSizeMB} MB`);
        console.log(`Ukuran di Disk   : ${storageSizeMB} MB`);
        console.log(`-----------------------------------`);
        console.log(`Batas Maksimal   : ${batasMaxMB} MB (Free Tier)`);
        console.log(`Sisa Kapasitas   : Sekitar ${perkiraanSisaMB} MB lagi`);
        console.log("===================================");

    } catch (eror) {
        console.error("Gagal mengambil data:", eror);
    } finally {
        // Pastikan koneksi ditutup setelah selesai biar terminal nggak hang
        await mongoose.connection.close();
        console.log("\nKoneksi ditutup.");
    }
}

cekUkuranDatabase();
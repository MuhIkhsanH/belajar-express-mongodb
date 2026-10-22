require('dotenv').config();
const mongoose = require('mongoose');

const artikelSchema = new mongoose.Schema({
    Judul : { type: String, required: true },
    Isi : { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const Artikel = mongoose.model('Artikel', artikelSchema, 'express');

async function buatData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Terhubung ke mongodb')
        
        const dataBaru = await Artikel.create({
            Judul: "Express and MongoDB",
            Isi: "hello this is from express"
        });

        console.log('BERHASIL MENYIMPAN', dataBaru);

    } catch (eror) {
        console.error("terjadi eror",eror);
    } finally {
        await mongoose.connection.close();

    }
}

buatData();
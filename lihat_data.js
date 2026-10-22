require('dotenv').config();
const mongoose = require('mongoose');


const artikelSchema = ({
    Judul: String,
    Isi: String,
    date: { type: Date, default: Date.now }
});

const Artikel = mongoose.model('Artikel', artikelSchema, 'express');

async function lihatData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('terhubung ke mongodb');
        
        const semuaData = await Artikel.find();

        console.log("Isinya:")

        if (semuaData.length === 0) {
            console.log('belum ada data')
        } else {
            semuaData.forEach((item, index) => {
                console.log(`${index+1}. ID: ${item._id}`);
                console.log(`Judul: ${item.Judul}`);
                console.log(`Isi: ${item.Isi}`);
                console.log(`Tanggal: ${item.date}`)
            });
        }

    } catch (eror) {
        console.error('Terjadi eror', eror);
    } finally {
        await mongoose.connection.close();
    }
}

lihatData();
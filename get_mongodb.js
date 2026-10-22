require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;


app.set('json spaces', 2);
app.use(express.json());


const artikelSchema = new mongoose.Schema({
    Judul: String,
    Isi: String,
    Date: { type:Date, default: Date.now }
});

const Artikel = mongoose.model("Artikel", artikelSchema, 'express');

app.get('/artikel', async (req, res) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('terhubung database');

        const semuaData = await Artikel.find();

        if (semuaData.length === 0) {
            return res.status(404).json({
                pesan: "belum ada data"
            });
        }

        res.json(semuaData)

    } catch (eror) {
        console.error('Terjadi eror', eror);
        res.status(500).json({
            pesan: "Terjadi eror",
            error: eror.message
        });
    } finally {
        await mongoose.connection.close();
    }
});

app.listen(PORT, () => {
    console.log(`Berjalan di http://localhost:${PORT}`);
});
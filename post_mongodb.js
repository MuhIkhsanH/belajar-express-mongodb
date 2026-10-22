require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

app.set('json spaces', 2);
app.use(express.json());

const artikelSchema = ({
    Judul: String,
    Isi: String,
    Date: { type: Date, default: Date.now }
});

const Artikel = mongoose.model("Artikel", artikelSchema, 'express');

app.post('/artikel', async (req, res) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('terhubung database')
    
        const { Judul, Isi } = req.body;

        if (!Judul || !Isi) {
            return res.status(400).json({
                pesan: "wajib diisi!"
            });
        }

        const artikelBaru = new Artikel({Judul, Isi});
        const dataDisimpan = await artikelBaru.save();

        res.status(201).json({
            pesan: "Data berhasil ditambahkan",
            data: dataDisimpan
        });
    
    } catch (eror) {
        console.error('terjadi eror', eror);
        res.status(500).json({
            pesan: "Terjadi eror",
            error: eror.message
        });
    } finally {
        await mongoose.connection.close();
    }
});

app.listen(PORT, () => {
    console.log(`Server run di http://127.0.0.1:${PORT}`);
});
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

app.set('json spcaes', 2);
app.use(express.json());

const artikelSchema = new mongoose.Schema({
    Judul: String,
    Isi: String,
    Date: { type: Date, default: Date.now }
});

const Artikel = mongoose.model('Artikel', artikelSchema, 'express');

app.put('/artikel/:id', async (req, res) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('database terhubung');

        const { id } = req.params;
        const { Judul, Isi } = req.body;

        if (!Judul && !Isi ) {
            return res.status(400).json({
                pesan: "Minimal salah satu harus diisi"
            });
        }

        const dataDiupdate = await Artikel.findByIdAndUpdate(
            id,
            { Judul, Isi, Date: Date.now() },
            { returnDocument: 'after', runValidators: true }
        );

        if (!dataDiupdate) {
            return res.status(404).json({
                pesan: "Id tidak ditemukan"
            });
        }

        res.status(200).json({
            pesan: "Data berhasil diupdate",
            data: dataDiupdate
        })

    } catch (eror) {
        console.error("terjadi eror", eror);
        res.status(500).json({
            pesan: "terjadi eror",
            error: eror.message
        });
    } finally {
        await mongoose.disconnect();
    }
});

app.listen(PORT, () => {
    console.log(`server run di http://127.0.0.1:${PORT}`)
});
require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

app.set('json spaces', 2);
app.use(express.json());

const artikelSchema = new mongoose.Schema({
    Judul: String,
    Isi: String,
    Date: { type: Date, default: Date.now }
});

const Artikel = mongoose.model("Artikel", artikelSchema, 'express');

app.delete('/artikel/:id', async (req, res) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('database terhubung');
        const { id } = req.params;

        const dataDihapus = await Artikel.findByIdAndDelete(id);

        if (!dataDihapus) {
            return res.status(404).json({
                pesan: "id tidak ditemukan"
            });
        }

        res.status(200).json({
            pesan: "Data berhasil dihapus",
            data: dataDihapus
        });
    
    } catch (eror) {
        console.error("Terjadi eror saat delete", eror);
        res.status(500).json({
            pesan: "Terjadi eror",
            error: eror.message
        });
    } finally {
        await mongoose.disconnect();
    }
});

app.listen(PORT, () => {
    console.log(`server run di http://127.0.0.1:${PORT}`)
});
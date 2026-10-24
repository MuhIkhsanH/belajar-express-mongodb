require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const PORT = 3000;

const app = express();

app.set('json spaces', 2);

app.use(express.json());

const userSchema = new mongoose.Schema({
    nama: { type: String, required: true },
    password: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema, 'users');


app.post('/login', async (req, res) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('berhasil terhubung mongodb');

        const { nama, password } = req.body;

        if (!nama || !password ) {
            return res.status(400).json({
                sukses: false,
                pesan: "nama dan password wajib diisi"
            });
        }

        const user = await User.findOne({
            nama: nama
        });

        if (!user) {
            return res.status(404).json({
                sukses: false,
                pesan: "user tidak ditemukan"
            });
        }

        const passwordCocok = await bcrypt.compare(password, user.password);

        if (!passwordCocok) {
            return res.status(401).json({
                sukses: false,
                pesan: "password salah"
            });
        }


        const token = jwt.sign(
            { id: user._id,nama: user.nama},
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1h'}
        );

        console.log("user berhasil login", user.nama);
        
        res.status(200).json({
            sukes: true,
            pesan: "login berhasil",
            data: {
                id: user._id,
                nama: user.nama
            },
                token: token
        });
    
    } catch (eror) {
        console.error('terjadi eror', eror);
        res.status(500).json({
            sukses: false,
            eror: eror.mesage
        });
    } finally {
        await mongoose.connection.close();
    }
});

app.listen(PORT, () => {
    console.log(`server berjalan di http://127.0.0.1:${PORT}`)
});
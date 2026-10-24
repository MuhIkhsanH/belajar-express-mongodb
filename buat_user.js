require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const PORT = 3000;
const app = express();

app.set('json spaces', 2);
app.use(express.json());

userSchema = new mongoose.Schema({
    nama: { type: String, required: true },
    password: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema, 'users');

app.post('/buat-user', async (req, res) => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('terhubung mongodb')

        
        const { nama, password } = req.body;

        if (!nama || !password) {
            return res.status(400).json({
                sukses: false,
                pesan: "nama dan password wajib disii"
            });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const userBaru = await User.create({
            nama: nama,
            password: hashedPassword
        });

        const payload = {
            id: userBaru._id,
            nama: userBaru.nama
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1h' }
        );

        res.status(201).json({
            sukses: true,
            pesan: "User berhasil dibuat",
            data: {
                id: userBaru._id,
                nama: userBaru.nama,
                date: userBaru.date
            },
            token: token
        });


    } catch (eror) {
        console.error('terjadi eror', eror);
        res.status(500).json({
            sukses: false,
            pesan: "Terjadi kesalahan pada server",
            error: eror.message
        });
    } finally {
        await mongoose.connection.close();
    }
});

app.listen(PORT, () => {
    console.log(`server jalan di http://127.0.0.1:${PORT}`)
});
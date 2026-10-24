require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const PORT = 3000;
const app = express();

app.set('json spaces', 2);
app.use(express.json());

const userSchema = new mongoose.Schema({
    nama: { type: String, required: true },
    password: { type: String, required: true },
    date: { type:Date, default: Date.now }
});

const User = mongoose.model("User", userSchema, 'users');

function verifikasiToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            sukses: false,
            pesan: "token tidak ditemukan"
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, userDecoded) => {
        if (err) {
            return res.status(403).json({
                sukses: false,
                pesan: "token tidak valid atau sudah kadaluwarsa"
            });
        }
        req.user = userDecoded;
        next();
    });
}

app.post('/login', async (req, res) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('terhubung mongodb');

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
                pesan: "User atau password tidak ditemukan"
            });
        }

        const passwordCocok = await bcrypt.compare(password, user.password);
        if (!passwordCocok) {
            return res.status(401).json({
                sukses: false,
                pesan: "User atau Password salah "
            })
        }

        const token = jwt.sign(
            { id: user._id, nama: user.nama },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: "1h" }
        );

        res.status(200).json({
            sukses: true,
            pesan: "login berhasil",
            data: { id: user._id, nama: user.nama },
            token: token
        });

    } catch (eror) {
        console.error('terjadi eror', eror);
        res.status(500).json({
            sukses: false,
            eror: eror.message
        });
    } finally {
        await mongoose.connection.close();
    }
});

app.put('/changename', verifikasiToken, async (req, res) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('terhubung ke mongodb');

        const { nama } = req.body;

        if (!nama) {
            return res.status(400).json({
                sukses: false,
                pesan: "Nama baru wajib diisi"
            });
        }

        const userUpdate = await User.findByIdAndUpdate(
            req.user.id,
            { nama: nama },
            { returnDocument: 'after' }
        );

        if (!userUpdate) {
            return res.status(404).json({
                sukses: false,
                pesan: "user tidak ditemukan di database"
            });
        }

        const tokenBaru = jwt.sign(
            { id: userUpdate._id, nama: userUpdate.nama },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1h' }
        );

        res.status(200).json({
            sukses: true,
            pesan: "username berhasil diubah",
            data: { id:  userUpdate._id, nama: userUpdate.nama },
            tokenBaru: tokenBaru
        });
    
    } catch (eror) {
        console.error('terjadi eror',eror);
        res.status(500).json({
            sukses: false,
            eror: eror.message
        });
    } finally {
        await mongoose.connection.close();
    }
});

app.put('/changepassword', verifikasiToken, async (req, res) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const { passwordLama, passwordBaru } = req. body;

        if (!passwordLama || !passwordBaru) {
            return res.status(400).json({
                sukses:false,
                pesan: "Password lama dan baru wajib diisi"
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                sukses: false,
                pesan: "user tidak ditemukan"
            });
        }

        const passwordCocok = await bcrypt.compare(passwordLama, user.password);
        if (!passwordCocok) {
            return res.status(401).json({
                sukses: false,
                pesan: "password lama salah"
            });            
        }

        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(passwordBaru, saltRounds);

        user.password = hashedNewPassword;
        await user.save();

        res.status(200).json({
            sukses: true,
            pesan: "password berhasil diubah"
        });

    } catch (eror) {
        console.error('terjadi eror', eror);
        res.status(500).json({
            sukses: false,
            eror: eror.message
        });
    } finally {
        await mongoose.connection.close();
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost${PORT}`)
});
const express = require('express');
const router = express.Router();
const database = require('../sql/database.js');
const fs = require('fs/promises');

//!Multer
const multer = require('multer'); //?npm install multer
const path = require('path');
const { write } = require('fs');

const storage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, path.join(__dirname, '../uploads'));
    },
    filename: (request, file, callback) => {
        callback(null, Date.now() + '-' + file.originalname); //?egyedi név: dátum - file eredeti neve
    }
});

const upload = multer({ storage });

//!Fájlkezelés szinkron módon
// const fs2 = require('fs'); //?Amennyiben szinkron módon kezeljük a fájlt, úgy csak az fs-re van szükség!

// //*Fájl olvasása:
// const data = fs2.readFileSync('file.txt', 'utf8');
// console.log(data);
// //*Fájl írása:
// fs2.writeFileSync(
//     'file.txt',
//     'Content amit kiírunk - Lehetne egy változó is ennek a helyén',
//     'utf8'
// );

//!Fájlkezelés aszinkron módon - Ehhez már az fs/promises alapértelmezetten be van hivatkozva a fájlunk elején, így az fs változó használható hozzá.
//*Fájl olvasása
const readTextFile = async (filePath) => {
    try {
        const text = await fs.readFile(filePath, 'utf8');
        return text; //? string
    } catch (error) {
        throw new Error('Olvasási hiba: ', error.message);
    }
};
//*JSON fájl olvasása
const readJsonFile = async (filePath) => {
    try {
        const raw = await fs.readFile(filePath, 'utf8'); //?Eddig a pontig lesz egy szöveges tartalmunk
        return JSON.parse(raw); //? Átalakítjuk a nyers szöveget JSON formátummá
    } catch (error) {
        throw new Error('Olvasási hiba: ', error);
    }
};
//*Fájl írása
const writeTextFile = async (filePath, content) => {
    try {
        await fs.writeFile(filePath, content, 'utf8');
        return 'A fájl sikeresen elmentve.';
    } catch (error) {
        throw new Error('Hiba a fájl írásakor: ', error);
    }
};
//*JSON írása
const writeJsonFile = async (filePath, content) => {
    try {
        const jsonData = JSON.stringify(content, null, 2); //? Ez egy szépen formázott JSON-t fog eredményezni.
        // * Első paramétere a value ami azt határozza meg, hogy mit alakítunk át JSON kódra.
        // * Második paramétere a replacer ami egy opcionális szűrő függvény vagy tömb lenne, ami megadhatja, hogy mely kulcsokat szeretnénk kiírni. Ha nem szűrünk null az értéke
        // * Harmadik paramétere a space amely azt határozza meg, hogy hány szóközzel legyenek elválasztva a sorok. (sor behúzása a json-ben)
        await fs.writeFile(filePath, jsonData, 'utf8');
        return 'JSON fájl sikeresen mentve';
    } catch (error) {
        throw new Error('Hiba a fájl írásakor: ', error);
    }
};
//*Fájl létezik-e
const fileExists = async (filePath) => {
    try {
        await fs.access(filePath);
        return true; //?Amennyiben az előző fgv hívás nem dob hibát, a fájl létezik
    } catch (error) {
        return false; //? Ha hiba van, akkor nem létezik.
    }
};
//? fileExists fgv meghívása:
//* const exists = await fileExists('valami.txt');
//* if (exists) {
//*     console.log('Fájl létezik.');
//* } else {
//*     console.log('Fájl nem létezik.');
//* }

//*Fájl bővítése: JSON fájl esetén nem használható az appendFile, ott először beolvassuk a teljes JSON fájlt, majd módosítjuk a JavaScript Object-et és végül kiírjuk a módosított Object-et a JSON fájlba.
const appendTextFile = async (filePath, content) => {
    try {
        await fs.appendFile(filePath, content, 'utf8');
        return 'A fájl sikeresen bővítve.';
    } catch (error) {
        throw new Error('Hiba: ', error);
    }
};

//!Endpoints:
router.get('/read-text', async (request, response) => {
    try {
        const utvonal = path.join(__dirname, '../files/notes.txt');
        const content = await readTextFile(utvonal);
        response.status(200).json({
            success: true,
            content: content
        });
    } catch (error) {
        console.log(error);
        response.status(500).json({
            success: false
        });
    }
});

router.get('/read-json', async (request, response) => {
    try {
        const utvonal = path.join(__dirname, '../files/datas.json');
        const content = await readJsonFile(utvonal);
        response.status(200).json({
            success: true,
            content: content
        });
    } catch (error) {
        response.status(500).json({
            success: true
        });
    }
});

router.post('/write-text', async (request, response) => {
    try {
        const text = request.body.text; //? pl.: { "text": "Hello world!" }

        const utvonal = path.join(__dirname, '../files/writeText.txt');
        const message = await writeTextFile(utvonal, text); //? Adott útvonalra létrehozzuk a txt-t azon a néven ahogy az utvonal-ban meghatározzuk és a content-je a body-ból kiszedett text lesz
        response.status(200).json({
            succes: true,
            message: message
        });
    } catch (error) {
        response.status(500).json({
            succes: false
        });
    }
});

router.post('/write-json', async (request, response) => {
    try {
        const data = request.body; //* pl.: { "name": "Burom", "age": 14 }
        const utvonal = path.join(__dirname, '../files/writeJson.json');
        const message = await writeJsonFile(utvonal, data);

        response.status(200).json({
            success: true,
            message: message
        });
    } catch (error) {
        response.status(500).json({
            success: false
        });
    }
});

router.post('/append-text', async (request, response) => {
    try {
        const text = request.body.text; //? pl.: { "text": "Subway Surf" }
        const utvonal = path.join(__dirname, '../files/notes.txt');
        const message = await appendTextFile(utvonal, text);
        response.status(200).json({
            success: true,
            message: message
        });
    } catch (error) {
        response.status(500).json({
            success: false
        });
    }
});

//?GET /api/test
router.get('/test', (request, response) => {
    response.status(200).json({
        message: 'Ez a végpont működik.'
    });
});

//?GET /api/testsql
router.get('/testsql', async (request, response) => {
    try {
        const selectall = await database.selectall();
        response.status(200).json({
            message: 'Ez a végpont működik.',
            results: selectall
        });
    } catch (error) {
        response.status(500).json({
            message: 'Ez a végpont nem működik.'
        });
    }
});

module.exports = router;

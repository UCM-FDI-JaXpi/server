// index.js
const express = require('express');
const fs = require('fs');
const session = require('express-session');
const { authenticateUser } = require('./auth'); // Ajusta la ruta según tu estructura de archivos

const app = express();
const puerto = 3000;

app.use(express.json());
app.use(session({
    secret: 'tu_secreto', // Cambia esto a una cadena secreta más segura
    resave: false,
    saveUninitialized: true,
}));

app.post('/traza-jaxpi', (req, res) => {
    const { user_id, session_id, traza } = req.body;
    let dir;
    let filepath;

    if (!user_id) {
        res.status(400).send('No se encontró user_id');
        return;
    }
    if (!session_id) {
        res.status(400).send('No se encontró session_id');
        return;
    }
    if (!traza) {
        res.status(400).send('No se encontró traza');
        return;
    }

    dir = `fs/${user_id}/${session_id}`;

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    let nextFileNumber = fs.readdirSync(dir).length;

    filepath = `${dir}/traza${nextFileNumber}.json`;

    fs.writeFile(filepath, JSON.stringify(traza, null, 2), (err) => {
        if (err) {
            console.error('Error al escribir la traza en el archivo: ', err);
            res.status(500).send('Error interno del servidor al guardar la traza.');
        } else {
            console.log('Traza JaXpi recibida y almacenada en:', filepath);
            res.status(200).send('Traza JaXpi recibida y almacenada correctamente.');
        }
    });
});

app.get('/traza-jaxpi', (req, res) => {
    let dir = 'fs/';

    fs.readdir(dir, (err, users) => {
        if (err) {
            console.error('Error al leer los directorios: ', err);
            res.status(500).send('Error interno del servidor al obtener la lista de IDs de usuario.');
            return;
        }

        const user_dir = users.filter(user => fs.statSync(`${dir}${user}`).isDirectory());

        res.json({ user_ids: user_dir });
    });
});

app.get('/traza-jaxpi/:user_id', (req, res) => {
    let session_dir;
    let traza_path;
    let traza_data;
    let trazas = [];

    const user_id = req.params.user_id;
    const user_dir = `fs/${user_id}/`;

    fs.readdir(user_dir, (err, sessions) => {
        if (err) {
            console.error('Error al leer los directorios: ', err);
            res.status(500).send(`Error interno del servidor al obtener las trazas del usuario ${user_id}`);
            return;
        }

        for (const session of sessions) {
            session_dir = `${user_dir}${session}`;
            const trazas_filtradas = fs.readdirSync(session_dir).filter(traza => traza.startsWith('traza') && traza.endsWith('.json'));

            for (const traza of trazas_filtradas) {
                traza_path = `${session_dir}/${traza}`;
                try {
                    traza_data = fs.readFileSync(traza_path, 'utf-8');
                    const traza_parsed = JSON.parse(traza_data);
                    trazas.push(traza_parsed);
                } catch (error) {
                    console.error(`Error al leer en ${traza_path}: ${(error instanceof Error) ? error.message : error}`);
                }
            }
        }

        res.json(JSON.stringify({ trazas: trazas }, null, 2));
    });
});

app.listen(puerto, () => {
    console.log(`La aplicación está escuchando en http://localhost:${puerto}`);
});

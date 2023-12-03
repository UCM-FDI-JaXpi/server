// src/index.ts
import express, { Request, Response } from 'express'; // Importa el framework express y los tipos Request y Response
import * as fs from 'fs';

const app = express(); // Creamos instancia de express
const puerto = 3000; // Puerto en el que express escuchara las peticiones http

app.use(express.json()); // Permite reconocer solicitudes http como JSON

// Define una ruta para manejar las solicitudes POST.
// Tiene dos argumentos, req, de tipo Request, y res, de tipo Response
app.post('/traza-jaxpi', (req: Request, res: Response) => {
	const traza = req.body; // Almacena la traza dada por el cliente en el Request 
	// Restrictivo???
	let user_id: string = JSON.stringify(traza.actor.id);
	let dir: string;
	let filepath: string;

	// Si no está el user_id
	if (user_id == undefined) {
		res.status(400).send('No se encontró user_id');
		return;
	}

	dir = "fs/" + user_id.replace(/["']/g, '');

	// Verifica si existe el directorio, y si no lo crea
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}

	// Determina el próximo número de traza
	let nextFileNumber: number = fs.readdirSync(dir).length++;

	// Crear el nombre del archivo con el formato "trazaN.json"
	filepath = dir + "/traza" + nextFileNumber.toString() + ".json";

	// Escribir la traza en el archivo
	fs.writeFile(filepath, JSON.stringify(traza, null, 2), (err) => {
		if (err) {
			console.error('Error al escribir la traza en el archivo: ', err);
			res.status(500).send('Error interno del servidor al guardar la traza.');
		} else {
			console.log('Traza JaXpi recibida y almacenada en:', filepath);

			// Envía una respuesta al cliente con un código de estado 200 (OK) y un mensaje de confirmación
			res.status(200).send('Traza JaXpi recibida y almacenada correctamente.');
		}
	});
});

// Inicia el servidor express para escuchar en el puerto especificado. 
// Cuando el servidor está listo, se imprime un mensaje en la consola indicando la dirección  
// y el puerto en los que la aplicación está escuchando.
app.listen(puerto, () => {
	console.log(`La aplicación está escuchando en http://localhost:${puerto}`);
});

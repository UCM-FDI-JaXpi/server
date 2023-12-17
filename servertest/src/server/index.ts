// src/index.ts
import express, { Request, Response } from 'express'; // Importa el framework express y los tipos Request y Response
import * as fs from 'fs';

const app = express(); // Creamos instancia de express
const puerto = 3000; // Puerto en el que express escuchara las peticiones http

app.use(express.json()); // Permite reconocer solicitudes http como JSON

// Define una ruta para manejar las solicitudes POST.
// Tiene dos argumentos, req, de tipo Request, y res, de tipo Response
app.post('/traza-jaxpi', (req: Request, res: Response) => {
	const { user_id, session_id, traza} = req.body;
	let dir: string;
	let filepath: string;

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

	// Crea el nombre del directorio con el formato fs/user_id/
	// dir = "fs/" + user_id.replace(/["']/g, '');
	dir = "fs/" + user_id + "/" + session_id;

	// Verifica si existe el directorio, y si no lo crea
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}

	// Determina el próximo número de traza
	let nextFileNumber: number = fs.readdirSync(dir).length++;

	// Crea el nombre del archivo con el formato "trazaN.json"
	filepath = dir + "/traza" + nextFileNumber.toString() + ".json";

	// Escribe la traza en el archivo
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

// Define una ruta GET para obtener la lista de IDs de usuario
app.get('/traza-jaxpi', (req: Request, res: Response) => {
	let dir: string = "fs/";
	// Lee los directorios dentro de la carpeta base (fs/)
	fs.readdir(dir, (err, users) => {
	  if (err) {
		console.error('Error al leer los directorios: ', err);
		res.status(500).send('Error interno del servidor al obtener la lista de IDs de usuario.');
		return;
	  }
  
	// Filtra solo los directorios
	const user_dir = users.filter(user => fs.statSync(dir + user).isDirectory());
  
	res.json({ user_ids: user_dir });
	});
  });

// Inicia el servidor express para escuchar en el puerto especificado. 
// Cuando el servidor está listo, se imprime un mensaje en la consola indicando la dirección  
// y el puerto en los que la aplicación está escuchando.
app.listen(puerto, () => {
	console.log(`La aplicación está escuchando en http://localhost:${puerto}`);
});

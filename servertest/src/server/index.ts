// src/index.ts
import express, { Request, Response } from 'express'; // Importa el framework express y los tipos Request y Response

const app = express(); // Creamos instancia de express
const puerto = 3000; // Puerto en el que express escuchara las peticiones http

app.use(express.json()); // Permite reconocer solicitudes http como JSON

// Define una ruta para manejar las solicitudes POST.
// Tiene dos argumentos, req, de tipo Request, y res, de tipo Response
app.post('/traza-jaxpi', (req: Request, res: Response) => {
  const traza = req.body; // Almacena la traza dada por el cliente en el Request

// Imprime la traza por consola  
  console.log('Traza JaXpi recibida:');
  console.log(JSON.stringify(traza, null, 2));

// Envía una respuesta al cliente con un código de estado 200 (OK) y un mensaje de confirmación
  res.status(200).send('Traza JaXpi recibida');
});

// Inicia el servidor express para escuchar en el puerto especificado. 
// Cuando el servidor está listo, se imprime un mensaje en la consola indicando la dirección  
// y el puerto en los que la aplicación está escuchando.
app.listen(puerto, () => {
  console.log(`La aplicación está escuchando en http://localhost:${puerto}`);
});

// client.ts

// Importamos la biblioteca axios para realizar peticiones http
import axios from 'axios';

// Especificamos la URL a la que enviaremos la peticion
const url = 'http://localhost:3000/traza-jaxpi';

const getUsers = async () => {
	try {
	  const response = await axios.get(url);
	  console.log('Respuesta:', response.data);
	} catch (error) {
	  console.error('Error al enviar realizar petición get:', (error as Error).message);
	}
};

getUsers();

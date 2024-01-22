// client.ts

// Importamos la biblioteca axios para realizar peticiones http
import axios from 'axios';

// Especificamos la URL a la que enviaremos la peticion
const url = 'http://localhost:3000/traza-jaxpi/';

const getTrazas = async (user_id: any) => {
	try {
	  const response = await axios.get(url + user_id);
	  console.log('Respuesta:', response.data);
	} catch (error) {
	  console.error('Error al enviar realizar petición get:', (error as Error).message);
	}
};

getTrazas("123");
getTrazas("456");
getTrazas("456");

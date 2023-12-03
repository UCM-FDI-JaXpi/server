// client.ts

// Importamos la biblioteca axios para realizar peticiones http
import axios from 'axios';

// Especificamos la URL a la que enviaremos la peticion
const url = 'http://localhost:3000/traza-jaxpi';

// Traza de ejemplo a enviar
const trazajaxpi = {
	"actor": {
		"id": "4567",
		"name": "Player",
		"mbox": "mailto:player@example.com",
		"objectType": "Agent"
	},

	"verb": {
		"id": "https://github.com/UCM-FDI-JaXpi/lib/accepted",
		"display": {
			"en-US": "accepted"
		}
	},

	"object": {
		"id": "http://example.com/activity",
		"definition": {
			"name": {
				"en-US": "Object"
			},
			"description": {
				"en-US": "Indicates that the actor has accepted the object. For example, a person accepting an award, or a mission.",
				"es": "Indica que el actor ha aceptado el objeto. Por ejemplo, una persona aceptando un premio, o una misión."
			}
		},
		"objectType": "Activity"
	}
};

// Utiliza la función post de Axios para enviar una solicitud HTTP POST a la URL especificada. 
// Se pasa el objeto trazaJaXpi como el cuerpo de la solicitud. 
// Además, se especifica el encabezado Content-Type como application/json para indicar 
// que se está enviando un cuerpo en formato JSON.
axios.post(url, trazajaxpi, {
	headers: {
		'Content-Type': 'application/json'
	}
})
	// En caso de éxito, imprime la respuesta del servidor
	.then(response => {
		console.log('Respuesta:', response.data);
	})
	// En caso de error, lo imprime
	.catch(error => {
		console.error('Error al enviar la traza JaXpi:', error.message);
	});

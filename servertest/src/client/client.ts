// client.ts

// Importamos la biblioteca axios para realizar peticiones http
import axios from 'axios';

// Especificamos la URL a la que enviaremos la peticion
const url = 'http://localhost:3000/traza-jaxpi';

// Traza de ejemplo a enviar
const trazajaxpi = {
	"actor": {
	  "name": "John Doe",
	  "mbox": "mailto:john.doe@example.com"
	},
	"verb": {
	  "id": "http://example.com/verbs/completed",
	  "display": { "en-US": "completed" }
	},
	"object": {
	  "id": "http://example.com/activities/example-activity",
	  "definition": {
		"name": { "en-US": "Example Activity" }
	  }
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

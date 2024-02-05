// post_test.js
const axios = require('axios');

const url = 'http://localhost:3000/traza-jaxpi';

const trazajaxpi = {
    "actor": {
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

const trazaList = [
    { user_id: '123', session_id: 'session1', traza: trazajaxpi },
    { user_id: '123', session_id: 'session2', traza: trazajaxpi },
    { user_id: '123', session_id: 'session1', traza: trazajaxpi },
    { user_id: '123', session_id: 'session1', traza: trazajaxpi },
    { user_id: '123', session_id: 'session2', traza: trazajaxpi },
    { user_id: '456', session_id: 'session1', traza: trazajaxpi },
    { user_id: '456', session_id: 'session1', traza: trazajaxpi },
    { user_id: '456', session_id: 'session2', traza: trazajaxpi },
    { user_id: '789', session_id: 'session1', traza: trazajaxpi },
];

const sendTraza = async (traza) => {
    try {
        const response = await axios.post(url, traza, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log('Respuesta:', response.data);
    } catch (error) {
        console.error('Error al enviar la traza JaXpi:', error.message);
    }
};

for (const traza of trazaList) {
    sendTraza(traza);
}

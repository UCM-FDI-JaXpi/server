// post_test.js
const axios = require('axios');

const url = 'http://localhost:3000/record-jaxpi';

const recordJaXpi = {
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

const recordList = [
    { user_id: '123', session_id: 'session1', record: recordJaXpi },
    { user_id: '123', session_id: 'session2', record: recordJaXpi },
    { user_id: '123', session_id: 'session1', record: recordJaXpi },
    { user_id: '123', session_id: 'session1', record: recordJaXpi },
    { user_id: '123', session_id: 'session2', record: recordJaXpi },
    { user_id: '456', session_id: 'session1', record: recordJaXpi },
    { user_id: '456', session_id: 'session1', record: recordJaXpi },
    { user_id: '456', session_id: 'session2', record: recordJaXpi },
    { user_id: '789', session_id: 'session1', record: recordJaXpi },
];

const sendRecord = async (record) => {
    try {
        const response = await axios.post(url, record, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error sending JaXpi record:', error.message);
    }
};

for (const record of recordList) {
    sendRecord(record);
}

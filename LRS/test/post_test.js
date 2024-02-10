const axios = require('axios');

async function createStatement() {
    const user_id = "65c35e20e98bbe1a52518226";
    const statement = {
        actor: {
            name: 'Sally Glider',
            mbox: 'mailto:sally@example.com'
        },
        verb: {
            id: 'http://adlnet.gov/expapi/verbs/completed',
            display: { 'en-US': 'completed' }
        },
        object: {
            id: 'http://example.com/activities/hang-gliding-test',
            definition: {
                type: 'http://adlnet.gov/expapi/activities/assessment',
                name: { 'en-US': 'Hang Gliding Test' },
                description: { 'en-US': 'The Solo Hang Gliding test, consisting of a timed flight from the peak of Mount Magazine' },
                extensions: { 'http://example.com/gliderClubId': 'test-435' }
            }
        },
        result: {
            completion: true,
            success: true,
            score: { scaled: 0.95 },
            extensions: { 'http://example.com/flight/averagePitch': 0.05 }
        },
        context: {
            instructor: {
                name: 'Irene Instructor',
                mbox: 'mailto:irene@example.com'
            },
            contextActivities: {
                parent: { id: 'http://example.com/activities/hang-gliding-class-a' },
                grouping: { id: 'http://example.com/activities/hang-gliding-school' }
            },
            extensions: { 'http://example.com/weatherConditions': 'rainy' }
        },
        timestamp: '2012-07-05T18:30:32.360Z',
        stored: '2012-07-05T18:30:33.540Z',
        authority: {
            name: 'Irene Instructor',
            mbox: 'mailto:irene@example.com'
        }
    };

    try {
        const response = await axios.post('http://localhost:3000/statements', {
            user_id: user_id,
            statement: statement
        });
        console.log('Statement created:', response.data);
    } catch (error) {
        console.error('Error creating statement:', error.response.data.message || error.message);
    }
}

createStatement();

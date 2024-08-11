const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
	actor: {
		name: { type: String, required: true },
		mbox: { type: String, required: true }
	},
	verb: {
		id: { type: String, required: true },
		display: { type: Object, required: true }
	},
	object: {
		id: { type: String, required: true },
		definition: {
			type: { type: String, required: true },
			name: { type: Object, required: true },
			description: { type: Object, required: true },
			extensions: { type: Object }
		}
	},
	result: {
		completion: { type: Boolean },
		success: { type: Boolean },
		score: {
			scaled: { type: Number }
		},
		extensions: { type: Object }
	},
	context: {
		instructor: {
			name: { type: String },
			mbox: { type: String }
		},
		contextActivities: {
			parent: { id: { type: String } },
			grouping: { id: { type: String } }
		},
		extensions: { 
			type: Object,
			"https://www.jaxpi.com/gameId": { type: String },
			"https://www.jaxpi.com/gameName": { type: String },
			"https://www.jaxpi.com/sessionKey": { type: String },
			"https://www.jaxpi.com/sessionId": { type: String },
			"https://www.jaxpi.com/sessionName": { type: String }
		}
	},
	timestamp: { type: Date, required: true },
	stored: { 
		type: Date,
		default: Date.now
	},
	authority: {
		name: { type: String },
		mbox: { type: String }
	}
});

module.exports = mongoose.model('Record', recordSchema);

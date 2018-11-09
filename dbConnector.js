const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// Connection URL
mongoose.connect(process.env.DB_URL);
// const dbUrl = 'mongodb://localhost:27017/market';

// Use connect method to connect to the server
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log('Connected to DB!')
});

const storeSchema = new mongoose.Schema({
	order: {
		typeId: Number,
		body: {
			duration: Number,
			isBuy: Boolean,
			issued: String,
			location: Number,
			minVolume: Number,
			orderId: Number,
			price: Number,
			range: String,
			volumeRemaining: Number,
			volumeTotal: Number
		}
	}
});

storeSchema.pre('save', function (next) {
	if (!this.isModified()) {
		next(); // skip it
		return; // stop this function from running
	}
});

exports.goonDB = mongoose.model('Delve', storeSchema, 'Delve');
exports.forgeDB = mongoose.model('Forge', storeSchema, 'Forge');
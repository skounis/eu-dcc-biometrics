const winston = require('winston');

// Setup Logger
const logConfiguration = {
	'transports': [
		new winston.transports.File({
			filename: 'logs/permit.create.log'
		})
	],
	'format': winston.format.printf(({ level, message }) => {
		return `${level}: ${message}`;
	})
};
const logger = winston.createLogger(logConfiguration);

module.exports = logger

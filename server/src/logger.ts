import winston from 'winston';
import path from 'path';
import { directories } from './settings';

const { combine, timestamp, json, errors } = winston.format;

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      format: combine(timestamp(), json()),
      filename: path.join(directories.stateDir, 'combined.log'),
      level: process.env.NODE_ENV !== 'production' ? 'verbose' : 'http',
    }),

    new winston.transports.File({
      format: combine(errors({ stack: true }), timestamp(), json()),
      filename: path.join(directories.stateDir, 'error.log'),
      level: 'error',
    }), // Log error level to error.log
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(directories.stateDir, 'exception.log') }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: path.join(directories.stateDir, 'rejections.log') }),
  ],
});
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(errors({ stack: true }), timestamp(), json()),
    })
  );
}

export default logger;

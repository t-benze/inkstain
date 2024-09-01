import winston from 'winston';
import path from 'path';
import { directories } from './settings';
import DailyRotateFile from 'winston-daily-rotate-file';
import fs from 'fs';

const { combine, timestamp, json, errors } = winston.format;
const logFolder = path.join(directories.stateDir, 'logs');
if (!fs.existsSync(logFolder)) {
  fs.mkdirSync(logFolder, { recursive: true });
}

const logger = winston.createLogger({
  transports: [
    new DailyRotateFile({
      format: combine(timestamp(), json()),
      filename: path.join(logFolder, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '10m',
      maxFiles: '7d', // Keep logs for 7 days
      level: process.env.NODE_ENV !== 'production' ? 'verbose' : 'data',
    }),
  ],
  exceptionHandlers:
    process.env.NODE_ENV === 'production'
      ? [
          new DailyRotateFile({
            filename: path.join(logFolder, 'exception-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '10m',
            maxFiles: '7d', // Keep exception logs for 7 days
          }),
        ]
      : undefined,
  rejectionHandlers:
    process.env.NODE_ENV === 'production'
      ? [
          new DailyRotateFile({
            filename: path.join(logFolder, 'rejections-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '10m',
            maxFiles: '7d', // Keep rejection logs for 7 days
          }),
        ]
      : undefined,
});

if (process.env.NODE_ENV === 'development') {
  logger.add(
    new winston.transports.Console({
      format: combine(errors({ stack: true }), timestamp(), json()),
    })
  );
}

export default logger;

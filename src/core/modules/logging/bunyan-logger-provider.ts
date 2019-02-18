import * as bunyan from 'bunyan';
import * as logzioBunyanStream from 'logzio-bunyan';
import * as Path from 'path';

const LOG_LEVEL = {
  FATAL: 'fatal',
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
  TRACE: 'trace',
};

const convertToBunyanLevel = (level: string) => {
  switch (level) {
    case LOG_LEVEL.FATAL:
      return bunyan.FATAL;
    case LOG_LEVEL.ERROR:
      return bunyan.ERROR;
    case LOG_LEVEL.WARN:
      return bunyan.WARN;
    case LOG_LEVEL.INFO:
      return bunyan.INFO;
    case LOG_LEVEL.DEBUG:
      return bunyan.DEBUG;
    case LOG_LEVEL.TRACE:
      return bunyan.TRACE;
  }
  return bunyan.DEBUG;
};

export const createLogger = (
  name: string,
  path: string,
  rotatePeriod: number = 1,
  rotateFileKeepingCount: number = 3,
  level: string = LOG_LEVEL.DEBUG,
) => {
  path = Path.resolve('.', path);
  const bunyanLevel = convertToBunyanLevel(level);
  const levelValue = bunyan.resolveLevel(bunyanLevel);
  const logger = bunyan.createLogger({
    name,
    streams: [
      {
        type: 'stream',
        level: bunyan.DEBUG,
        stream: process.stdout,
      },
      {
        level: levelValue,
        type: 'rotating-file',
        path,
        period: rotatePeriod + 'd', // daily rotation
        count: rotateFileKeepingCount, // keep 3 back copies
      },
    ],
  });
  process.on('SIGUSR2', () => logger.reopenFileStreams());
  return logger;
};

export const createLogzioLogger = (apiToken, name) => {
  const loggerOptions = {
    token: apiToken
  };

  const logzioStream = new logzioBunyanStream(loggerOptions);

  const logger = bunyan.createLogger({
    name,
    streams: [
        {
            type: 'raw',
            stream: logzioStream
        }
    ]
  });

  return logger;
};

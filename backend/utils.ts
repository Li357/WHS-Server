import { MongoClient, Db } from 'mongodb';
import { ErrorRequestHandler, Handler } from 'express';

export function asyncMiddleware(fn: Handler) {
  const middleware: Handler = async (req, res, next) => {
    try {
      await fn(req, res, next);
      next();
    } catch (error) {
      next(error);
    }
  };
  return middleware;
}

export async function connectToMongoDB(url: string, name: string) {
  log(`Connecting to database ${name}...`);
  const client = await MongoClient.connect(url, { useNewUrlParser: true });
  log(`Connected to database ${name}.`);
  return {
    client,
    db: client.db(name),
  };
}

export function attachDB(db: Db) {
  const middleware: Handler = (req, res, next) => {
    req.db = db;
    next();
  };
  return middleware;
}

export function log(message: string) {
  // tslint:disable-next-line: no-console
  console.log(`[${new Date()}]: ${message}`);
}

export const errorHandler: ErrorRequestHandler = (error, { method, originalUrl }, res, next) => {
  log(`ERROR during request, ${method} ${originalUrl}! Stacktrace:\n${error}`);
  res.status(500);
};

export function cleanUp(client: MongoClient) {
  return async function listener() {
    log('Closing database connection...');
    await client.close();
    log('Closed database connection.');
    process.exit(1);
  };
}
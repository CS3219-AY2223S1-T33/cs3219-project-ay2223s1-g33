import express, { Request, Response, NextFunction } from 'express';

const jsonParser = express.json({type: "*/json"})
const jsonParseFailureHandler = (err: Error, req: Request, res :Response, next: NextFunction) => {
  if (err instanceof SyntaxError) {
    return res.status(400).send({ status: 400, message: err.message }); // Bad request
  }
  next();
}
const jsonParseMiddleware = [jsonParser, jsonParseFailureHandler];

export {
    jsonParseMiddleware,
};

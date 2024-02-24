import { DefinedError } from 'ajv';

export class RequestParamsError extends Error {
  constructor(message, public errors: DefinedError[]) {
    super(message);
  }
}

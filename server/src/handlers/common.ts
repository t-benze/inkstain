import { DefinedError } from 'ajv';

export class RequestParamsError extends Error {
  constructor(message: string, public errors: DefinedError[]) {
    super(message);
  }
}

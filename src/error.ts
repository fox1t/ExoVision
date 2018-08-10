const codes = {
  INVALID_OBJECT_ID: 400,
  MISSING_OBJECT_ID: 400,
  EMPTY_DOCUMENT: 400,
  DOCUMENT_VALIDATION_ERROR: 400,
  MISSING_UNIQUE_KEY: 400,
  MISSINMISSING_AUTH_DATA: 400,
  CREDENTIALS_NOT_VALID: 400,
  MISSING_MANDATORY_PRAMETER: 400,
  TOKEN_NOT_VALID: 401,
  DOCUMENT_NOT_FOUND: 404,
  INCOMPATIBLE_CHANGE_STATUS: 409,
  DUPLICATED_DOCUMENT: 409,
  REMOTE_UNREACHABLE: 503,
  GENERIC_ERROR: 500,
}

class Interference extends Error {
  type: string
  statusCode: number
  details: any

  constructor(message: string, type: string = 'GENERIC_ERROR', details: any = {}, code: number = 500) {
    super(message)

    Object.defineProperty(this, 'message', {
      configurable: true,
      enumerable: false,
      value: message,
      writable: true,
    })

    Object.defineProperty(this, 'name', {
      configurable: true,
      enumerable: false,
      value: this.constructor.name,
      writable: true,
    })

    this.type = type
    this.details = details
    this.statusCode = codes[code] || code

    if (Error.hasOwnProperty('captureStackTrace')) {
      Error.captureStackTrace(this, this.constructor)
      return
    }

    Object.defineProperty(this, 'stack', {
      configurable: true,
      enumerable: false,
      value: (new Error(message)).stack,
      writable: true,
    });
  }
}

export default (message: string, type?: string, details?: any, code?: number): Interference =>
  new Interference(message, type, code, details)

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

const getStatusCode = (code) => typeof code === 'number' ? code : codes[code] || codes.GENERIC_ERROR

class ProtovisionError extends Error {
  code: string | number
  statusCode: number
  details: any

  constructor(message: string, code: string | number = 'GENERIC_ERROR', details: any = {}) {
    super(message)

    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    const codeIsNumber = typeof code === 'number'
    this.code = codes[code] ? code : codeIsNumber ? 'REMOTE_API_ERROR' : 'GENERIC_ERROR'
    this.statusCode = codeIsNumber ? code : getStatusCode(code)
    this.details = details
  }
}

export default (message: string, code?: string | number, details: any = {}): ProtovisionError | Error =>
  Error.captureStackTrace ?
  new ProtovisionError(message, code, details) :
  new Error(message)

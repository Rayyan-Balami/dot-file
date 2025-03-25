export class ApiError extends Error {
  constructor(statusCode = 500, message = null, errors = [], stack = "") {
    super(message || ApiError.getDefaultMessage(statusCode));
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.data = null;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  //Convert the error to JSON
  toJSON() {
    return {
      statusCode: this.statusCode,
      success: this.success,
      message: this.message,
      errors: this.errors,
      data: this.data,
    };
  }

  // Default messages for common status codes
  static getDefaultMessage(statusCode) {
    const messages = {
      400: "Bad Request",
      401: "Unauthorized",
      403: "Forbidden",
      404: "Not Found",
      409: "Conflict",
      422: "Unprocessable Entity",
      500: "Internal Server Error",
    };
    return messages[statusCode] || "Unknown Error";
  }
}
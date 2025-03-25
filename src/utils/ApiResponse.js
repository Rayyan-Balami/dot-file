export class ApiResponse {
  constructor(statusCode = 200, message = "Success", data = null, meta = {}) {
    this.statusCode = statusCode;
    this.success = true;
    this.message = message;
    this.data = data;
    this.meta = meta; // Useful for pagination, additional info
  }

  // Convert response to JSON
  toJSON() {
    return {
      statusCode: this.statusCode,
      success: this.success,
      message: this.message,
      data: this.data,
      meta: this.meta,
    };
  }
}
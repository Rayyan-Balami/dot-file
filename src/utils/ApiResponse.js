export class ApiResponse {
  constructor(statusCode = 200, data = null, message = "Success", meta = {}) {
    this.statusCode = statusCode;
    this.success = true;
    this.data = data;
    this.message = message;
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
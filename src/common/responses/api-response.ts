export class ApiResponse {
  code: number;
  message: string;
  error: any;
  data: any;

  constructor(code?: any, message?: any, error?: any, data?: any) {
    this.code = code;
    this.message = message;
    this.error = error;
    this.data = data;
  }
}

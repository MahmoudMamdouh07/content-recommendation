/**
 * ApiResponse - Standardized response format for all API endpoints
 */
export class ApiResponse {
  readonly body: any;
  readonly status: 'success' | 'failure';
  readonly message: string;

  /**
   * Create a standardized API response
   * @param body Response data
   * @param message Response message
   * @param status Response status ('success' or 'failure')
   */
  constructor(
    body: any = null, 
    message: string = 'Operation successful', 
    status: 'success' | 'failure' = 'success'
  ) {
    this.body = body;
    this.message = message;
    this.status = status;
  }
} 
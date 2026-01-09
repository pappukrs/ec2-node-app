/**
 * Enhanced error handling for API calls
 */

export interface ApiError {
  message: string;
  status?: number;
  statusText?: string;
  url?: string;
  isNetworkError: boolean;
  isCorsError: boolean;
}

export function handleApiError(error: unknown, apiUrl: string): ApiError {
  const apiError: ApiError = {
    message: 'Unknown error occurred',
    url: apiUrl,
    isNetworkError: false,
    isCorsError: false,
  };

  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    apiError.isNetworkError = true;
    apiError.message = `Network error: Cannot reach API at ${apiUrl}`;
    
    // Check if it's likely a CORS error
    if (apiUrl.startsWith('http') && !apiUrl.includes(window.location.hostname)) {
      apiError.isCorsError = true;
      apiError.message += '. This might be a CORS issue. Check backend CORS configuration.';
    }
  } else if (error instanceof Error) {
    apiError.message = error.message;
  } else if (typeof error === 'string') {
    apiError.message = error;
  }

  // Log detailed error information
  console.error('❌ API Error:', {
    url: apiUrl,
    error: apiError,
    timestamp: new Date().toISOString(),
  });

  return apiError;
}

export function getErrorMessage(error: ApiError): string {
  if (error.isCorsError) {
    return `CORS Error: The backend at ${error.url} is not allowing requests from this origin. Please check backend CORS configuration.`;
  }
  
  if (error.isNetworkError) {
    return `Network Error: Cannot connect to ${error.url}. Please check if the backend server is running.`;
  }
  
  return error.message;
}


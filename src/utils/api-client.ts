// Axios interceptor configuration for handling API requests and responses
import axios from "axios";

// Create an instance of axios with default configuration
const apiClient = axios.create({
  baseURL: process.env.API_URL, // Base URL for API requests
  headers: {
    "Content-Type": "application/json", // Default content type for requests
  },
});

// Request interceptor to add authorization token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken"); // Retrieve token from local storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Add token to request headers
    }
    return config;
  },
  (error) => {
    return Promise.reject(error); // Handle request errors
  },
);

// Response interceptor to handle responses and errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response; // Return response data directly
  },
  (error) => {
    if (error.response) {
      // Handle specific HTTP status codes
      switch (error.response.status) {
        case 401:
          // Unauthorized, redirect to login page or show a message
          console.error("Unauthorized access - please log in.");
          break;
        case 403:
          // Forbidden, show a message or redirect
          console.error(
            "Forbidden - you do not have permission to access this resource.",
          );
          break;
        case 500:
          // Internal server error, show a message
          console.error("Server error - please try again later.");
          break;
        default:
          // Handle other status codes as needed
          console.error(
            `Error: ${error.response.status} - ${error.response.data}`,
          );
      }
    } else if (error.request) {
      // No response received from the server
      console.error(
        "No response received from the server. Please check your network connection.",
      );
    } else {
      // Other errors
      console.error("Error setting up the request:", error.message);
    }
    return Promise.reject(error); // Reject the promise with the error
  },
);

export default apiClient;

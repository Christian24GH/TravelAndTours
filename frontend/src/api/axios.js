
import axios from 'axios'

// Ensure credentials (cookies) are sent with all requests
axios.defaults.withCredentials = true;

export default axios.create({
  baseURL: "http://localhost:8091/", // auth backend on port 8091
  withCredentials: true, // important for Sanctum
  withXSRFToken: true,
});
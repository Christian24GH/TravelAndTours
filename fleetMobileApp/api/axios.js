import axios from 'axios'

export default axios.create({
  baseURL: "http://10.192.155.56:8091", // auth backend on port 8091
  withCredentials: true, // important for Sanctum
  withXSRFToken: true,
});
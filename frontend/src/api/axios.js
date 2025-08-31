import axios from 'axios'

axios.defaults.withCredentials = true;

export default axios.create({
  baseURL: "http://localhost:8091/",
  withCredentials: true,
  withXSRFToken: true,
});
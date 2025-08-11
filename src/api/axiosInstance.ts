import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://52.78.98.150:8080";

console.log("🌐 API Base URL:", baseURL);

export const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});
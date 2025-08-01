import axios from "axios";

const baseURL = import.meta.env.API_BASE_URL;
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
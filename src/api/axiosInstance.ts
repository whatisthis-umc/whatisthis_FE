import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;


export const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});
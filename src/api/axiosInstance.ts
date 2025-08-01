import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL : 'http://52.78.98.150:8080',
    headers: {
        'Content-Type': 'application/json',
    }
})
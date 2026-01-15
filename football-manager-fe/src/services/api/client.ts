import axios from 'axios';
import { setupRequestInterceptor, setupResponseInterceptor } from './interceptors';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Setup interceptors
setupRequestInterceptor(axiosClient);
setupResponseInterceptor(axiosClient);

export default axiosClient;

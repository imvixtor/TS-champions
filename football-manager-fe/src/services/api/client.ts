import axios from 'axios';
import { setupRequestInterceptor, setupResponseInterceptor } from './interceptors';
import { API_CONFIG } from '../../config/env';

const axiosClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Setup interceptors
setupRequestInterceptor(axiosClient);
setupResponseInterceptor(axiosClient);

export default axiosClient;

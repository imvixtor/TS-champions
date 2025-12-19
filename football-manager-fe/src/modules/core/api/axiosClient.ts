import axios from "axios";

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },

});

axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    axiosClient.interceptors.response.use(
        (Response) => Response,
        (error) => {
            if (error.Response && error.Response.status === 401) {
            // Token hết hạn hoặc không hợp lệ -> Xóa và reload
            // localStorage.clear();
            // window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );
export default axiosClient;
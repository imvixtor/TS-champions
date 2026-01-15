import axios from 'axios';

type AxiosInstanceType = ReturnType<typeof axios.create>;

export const setupRequestInterceptor = (instance: AxiosInstanceType) => {
    instance.interceptors.request.use(
        (config: any) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error: any) => {
            return Promise.reject(error);
        }
    );
};

export const setupResponseInterceptor = (instance: AxiosInstanceType) => {
    instance.interceptors.response.use(
        (response: any) => response,
        (error: any) => {
            if (error.response && error.response.status === 401) {
                // Token hết hạn hoặc không hợp lệ
                // Có thể xử lý logout tự động ở đây nếu cần
                // localStorage.clear();
                // window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );
};

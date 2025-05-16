import axios from "axios";

const BASE_URL = 'https://trinhquocdat.pythonanywhere.com/';

export const endpoints = {
    'login': '/api/user/login/',
    'register': '/api/user/',
    'current-user': '/api/user/current_user/',
    'comments': (lessonId) => `/lessons/${lessonId}/comments/`
};

export const authApis = (token) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
}

export default axios.create({
    baseURL: BASE_URL
});
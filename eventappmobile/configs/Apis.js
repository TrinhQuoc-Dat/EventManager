import axios from "axios";

// const BASE_URL = 'https://trinhquocdat.pythonanywhere.com/';

// const BASE_URL = "http://172.16.112.102:8000/";
// const BASE_URL = "http://172.16.112.104:8000/"
const BASE_URL = "http://192.168.1.11:8000/"

export const endpoints = {
    'login': '/api/user/login/',
    'register': '/api/user/',
    'current-user': '/api/user/current_user/',
    'googleLogin': '/api/user/google-login/',
    "gg": "/oauth/",
    // 'events': (cateId) => `/api/categories/${cateId}/events/`,
    // 'create-event': '/api/event/',
    'event': (eventId) => `/api/event/${eventId}/`,
    'events': '/api/event/',
    'categories': '/api/categories/'
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
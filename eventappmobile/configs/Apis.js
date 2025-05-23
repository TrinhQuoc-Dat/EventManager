import axios from "axios";

const BASE_URL = 'https://trinhquocdat.pythonanywhere.com/';

export const endpoints = {
    'login': '/api/user/login/',
    'register': '/api/user/',
    'current-user': '/api/user/current_user/',
    'comments': (lessonId) => `/lessons/${lessonId}/comments/`,
    'events': (cateId) => `/api/categories/${cateId}/events/`,
    'event': (eventId) => `/api/event/${eventId}/`,
    'create-event': '/api/event/',
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
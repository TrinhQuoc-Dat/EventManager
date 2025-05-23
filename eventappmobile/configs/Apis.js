import axios from "axios";

// const BASE_URL = 'https://trinhquocdat.pythonanywhere.com/';

// const BASE_URL = "http://172.16.112.102:8000/";
const BASE_URL = "http://172.16.112.104:8000/"

export const endpoints = {
    'login': '/api/user/login/',
    'register': '/api/user/',
    'current-user': '/api/user/current_user/',
    'googleLogin': '/api/user/google-login/',
    "gg": "/oauth/",
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
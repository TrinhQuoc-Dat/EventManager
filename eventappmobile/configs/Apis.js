import axios from "axios";

// const BASE_URL = 'https://trinhquocdat.pythonanywhere.com/';


export const BASE_URL = "http://172.16.112.104:8000/"
// const BASE_URL = "http://192.168.1.9:8000/"


export const endpoints = {
    'login': '/api/user/login/',
    'register': '/api/user/',
    'current-user': '/api/user/current_user/',
    'googleLogin': '/api/user/google-login/',
    "gg": "/oauth/",
    // 'events': (cateId) => `/api/categories/${cateId}/events/`,
    // 'create-event': '/api/event/',
    'event': (eventId) => `/api/event/${eventId}/`,
    'event-list': '/api/event/',
    'create-event': '/api/event/',
    'categories': '/api/categories/',
    'payment-history': '/api/payment/history/',
    'qr-code': '/api/payment-ticket/qr-code/',
    'payment': '/api/payment-ticket/payment/',
    'checkin': (qrCode) => `/checkin/${qrCode}/`,
    'event-user': '/api/event/user/',
    'events': '/api/event/',
    'categories': '/api/categories/',
    'create-ticket-types': (eventId) => `/api/event/${eventId}/ticket-types/`,
    'post-comment': (eventId) => `/api/event/${eventId}/comments/`,
    'add-ticket-type': (eventId) => `/api/event/${eventId}/add-ticket-type/`,
    'add-date': (eventId) => `/api/event/${eventId}/add-date/`,
    'delete-date': (dateId) => `/api/event-date/${dateId}/`,
    'ticket-type-of-date': (dateId) => `/api/event-date/${dateId}/ticket-types/`,
    'delete-ticket-type': (ticketTypeId) => `/api/ticket-types/${ticketTypeId}/`,
    'ticketed-events': '/api/payment-ticket/user-events/',
    "event-stats": (eventId) => `/api/event/${eventId}/stats/`,
    "discount-codes": `/api/discount-codes/`,
    "suggestion": `/api/event/suggestion/`
    

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
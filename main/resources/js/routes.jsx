const APP_URL = "http://localhost/TravelAndTour/main/public"
const API_URL = "http://localhost/TravelAndTour/main/public/api"
export const web_routes = {
    landing_page: APP_URL + '/',
    login_page: APP_URL + "/login",
    register_page: APP_URL + "/register",
}

export const api_routes = {
    login: API_URL + "/login",
    register: APP_URL + "/register"
}
import axiosInstance from "../axiosApi";

export function attemptLogin(username, password){
    axiosInstance.post('/token/obtain/', {
            username: username,
            password: password
        }).then(
            result => {
                axiosInstance.defaults.headers['Authorization'] = "JWT " + result.data.access;
                localStorage.setItem('access_token', result.data.access);
                localStorage.setItem('refresh_token', result.data.refresh);
                window.location.href = "/"; //should redirect to feed
            }
    ).catch (error => {
        throw error;
    })

} //.then is used as otherwise react will assign undefined to headers (hasn't received yet)
//489 Bad Event - The server did not understand an event package specified in an Event header field.


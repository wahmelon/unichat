import axiosInstance from "../axiosApi";

function attemptLogin(username, password) {
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
    console.log("error logging in");
    throw error;
})
};

function setUniInfo(group_list, faculty){
        axiosInstance.post('/user/set_uni_info/', {
            group_list: group_list,
            faculty: faculty
        }).then(
                result => {
                    console.log(result)
                    }                
        ).catch (error => {
            console.log(error.stack);
        })

    };

export { attemptLogin, setUniInfo };


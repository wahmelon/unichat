
import React, { Component } from "react";
import axiosInstance from "../axiosApi";

class Logout extends Component {
    constructor(props) {
        super(props);
        this.handleLogout = this.handleLogout.bind(this);
    }

    handleLogout(){
        event.preventDefault();
        axiosInstance.post('/blacklist/', {
                "refresh_token" : localStorage.getItem("refresh_token")
            }).then(
                result => {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    axiosInstance.defaults.headers["Authorization"] = null;
                    window.location.href = "/"; //should redirect to authentication
                    return result;
                }
        ).catch (error => {
            throw error;
        })

    } //.then is used as otherwise react will assign undefined to headers (hasn't received yet)
    //489 Bad Event - The server did not understand an event package specified in an Event header field.

    render() {
        return (
            <div>
                Logout
                <button onClick={this.handleLogout}>
                  Click me!
                </button>
            </div>
        )
    }
}
export default Logout;
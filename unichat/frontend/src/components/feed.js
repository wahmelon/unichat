// djsr/frontend/src/components/login.js

import React, { Component } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../axiosApi";
 


class Feed extends Component {

    state = {

        groupArray : [] //university, faculty, enrolled units
    }

    componentDidMount(){
        console.log("running componentDidMount")
        if (localStorage.getItem('access_token')){
            this.setState({isAuthenticated: true})
        }
    }

    getMessage(){
        axiosInstance.get('/hello/')
        .then(
            result => {
                console.log(result)
            }
        ).catch(error => {throw error;})
    }


    render() {
        return (
            <div>
                <nav>
                    <Link className={"nav-link"} to={"/authentication/"}>Logout</Link>
                </nav>
            Feed
                <button onClick={this.getMessage}>
                  Click me!
                </button>
            </div>
        )
    }
}
export default Feed;
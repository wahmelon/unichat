// djsr/frontend/src/components/login.js

import React, { Component } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../axiosApi";



class Feed extends Component {

    state = {

        groupArray : [], //university, faculty, enrolled units
        username: ""
    }

    componentDidMount(){
                axiosInstance.get('/getusergroups/')
        .then(
            result => {
                this.setState({username:result.data.username})
            }
        ).catch(error => {throw error;})

    }






    render() {
        return (
            <div>
                <nav>
                    <Link className={"nav-link"} to={"/authentication/"}>Logout</Link>
                </nav>
            Feed of: {this.state.username}.
                <button onClick={this.getMessage}>
                  Click me!
                </button>
            </div>
        )
    }
}
export default Feed;
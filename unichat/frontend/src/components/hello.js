// djsr/frontend/src/components/hello.js

import React, { Component } from "react";
import axiosInstance from "../axiosApi";

class Hello extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message:"",
        };

        this.getMessage = this.getMessage.bind(this)
    }

    getMessage(){
        axiosInstance.get('/hello/')
        .then(
            result => {
                console.log(result)
            }
        ).catch(error => {throw error;})
    }


    handleSubmit(event){
        event.preventDefault();
        axiosInstance.post('/token/obtain/', {
                username: this.state.username,
                password: this.state.password
            }).then(
                result => {
                    axiosInstance.defaults.headers['Authorization'] = "JWT " + result.data.access;
                    localStorage.setItem('access_token', result.data.access);
                    localStorage.setItem('refresh_token', result.data.refresh);
                }
        ).catch (error => {
            throw error;
        })

    }




    render(){
        return (
            <div>
                <p>{this.state.message}</p>
                <p> Hello :--)</p>
                <button onClick={this.getMessage}>
                  Click me!
                </button>
            </div>



        )
    }
}

export default Hello;
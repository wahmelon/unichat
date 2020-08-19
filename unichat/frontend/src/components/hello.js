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
// djsr/frontend/src/components/signup.js
import React, { Component } from "react";
import axiosInstance from "../axiosApi";
import { Link } from "react-router-dom";



class Signup extends Component{
    constructor(props){
        super(props);
        this.state = {
            username: "",
            password: "",
            email:""
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    handleSubmit(event){
        event.preventDefault();
        axiosInstance.post('/user/create/', {
                username: this.state.username,
                email: this.state.email,
                password: this.state.password
            }).then(
                result => {
                    window.location.href = "/";
                    console.log(result);
                    return result;
                }
        ).catch (error => {
            console.log(error.stack);
        })

    } //.then is used as otherwise react will assign undefined to headers (hasn't received yet)
    //489 Bad Event - The server did not understand an event package specified in an Event header field.

//                    {this.state.errors.username ? this.state.errors.username : null}
//                    {this.state.errors.email ? this.state.errors.email : null}
//                    {this.state.errors.password ? this.state.errors.password : null}

render() {
    return (
        <div>
            <nav>
                <Link className={"nav-link"} to={"/authentication/"}>Login</Link>
            </nav>
            Signup
            <form onSubmit={this.handleSubmit}>
                <label>
                    Username:
                    <input name="username" type="text" value={this.state.username} onChange={this.handleChange}/>
                </label>
                <label>
                    Email:
                    <input name="email" type="email" value={this.state.email} onChange={this.handleChange}/>
                </label>
                <label>
                    Password:
                    <input name="password" type="password" value={this.state.password} onChange={this.handleChange}/>
                </label>
                <input type="submit" value="Submit"/>
            </form>
        </div>
    )
//above ternery operators aid in error handling
}

}


export default Signup;
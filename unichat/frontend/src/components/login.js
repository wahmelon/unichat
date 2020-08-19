// djsr/frontend/src/components/login.js

import React, { Component } from "react";
import { Link } from "react-router-dom";
import { attemptLogin } from "./attemptlogin";


class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {username: "", password: ""};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    handleSubmit(event){
        event.preventDefault();
        attemptLogin(this.state.username, this.state.password);

    } //.then is used as otherwise react will assign undefined to headers (hasn't received yet)
    //489 Bad Event - The server did not understand an event package specified in an Event header field.

    render() {
        return (
            <div>
            <nav>
                <Link className={"nav-link"} to={"/signup/"}>Signup</Link>
            </nav>
                Login
                <form onSubmit={this.handleSubmit}>
                    <label>
                        Username:
                        <input name="username" type="text" value={this.state.username} onChange={this.handleChange}/>
                    </label>
                    <label>
                        Password:
                        <input name="password" type="password" value={this.state.password} onChange={this.handleChange}/>
                    </label>
                    <input type="submit" value="Submit"/>
                </form>
            </div>
        )
    }
}
export default Login;
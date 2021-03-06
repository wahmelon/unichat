// djsr/frontend/src/components/signup.js
import React, { Component } from "react";
import axiosInstance from "../axiosApi";
import { Link } from "react-router-dom";
import styled from 'styled-components';
import { attemptLogin } from "./utilities";

const remainingHeightForContentView = window.innerHeight - 140; // 140 = remaining rows + gaps


const SignupGrid = styled.div`
  display: grid;
  grid-template-columns:  1fr ;
  grid-template-rows:  50px  ${remainingHeightForContentView}px  50px ;
  gap: 10px 10px;
  grid-template-areas: "menu" "content" "nav";

`;

const SignupMenuDiv = styled.div`
    font-size: 1.5em;
    grid-area: menu;
    background-color: #dfe3ee;
    align-items: center;            
    
`;

const SignupContentDiv = styled.div`
    font-size: 1.5em;
    grid-area: content;
    background-color: #dfe3ee;
    align-items: center;            
    
`;

const SignupNavDiv = styled.div`
    font-size: 1.5em;
    grid-area: nav;
    background-color: #dfe3ee;
    align-items: center;            
    
`;




class Signup extends Component{
    constructor(props){
        super(props);
        this.state = {
            username: "",
            password: "",
            email:"",
            faculty: ""
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
                password: this.state.password,
                faculty: this.state.faculty
            }).then(
                result => {
                    attemptLogin(this.state.username, this.state.password);
                    console.log(result);
                }
        ).catch (error => {
            console.log(error.stack);
        })
        //set up auth checking, if auth - attempt login if not raise alert?

    } //.then is used as otherwise react will assign undefined to headers (hasn't received yet)
    //489 Bad Event - The server did not understand an event package specified in an Event header field.

//                    {this.state.errors.username ? this.state.errors.username : null}
//                    {this.state.errors.email ? this.state.errors.email : null}
//                    {this.state.errors.password ? this.state.errors.password : null}

render() {
    return (
        <SignupGrid>
        <SignupMenuDiv>
        </SignupMenuDiv>
        <SignupContentDiv>
            Signup
            <form onSubmit={this.handleSubmit}>
                <label>
                Alias/Username:
                <input name="username" type="text" value={this.state.username} onChange={this.handleChange}/>
                </label>
                <label>
                Email (supported - UNSW,USYD,ANU,UNIMELB)
                <input name="email" type="email" value={this.state.email} onChange={this.handleChange}/>
                </label>
                <label>
                Password:
                <input name="password" type="password" value={this.state.password} onChange={this.handleChange}/>
                </label>
                <label>
                Faculty:
                <input name="faculty" type="text" value={this.state.faculty} onChange={this.handleChange}/>
                </label>                
                <input type="submit" value="Submit"/>
            </form>
            </SignupContentDiv>
        <SignupNavDiv>
            <Link className={"nav-link"} to={"/authentication/"}>Login</Link>
        </SignupNavDiv>
        </SignupGrid>
    )
//above ternery operators aid in error handling
}

}


export default Signup;
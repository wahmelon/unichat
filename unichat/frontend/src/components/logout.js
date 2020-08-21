
import React, { Component } from "react";
import axiosInstance from "../axiosApi";
import { Link } from "react-router-dom";
import styled from 'styled-components';

const remainingHeightForContentView = window.innerHeight - 140; // 140 = remaining rows + gaps

const LogoutGrid = styled.div`
  display: grid;
  grid-template-columns:  1fr ;
  grid-template-rows:  50px  ${remainingHeightForContentView}px  50px ;
  gap: 10px 10px;
  grid-template-areas: "menu" "content" "nav";

`;

const LogoutMenuDiv = styled.div`
    font-size: 1.5em;
    grid-area: menu;
    background-color: #dfe3ee;
    align-items: center;            
    
`;

const LogoutContentDiv = styled.div`
    font-size: 1.5em;
    grid-area: content;
    background-color: #dfe3ee;
    align-items: center;            
    
`;

const LogoutNavDiv = styled.div`
    font-size: 1.5em;
    grid-area: nav;
    background-color: #dfe3ee;
    align-items: center;            
    
`;


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
            <LogoutGrid>
                <LogoutMenuDiv>
                </LogoutMenuDiv>
                <LogoutContentDiv>
                    Logout
                    <button onClick={this.handleLogout}>
                        Click me!
                    </button>
                </LogoutContentDiv>
                <LogoutNavDiv>
                    <Link className={"nav-link"} to={"/"}>Feed</Link>
                </LogoutNavDiv>
            </LogoutGrid>
        )
    }
}
export default Logout;
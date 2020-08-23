
import React, { Component } from "react";
import axiosInstance from "../axiosApi";
import { Link } from "react-router-dom";
import styled from 'styled-components';
import { setUniInfo } from './Utilities';


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
        this.handleChange = this.handleChange.bind(this);
        this.setUniInfoInComponent  = this.setUniInfoInComponent.bind(this);

        this.state = {
        unit_list: "",
        faculty: ""
    };
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    setUniInfoInComponent(event, unit_list, faculty) { //if not set to local variable there will be async issues
        event.preventDefault();
        setUniInfo(unit_list, faculty)
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
                    Account management
                    <p>Enrolled units (write as 8 alphanumerals separated by comma no spaces):</p>
                    <input name="unit_list" type="text" value={this.state.unit_list} onChange={this.handleChange}/>
                Faculty:
                <input name="faculty" type="text" value={this.state.faculty} onChange={this.handleChange}/>

                    <button onClick={(e) => this.setUniInfoInComponent(e, this.state.unit_list, this.state.faculty)}>
                        Click to submit uni info!
                    </button>
                    Logout
                    <button onClick={this.handleLogout}>
                        Click me to logout!
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
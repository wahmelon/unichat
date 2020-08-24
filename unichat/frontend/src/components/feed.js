import React, { Component } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../axiosApi";
import styled from 'styled-components';
import WebSocketService from './websocket'
import FeedCard from './feedcard';

const remainingHeightForContentView = window.innerHeight - 140; // 140 = remaining rows + gaps

const FeedGrid = styled.div`
  display: grid;
  grid-template-columns:  1fr ;
  grid-template-rows:  50px  ${remainingHeightForContentView}px  50px ;
  gap: 10px 10px;
  grid-template-areas: "menu" "content" "nav";

`;

const FeedMenuDiv = styled.div`
    font-size: 1.5em;
    grid-area: menu;
    background-color: #dfe3ee;
    align-items: center;            

    
`;

const FeedContentDiv = styled.div`
    font-size: 1.5em;
    grid-area: content;
    background-color: #dfe3ee;
    align-items: center;            
    
`;

const FeedNavDiv = styled.div`
    font-size: 1.5em;
    grid-area: nav;
    background-color: #dfe3ee;
    align-items: center;            
    
`;



class Feed extends Component {
    constructor(props){
        super(props);
        this.state = {
        username: "",
        university: "",
        faculty:""

        //need to store messages in state here... as a dictionary? with groups as keys... values also a dictionary with message data....
    };

        this.handleChange = this.handleChange.bind(this);



        //re-write getWebSocketStatus to take in a varying number of groupnames as properties, and based on each spin up a new websocket
        //service class, adding a method bound to feed.js to update the messages in state (via .addCallback())

        //OR?

        // for i in user.unit_codes: instantiate new ws service with property (room_name) as new variable, bind to this (as in chat.js constructor. 
        //needs getwebsocketstatus to be rewritten to take argument of (variable name) to know which ws service to get status of/rebind)
    }

    //finally , add updateMessagesState method and experiment with renderMessages method to read state and group message based on keys


    componentDidMount(){
                axiosInstance.get('/getusergroups/')
        .then(
            result => {
                this.setState({username:result.data.username,university:result.data.university,faculty:result.data.faculty});
            }
        ).catch(error => {throw error;})
        const groups = [this.state.university,this.state.faculty];
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }




    render() {
        return (
            <FeedGrid>
                <FeedMenuDiv>
                </FeedMenuDiv>
                <FeedContentDiv>
                    <FeedCard room_name="UNSW"/>
                </FeedContentDiv>
                <FeedNavDiv>
                    <Link className={"nav-link"} to={"/authentication/"}>Account management</Link>
                </FeedNavDiv>
            </FeedGrid>
        )
    }
}
export default Feed;
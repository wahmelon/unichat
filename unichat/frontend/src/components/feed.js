// djsr/frontend/src/components/login.js

import React, { Component } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../axiosApi";
import styled from 'styled-components';

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
            <FeedGrid>
                <FeedMenuDiv>
                </FeedMenuDiv>
                <FeedContentDiv>
                        <h1>Feed of: {this.state.username}.</h1>
                    <button onClick={this.getMessage}>
                        Click me!
                    </button>
                </FeedContentDiv>
                <FeedNavDiv>
                    <Link className={"nav-link"} to={"/authentication/"}>Logout</Link>
                </FeedNavDiv>
            </FeedGrid>
        )
    }
}
export default Feed;
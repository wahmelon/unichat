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
    constructor(props){
        super(props);
        this.state = {
        username: ""
    };

        this.handleChange = this.handleChange.bind(this);

    }


    componentDidMount(){
                axiosInstance.get('/getusergroups/')
        .then(
            result => {
                this.setState({username:result.data.username})
            }
        ).catch(error => {throw error;})

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
                    <h1>Feed of: {this.state.username}.</h1>
                </FeedContentDiv>
                <FeedNavDiv>
                    <Link className={"nav-link"} to={"/authentication/"}>Account management</Link>
                </FeedNavDiv>
            </FeedGrid>
        )
    }
}
export default Feed;
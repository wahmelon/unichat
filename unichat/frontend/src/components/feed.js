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
    constructor(props){
        super(props);
        this.state = {

        groupArray : [], //university, faculty, enrolled units
        username: "",
        unit_list: "",
        faculty: ""
    };

        this.handleTest = this.handleTest.bind(this);
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

        handleTest(event){
        event.preventDefault();
        axiosInstance.post('/user/set_uni_info/', {
            unit_list: this.state.unit_list,
            faculty: this.state.faculty
        }).then(
                result => {
                    console.log(result)
                    }                
        ).catch (error => {
            console.log(error.stack);
        })

    }






    render() {
        return (
            <FeedGrid>
                <FeedMenuDiv>
                </FeedMenuDiv>
                <FeedContentDiv>
                        <h1>Feed of: {this.state.username}.</h1>




                <p>Enrolled units (write as 8 alphanumerals separated by comma no spaces):</p>
                <input name="unit_list" type="text" value={this.state.unit_list} onChange={this.handleChange}/>
                Faculty:
                <input name="faculty" type="text" value={this.state.faculty} onChange={this.handleChange}/>

                    <button onClick={this.handleTest}>
                        Test Set Uni info!
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
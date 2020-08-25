import React, { Component } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../axiosApi";
import styled from 'styled-components';
import WebSocketService from './websocket'
import FeedCard from './feedcard';
import upvoteIcon from './upvote-icon.jpg';


const remainingWidthForInputView = (window.innerWidth - 56); // 140 = remaining rows + gaps (in feedcard and feed) 56

const remainingHeightForContentView = (window.innerHeight - 160); // 140 = remaining rows + gaps 160
console.log(remainingHeightForContentView);
console.log(remainingWidthForInputView);


const FeedGrid = styled.div`
  display: grid;
  grid-template-columns:  ${remainingWidthForInputView}px 50px ;
  grid-template-rows:  50px  minmax(50px, auto) minmax(${remainingHeightForContentView}px, auto)  50px ;
  gap: 2px 2px;
  grid-template-areas: 

  "menu menu" 
  "input sendbutton" 
  "content content" 
  "nav nav";

`;

const FeedMenuDiv = styled.div`
    font-size: 1.5em;
    grid-area: menu;
    background-color: #dfe3ee;
    align-items: center;            

    
`;

const FeedTopicInputDiv = styled.div`
    font-size: 1.5em;
    grid-area: topicinput;
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


const InputDiv = styled.div`
    font-size: 1.5em;
    grid-area: input;
    background-color: #56FF65;
    align-items: center;            
    
`;

const SendButtonDiv = styled.div`
    font-size: 1.5em;
    grid-area: sendbutton;
    background-color: #56FF65;
    align-items: center;            
    
`;

//make styled divs for input and send button and perhaps an audience input....





class Feed extends Component {
    constructor(props){
        super(props);
        this.state = {
        username: "",
        university: "",
        faculty:"",
        topic_to_be_posted: ""

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
        const remainingHeightForContentView = (window.innerHeight - 160); // 140 = remaining rows + gaps
        const remainingWidthForInputView = (window.innerWidth - 56); // 140 = remaining rows + gaps (in feedcard and feed)


        console.log('height of window', window.innerHeight);
        console.log('computed height for feed page', remainingHeightForContentView);
        console.log('width of window', window.innerWidth);
        console.log('width of input view', remainingWidthForInputView);

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
                <InputDiv>
                    <input 
                    name="topicpost"
                    type="text"                     
                    style=
                    {{
                        "width" : "100%",
                        "height" : "100%",
                        "fontSize" : "20px"
                    }}
                    value={this.state.topic_to_be_posted} 
                    onChange={(e) => this.setState({ topic_to_be_posted: e.target.value })}/>
                </InputDiv>
                <SendButtonDiv>
                    <input 
                    type="image" 
                    src={upvoteIcon}
                    style={{
                        "width" : "100%",
                        "height" : "100%"
                    }}
                    onClick = {
                        (e) => {
                            e.preventDefault();
                            console.log('posted: ', this.state.topic_to_be_posted);

                            this.setState({topic_to_be_posted: ""})
                            //SEND VIA POST AXIOS
                            // WebSocketInstance.sendMessage({
                            //     'type':'chat_message',
                            //     'content': this.state.topic_to_be_posted
                            // });
   
                            // const message = {
                            //     //'type' required for django channels processing - tells channels which method to use to handle

                            //     'type' : 'video_post',
                            //     'ip_origin' : ipAddress,
                            //     'post_time' : Date.now(),
                            //      'youtube_url' : this.state.input,
                            //      'skip_counter' : this.state.skipCounter
                            //     };
                            // console.log(message);
                            // WebSocketInstance.sendMessage(message);
                            // this.setState({input: ''})
                            }
                        }
                    />
                </SendButtonDiv>
                <FeedTopicInputDiv>
                </FeedTopicInputDiv>
                <FeedContentDiv>
                    <FeedCard group_name="UNSW"/>
                </FeedContentDiv>
                <FeedNavDiv>
                    <Link className={"nav-link"} to={"/authentication/"}>Account management</Link>
                </FeedNavDiv>
            </FeedGrid>
        )
    }
}
export default Feed;
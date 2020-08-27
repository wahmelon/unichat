import React, { Component } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../axiosApi";
import styled from 'styled-components';
import WebSocketInstance from './websocket';
import upvoteIcon from './upvote-icon.jpg';

const remainingWidthForContentView = window.innerWidth - 56; // 140 = remaining rows + gaps (in Topic and feed)

const TopicLeafGrid = styled.div`
  display: grid;
  grid-template-columns:  ${remainingWidthForContentView}px 50px ;
  grid-template-rows:  25px minmax(25px, auto) minmax(50px, auto) minmax(50px, auto) 25px;
  gap: 2px 2px;
  grid-template-areas: 
  "UserAndAudience Voting"
  "Topic Voting"
  "Comments Voting"
  "Userinput Voting"
  "Report Voting";

`;

const UserAndAudience = styled.div`
    font-size: 1.5em;
    grid-area: UserAndAudience;
    background-color: #FF8A71;
    align-items: center;            

    
`;

const Content = styled.div`
    font-size: 1.5em;
    grid-area: Topic;
    background-color: #FF8A71;
    align-items: center;            
    
`;

const Comments = styled.div`
    font-size: 1.5em;
    grid-area: Comments;
    background-color: #FF8A71;
    align-items: center;            
    
`;

const Userinput = styled.div`
    font-size: 1.5em;
    grid-area: Userinput;
    background-color: #FF8A71;
    align-items: center;            
    
`;

const Report = styled.div`
    font-size: 1.5em;
    grid-area: Report;
    background-color: #FF8A71;
    align-items: center;            
    
`;

const Voting = styled.div`
    font-size: 1.5em;
    grid-area: Voting;
    background-color: #FF8A71;
    align-items: center;            
    
`;

// TAKES ROOM_NAME as PROP
// ADD CODE TO SWITCH ON AND OFF DEPENDING ON VISIBILITY. FEED SHOULD MAINTAIN A LIST OF WHAT 
//WILL BE RENDERED IN THE FUTURE to preload/start websocket of card about to come into view...

class TopicLeaf extends Component {
    constructor(props){
        super(props);
        this.state = {
        username: "",
        university: "",
        faculty:"",
        upvotes: 0,
        messages: ""

        //need to store messages in state here... as a dictionary? with groups as keys... values also a dictionary with message data....
    };

        WebSocketInstance.connect(this.props.group_name)
        this.handleChange = this.handleChange.bind(this);
        this.getWebSocketStatus(() => {
            WebSocketInstance.addCallback(this.updateMessagesState.bind(this)); //ensures instance is still bound and connected to correct group on reload
            WebSocketInstance.addGroupName(this.props.group_name)
            } 
        );



    }


    //finally , add updateMessagesState method and experiment with renderMessages method to read state and group message based on keys
    getWebSocketStatus(callback) {
        const group_name = this.props.group_name;
        // WebSocketServiceInComponent.connect();
        const component = this;
        setTimeout(function() {
          if (WebSocketInstance.state() === 1) {
            //was (said .state() was not a function)
            //          if (WebSocketService.state() === 1) {
            console.log(`websocket for ${group_name} connected`); //was : WebsocketServiceInComponent.room_name (said not defined)
            callback();
            // WebSocketService.sendMessage({
            //     'type' : 'get_last_20',
            //     'timeid' : Date.now()
            // }); //triggers get_last_20 function on consumer.py which returns 20 messages before timeid
            return;
          } else {
            console.log(`websocket ${group_name} waiting for connection...`);//was : WebsocketServiceInComponent.room_name (said not defined)
            component.getWebSocketStatus(callback);
          }; 
        }, 100);
      };

    // componentDidMount(){
    //         const WebSocketServiceInComponent = new WebSocketService(room_name=this.props.room_name)
    //         WebSocketService.connect();

    //             axiosInstance.get('/getusergroups/')
    //     .then(
    //         result => {
    //             this.setState({username:result.data.username,university:result.data.university,faculty:result.data.faculty});
    //             console.log('Topic',this.state);
    //         }
    //     ).catch(error => {throw error;})
    //     const groups = [this.state.university,this.state.faculty];
    // }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    updateMessagesState(message) {
        console.log(message);
        this.setState({messages : [...this.state.messages, message.content]});
    };




    render() {
        return (
            <TopicLeafGrid>
                <UserAndAudience>
                </UserAndAudience>
                <Content>
                </Content>
                <Comments>
                    Upvotes: {this.state.messages}
                </Comments>
                <Userinput>
                </Userinput>
                <Report>
                </Report>
                <Voting>
                    <input 
                    type="image" 
                    src={upvoteIcon}
                    style={{
                        "width" : "100%"
                    //     "height" : "100%",
                    }}
                    onClick = {
                        (e) => {
                            e.preventDefault();
                            this.setState({upvotes: this.state.upvotes + 1})
                            WebSocketInstance.sendMessage({
                                'type':'chat_message',
                                'content':'test'
                            });
   
                            console.log(this.state.upvotes);
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
                </Voting>
            </TopicLeafGrid>
        )
    }
}
export default TopicLeaf;
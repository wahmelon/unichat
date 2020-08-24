import React, { Component } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../axiosApi";
import styled from 'styled-components';
import WebSocketService from './websocket'

const remainingWidthForContentView = window.innerWidth - 66; // 140 = remaining rows + gaps (in feedcard and feed)

const FeedCardGrid = styled.div`
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

const Topic = styled.div`
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

class FeedCard extends Component {
    constructor(props){
        super(props);
        this.state = {
        username: "",
        university: "",
        faculty:""

        //need to store messages in state here... as a dictionary? with groups as keys... values also a dictionary with message data....
    };
        console.log(this.props);
        const room_name = this.props.room_name;
        console.log(room_name);

        this.handleChange = this.handleChange.bind(this);
        const WebSocketServiceInComponent = new WebSocketService(room_name)
        this.getWebSocketStatus(() => {
            WebSocketServiceInComponent.addCallback(this.updateMessagesState.bind(this))
            }
        );
        WebSocketServiceInComponent.connect();



    }

    //finally , add updateMessagesState method and experiment with renderMessages method to read state and group message based on keys
    getWebSocketStatus(callback) {
        const component = this;
        setTimeout(function() {
          if (WebSocketService.state === 1) {
            //was (said .state() was not a function)
            //          if (WebSocketService.state() === 1) {
            console.log(`websocket ${WebSocketService.room_name} connected`); //was : WebsocketServiceInComponent.room_name (said not defined)
            callback();
            // WebSocketService.sendMessage({
            //     'type' : 'get_last_20',
            //     'timeid' : Date.now()
            // }); //triggers get_last_20 function on consumer.py which returns 20 messages before timeid
            return;
          } else {
            console.log(`websocket ${WebSocketService.room_name}waiting for connection...`);//was : WebsocketServiceInComponent.room_name (said not defined)
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
    //             console.log('feedcard',this.state);
    //         }
    //     ).catch(error => {throw error;})
    //     const groups = [this.state.university,this.state.faculty];
    // }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }




    render() {
        return (
            <FeedCardGrid>
                <UserAndAudience>
                </UserAndAudience>
                <Topic>
                </Topic>
                <Comments>
                </Comments>
                <Userinput>
                </Userinput>
                <Report>
                </Report>
                <Voting>
                </Voting>
            </FeedCardGrid>
        )
    }
}
export default FeedCard;
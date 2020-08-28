import React, { Component } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../axiosApi";
import styled from 'styled-components';
import WebSocketInstance from './websocket';
import upvoteIcon from './upvote-icon.jpg';
import downvoteIcon from './downvoteicon.jpg';
import sendButton from './sendbutton.png';

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
        topic_upvotes: 0,
        topic_downvotes: 0,
        comments: [],
        //USER INPUT
        comment_to_be_posted :""


        //need to store messages in state here... as a dictionary? with groups as keys... values also a dictionary with message data....
    };

        WebSocketInstance.connect(this.props.topic_id)
        this.handleChange = this.handleChange.bind(this);
        this.getWebSocketStatus(() => {
            WebSocketInstance.populateCallbackDictionary(
                {
                    'topic_id' : this.props.topic_id,
                    'update_topic_data' : this.updateTopicDataInState.bind(this)
                    // 'update_comments' : this.updateCommentsInState.bind(this),
                    // 'update_topic_downvotes' : this.updateTopicDownvotesInState.bind(this),
                    // 'update_topic_upvotes' : this.updateTopicUpvotesInState.bind(this)
                }

            );
            // WebSocketInstance.addCommentsCallback(this.updateCommentsInState.bind(this)); //ensures instance is still bound and connected to correct group on reload
            // WebSocketInstance.addUpvoteCallback(this.updateUpvotesInState.bind(this));
            // WebSocketInstance.addDownvoteCallback(this.updateDownvotesInState.bind(this));
            // WebSocketInstance.addGroupName(this.props.topic_id)
            } 
        );



    }


    //finally , add updateMessagesState method and experiment with renderMessages method to read state and group message based on keys
    getWebSocketStatus(callback) {
        const topic_id = this.props.topic_id;
        // WebSocketServiceInComponent.connect();
        const component = this;
        setTimeout(function() {
          if (WebSocketInstance.state() === 1) {
            //was (said .state() was not a function)
            //          if (WebSocketService.state() === 1) {
            console.log(`websocket for ${topic_id} connected`); //was : WebsocketServiceInComponent.room_name (said not defined)
            callback();
            // WebSocketService.sendMessage({
            //     'type' : 'get_last_20',
            //     'timeid' : Date.now()
            // }); //triggers get_last_20 function on consumer.py which returns 20 messages before timeid
            return;
          } else {
            console.log(`websocket ${topic_id} waiting for connection...`);//was : WebsocketServiceInComponent.room_name (said not defined)
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

    updateTopicDataInState(updatedTopic) {
        //need to parse JSON object to dictionary as setState won't accept JSON object
    const final_comment_array_of_dictionaries = [];

    for (const [comment_object_key, comment_object_value] of Object.entries(updatedTopic['comments'])) {
        const temp_comment_dict = {};
        for (const [comment_field_key, comment_field_value] of Object.entries(comment_object_value)) {
            temp_comment_dict[comment_field_key] = comment_field_value
        };
        final_comment_array_of_dictionaries.push(temp_comment_dict);
    };
    console.log(final_comment_array_of_dictionaries);
    console.log(typeof(final_comment_array_of_dictionaries));


        this.setState({
            topic_upvotes: updatedTopic['upvotes'],
            topic_downvotes: updatedTopic['downvotes'],
            // comments: final_comment_array_of_dictionaries //later have a diff function which only adds on new comments? to reduce overhead?

        });
        console.log('updated topic: ', this.state);
    };

    // updateCommentsInState(comment_websocket_message) {
    //     console.log('calling update comments in topicleaf ', comment_websocket_message);
    //     // let withNewComment = [...this.state.comments, comment_websocket_message.content].sort((a,b)=> a['created_time'] - b['created_time']);
    //     this.setState({comments : [...this.state.comments, comment_websocket_message.content]});
    //     // this.setState({comments:withNewComment});
    //     console.log(this.state.comments)
    // };

    // updateTopicDownvotesInState() {
    //     console.log('added downvote');
    //     this.setState({topic_downvotes: this.state.topic_downvotes + 1});
    //     console.log(this.state.topic_downvotes)
    // };

    // updateTopicUpvotesInState() {
    //     console.log('added a vote');
    //     this.setState({topic_upvotes: this.state.topic_upvotes + 1});
    //     console.log(this.state.topic_upvotes)
    // };

    submitTopicUpvote(e) {
        e.preventDefault();
        WebSocketInstance.sendMessage({
            'type':'websocket_message',
            'action':'topic_upvote'
        });
    };

    submitTopicDownvote(e) {
        e.preventDefault();
        WebSocketInstance.sendMessage({
            'type':'websocket_message',
            'action':'topic_downvote'
        });
    };

    submitComment(e) {
        e.preventDefault();
        WebSocketInstance.sendMessage({
            'type' : 'websocket_message',
            'action' : 'comment',
            'content' : this.state.comment_to_be_posted,
            'poster' : this.props.username,
            'topic_owner' : this.props.topic_id,
            'created_time' : Date.now()
        });
        this.setState({comment_to_be_posted: ""});
        console.log(this.state.comment_to_be_posted)
    }


    render() {
        return (
            <TopicLeafGrid>
                <UserAndAudience>
                </UserAndAudience>
                <Content>
                </Content>
                <Comments>
                    {this.state.comments}
                </Comments>
                <Userinput>
                    <input 
                        name="comment_to_be_posted"
                        placeholder="Write comment here"
                        type="text"                     
                        style=
                        {{
                            "width" : "80%",
                            "height" : "50%",
                            "fontSize" : "20px"
                        }}
                        value={this.state.comment_to_be_posted} 
                        onChange={(e) => this.setState({ comment_to_be_posted: e.target.value })}/>
                        <input 
                        type="image" 
                        src={sendButton}
                        style={{
                            "width" : "10%"
                            // "height" : "100%"
                        }}
                        onClick = {(e) => this.submitComment(e)}                        
                        />

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
                    onClick = {(e) => this.submitTopicUpvote(e)}                        
                    />

                     <input 
                    type="image" 
                    src={downvoteIcon}
                    style={{
                        "width" : "100%"
                    //     "height" : "100%",
                    }}
                    onClick = {(e)=>this.submitTopicDownvote(e)}                        
                    />
                </Voting>
            </TopicLeafGrid>
        )
    }
}
export default TopicLeaf;
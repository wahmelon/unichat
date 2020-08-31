import React, { Component } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../axiosApi";
import styled from 'styled-components';
import WebSocketInstance from './websocket'
import TopicLeaf from './TopicLeaf';
import sendButton from './sendbutton.png';


const remainingWidthForInputView = (window.innerWidth - 56); // 140 = remaining rows + gaps (in Topic and feed) 56

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
        topic_id_list:[],
        user_id: "",
        group_codes_and_ids : [],

        //USER INPUT
        topic_to_be_posted: "",
        audience: ""

        //need to store messages in state here... as a dictionary? with groups as keys... values also a dictionary with message data....
    };

        this.callbackDictionaryPopulatedFromTopicLeafsForWebsocketCallbackDictionary = {}


        this.handleChange = this.handleChange.bind(this);
        this.sendWithFeedWebsocket = this.sendWithFeedWebsocket.bind(this);
        this.populateFeedCallbackDictionary = this.populateFeedCallbackDictionary.bind(this);
        
        this.getWebSocketStatus(() => {
            WebSocketInstance.populateCallbackDictionary(this.callbackDictionaryPopulatedFromTopicLeafsForWebsocketCallbackDictionary);
            } 
        );



        //re-write getWebSocketStatus to take in a varying number of groupnames as properties, and based on each spin up a new websocket
        //service class, adding a method bound to feed.js to update the messages in state (via .addCallback())

        //OR?

        // for i in user.unit_codes: instantiate new ws service with property (room_name) as new variable, bind to this (as in chat.js constructor. 
        //needs getwebsocketstatus to be rewritten to take argument of (variable name) to know which ws service to get status of/rebind)
    }

    //finally , add updateMessagesState method and experiment with renderMessages method to read state and group message based on keys




    // this.getWebSocketStatus(() => {
    //     WebSocketInstance.populateCallbackDictionary(
    //         {
    //             this.callbackDictionaryPopulatedFromTopicLeafsForWebsocketCallbackDictionary
    //         }

    //     );
    //     // WebSocketInstance.addCommentsCallback(this.updateCommentsInState.bind(this)); //ensures instance is still bound and connected to correct group on reload
    //     // WebSocketInstance.addUpvoteCallback(this.updateUpvotesInState.bind(this));
    //     // WebSocketInstance.addDownvoteCallback(this.updateDownvotesInState.bind(this));
    //     // WebSocketInstance.addGroupName(this.props.topic_id)
    //     } 
    // );

    getWebSocketStatus(callback) {
        const user_id = this.state.user_id;
        // WebSocketServiceInComponent.connect();
        const component = this;
        setTimeout(function() {
          if (WebSocketInstance.state() === 1) {
            //was (said .state() was not a function)
            //          if (WebSocketService.state() === 1) {
            console.log(`websocket for ${user_id} connected`); //was : WebsocketServiceInComponent.room_name (said not defined)
            callback();
            // WebSocketService.sendMessage({
            //     'type' : 'get_last_20',
            //     'timeid' : Date.now()
            // }); //triggers get_last_20 function on consumer.py which returns 20 messages before timeid
            return;
          } else {
            console.log(`websocket ${user_id} waiting for connection...`);//was : WebsocketServiceInComponent.room_name (said not defined)
            component.getWebSocketStatus(callback);
          }; 
        }, 100);
      };


    populateFeedCallbackDictionary(dictionaryFromTopicLeaf) {
        if (this.callbackDictionaryPopulatedFromTopicLeafsForWebsocketCallbackDictionary) {
          var old_dict = this.callbackDictionaryPopulatedFromTopicLeafsForWebsocketCallbackDictionary,
          new_addition = dictionaryFromTopicLeaf,
          new_dict = Object.assign({}, old_dict, new_addition);
          this.callbackDictionaryPopulatedFromTopicLeafsForWebsocketCallbackDictionary = new_dict;
          console.log('updated callback dict: ', this.callbackDictionaryPopulatedFromTopicLeafsForWebsocketCallbackDictionary);
        } else {
            console.log(dictionaryFromTopicLeaf);
          this.callbackDictionaryPopulatedFromTopicLeafsForWebsocketCallbackDictionary = dictionaryFromTopicLeaf;
          console.log('updated callback dict: ', this.callbackDictionaryPopulatedFromTopicLeafsForWebsocketCallbackDictionary);
        }
    }

    sendWithFeedWebsocket(message) {
        WebSocketInstance.sendMessage(message);

    }

    componentDidMount(){
        const remainingHeightForContentView = (window.innerHeight - 160); // 140 = remaining rows + gaps
        const remainingWidthForInputView = (window.innerWidth - 56); // 140 = remaining rows + gaps (in Topic and feed)
        axiosInstance.get('/getusergroups/')
        .then(
            result => {
                this.setState({
                    username:result.data.username,
                    university:result.data.university,
                    faculty:result.data.faculty,
                    group_codes_and_ids : result.data.GroupCodesAndIds,
                    user_id : result.data.user_id
                });
                console.log('about to call connect websocket to: ', this.state.user_id);

                WebSocketInstance.connect(this.state.user_id);

                console.log('group codes and ids in CDM: ', this.state);
            }
        ).catch(error => {throw error;})
    };

    handleChange(event) {

        this.setState({[event.target.name]: event.target.value});
    }

    // renderTopics(topicIdArray) {
    //     <TopicLeaf topic_id="5" username = {this.state.username}/>
    // }

    renderTopics = (groupCodesAndTheirTopicIds) => {
        const final_topic_array = []
        //sort comment array by comment.created_time (ascending)
        for (const group of groupCodesAndTheirTopicIds) {
            const group_id = group['group_code'];
            const topic_id_array = group['ids'];
            for (const id of topic_id_array) {
                final_topic_array.push(
                <li key={id}>
                    <TopicLeaf 
                    topic_id={id} 
                    username = {this.state.username}
                    group_code = {group_id}
                    sendWithFeedWebsocket = {this.sendWithFeedWebsocket}
                    populateFeedCallbackDictionary = {this.populateFeedCallbackDictionary}
                    />
                </li>
                )
            };


        };
        return final_topic_array;
        console.log('final topic array: ', final_topic_array);
    };






    render() {
        return (
            <FeedGrid>
                <FeedMenuDiv>
                </FeedMenuDiv>
                <InputDiv>
                    <input 
                    name="topicpost"
                    placeholder="What's on your mind?"
                    type="text"                     
                    style=
                    {{
                        "width" : "100%",
                        "height" : "50%",
                        "fontSize" : "20px"
                    }}
                    value={this.state.topic_to_be_posted} 
                    onChange={(e) => this.setState({ topic_to_be_posted: e.target.value })}/>
                    <input 
                    name="audience"
                    placeholder="Input group code"
                    type="text"                     
                    style=
                    {{
                        "width" : "100%",
                        "height" : "50%",
                        "fontSize" : "20px"
                    }}
                    value={this.state.audience} 
                    onChange={(e) => this.setState({ audience: e.target.value })}/>
                </InputDiv>
                <SendButtonDiv>
                    <input 
                    type="image" 
                    src={sendButton}
                    style={{
                        "width" : "100%",
                        "height" : "100%"
                    }}
                    onClick = {
                        (e) => {
                            e.preventDefault();
                            console.log('test')
                            console.log(Date.now())
                            console.log(typeof(Date.now()))
                            axiosInstance.post('/user/post_topic/',
                            {
                            topic_to_be_posted: this.state.topic_to_be_posted,
                            created_time: Date.now(),
                            audience: this.state.audience
                            }
                            ).then(
                            result => {console.log(result)}
                            ).catch (error => {console.log(error.stack)})
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
                    <ul>
                    {this.renderTopics(this.state.group_codes_and_ids)}
                    </ul>
                </FeedContentDiv>
                <FeedNavDiv>
                    <Link className={"nav-link"} to={"/authentication/"}>Account management for {this.state.username}</Link>
                </FeedNavDiv>
            </FeedGrid>
        )
    }
}
export default Feed;
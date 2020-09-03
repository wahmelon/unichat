import React, { Component } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../axiosApi";
import styled from 'styled-components';
import WebSocketInstance from './websocket'
import TopicLeaf from './TopicLeaf';
import sendButton from './sendbutton.png';
import loudspeakerimage from './loudspeakerimage.png';
import upvoteIcon from './upvote-icon.jpg';
import * as jwt_decode from 'jwt-decode';



const remainingWidthForInputView = (window.innerWidth - 56); // 140 = remaining rows + gaps (in Topic and feed) 56

const remainingHeightForContentView = (window.innerHeight - 160); // 140 = remaining rows + gaps 160
console.log(remainingHeightForContentView);
console.log(remainingWidthForInputView);


const FeedGrid = styled.div`
  display: grid;
  grid-template-columns:  ${window.innerWidth};
  grid-template-rows:  50px  minmax(50px, auto) minmax(${remainingHeightForContentView}px, auto)  50px ;
  gap: 2px 2px;
  grid-template-areas: 

  "menu" 
  "input" 
  "content" 
  "nav";

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

//below to be inside input div, beneath text area, toggled based on input area focused or not
const InputDetailGrid = styled.div` 
    display: grid;
    grid-template-columns: ${(window.innerWidth - 58)/2}px 50px ${(window.innerWidth - 58)/2}px;
    grid-template-rows:  15px 50px  15px 50px 15px ;
    gap: 2px 2px;
    grid-template-areas: 

    "spaceone spaceone spaceone" 
    "identitytoggle loudspeaker audiencetoggle" 
    "spacetwo spacetwo spacetwo" 
    "postbutton postbutton postbutton" 
    "spacethree spacethree spacethree"
`;
const IdentityToggleDiv = styled.div`
    font-size: 1.5em;
    grid-area: identitytoggle;
    background-color: #ECABFE;
    align-items: center;            
    
`;

const LoudspeakerDiv = styled.div`
    font-size: 1.5em;
    grid-area: loudspeaker;
    background-color: #ECABFE;
    align-items: center;            
    
`;

const AudienceToggleDiv = styled.div`
    font-size: 1.5em;
    grid-area: audiencetoggle;
    background-color: #ECABFE;
    align-items: center;            
    
`;

const SpaceAreaOneDiv = styled.div`
    font-size: 1.5em;
    grid-area: spaceone;
    background-color: #ECABFE;
    align-items: center;            
    
`;

const SpaceAreaDiv = styled.div`
    font-size: 1.5em;
    grid-area: spacetwo;
    background-color: #ECABFE;
    align-items: center;            
    
`;

const SpaceAreaThreeDiv = styled.div`
    font-size: 1.5em;
    grid-area: spacethree;
    background-color: #ECABFE;
    align-items: center;            
    
`;

const PostButtonDiv = styled.div`
    font-size: 1.5em;
    grid-area: postbutton;
    background-color: #ECABFE;
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
        user_id: "",
        topic_data : [],
        current_toggled_index_of_group_code_array: 0,
        user_groups:[],
        anonymous_user_handle : "",
        currently_anonymous: true,
        postAreaOn:false,
        topic_notification_data_store:[],
        


        //USER INPUT
        topic_to_be_posted: "",
        audience: "" //toggle



        //need to store messages in state here... as a dictionary? with groups as keys... values also a dictionary with message data....
    };

        this.handleChange = this.handleChange.bind(this);
        this.sendWithFeedWebsocket = this.sendWithFeedWebsocket.bind(this);
        this.populateFeedCallbackDictionary = this.populateFeedCallbackDictionary.bind(this);
        this.iterateThroughGroupCodes = this.iterateThroughGroupCodes.bind(this);
        this.toggleIdentity = this.toggleIdentity.bind(this);
        this.handleNewTopic = this.handleNewTopic.bind(this);
        this.transitionNotificationsToFeed = this.transitionNotificationsToFeed.bind(this);

        this.callbackDictionaryPopulatedFromTopicLeafsForWebsocketCallbackDictionary = {
            'add_new_topic' : this.handleNewTopic
        }
    }


    getWebSocketStatus(callback) {
        const user_id = this.state.user_id;
        // WebSocketServiceInComponent.connect();
        const component = this;
        setTimeout(function() {
          if (WebSocketInstance.state() === 1) {
            //was (said .state() was not a function)
            //          if (WebSocketService.state() === 1) {
            console.log(`websocket connected`); //was : WebsocketServiceInComponent.room_name (said not defined)
            callback();
            // WebSocketService.sendMessage({
            //     'type' : 'get_last_20',
            //     'timeid' : Date.now()
            // }); //triggers get_last_20 function on consumer.py which returns 20 messages before timeid
            return;
          } else {
            console.log(`websocket waiting for connection...`);//was : WebsocketServiceInComponent.room_name (said not defined)
            component.getWebSocketStatus(callback);
          }; 
        }, 100);
      };

    handleNewTopic(new_topic) { // totally new items vs under existing group code forces rerender
 

        if (new_topic['user_id'] == this.state.user_id) {
            const topic_data_array = this.state.topic_data;
            const new_topic_dict = {'id' : new_topic['topic_id'],'created_time':[new_topic['created_time']]};
            topic_data_array.push(new_topic_dict);
            this.setState({topic_data:topic_data_array});

        } else {
            const notif_data_array = this.state.topic_notification_data_store;
            const new_topic_dict = {'id' : new_topic['topic_id'],'created_time':[new_topic['created_time']]};
            notif_data_array.push(new_topic_dict);
            this.setState({topic_notification_data_store:notif_data_array})
        }
    }


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
    };

    sendWithFeedWebsocket(message) {
        WebSocketInstance.sendMessage(message);
    };

    componentDidMount(){
        axiosInstance.get('/getusergroups/')
        .then(
            result => {
                this.setState({
                    username:result.data.username,
                    university:result.data.university,
                    faculty:result.data.faculty,
                    topic_data : result.data.topic_data,
                    user_id : result.data.user_id,
                    user_groups : result.data.user_groups,
                    anonymous_user_handle : 'Anon from ' + result.data.university
                });

                console.log('axios updated state: ', this.state);
            }
        ).catch(error => {throw error})

        const accessToken = localStorage.getItem('access_token')
        const decodedToken = jwt_decode(accessToken);
        WebSocketInstance.connect(decodedToken.user_id);
        this.getWebSocketStatus(() => {
            WebSocketInstance.populateCallbackDictionary(this.callbackDictionaryPopulatedFromTopicLeafsForWebsocketCallbackDictionary);
            } 
        );
    };


    handleChange(event) {

        this.setState({[event.target.name]: event.target.value});
    };

    iterateThroughGroupCodes() {
        const current_index = this.state.current_toggled_index_of_group_code_array
        const max_possible_index = (this.state.user_groups.length - 1)
        if (current_index != max_possible_index) { //starting, haven't reached the max possible index
            this.setState({current_toggled_index_of_group_code_array : current_index + 1})
        } else { //reached max possible index, start from first index
            this.setState({current_toggled_index_of_group_code_array : 0 })
        }                            
    };

    toggleIdentity() {
        if (this.state.currently_anonymous) {
            this.setState({currently_anonymous:false})
        } else {
            this.setState({currently_anonymous:true})
        }
    };

    transitionNotificationsToFeed(){
        const array_for_render = this.state.topic_data
        for (const topic of this.state.topic_notification_data_store) {
            array_for_render.push(topic) // totally new items vs under existing group code forces rerender
        }
        this.setState({topic_notification_data_store:[]})
    };



    renderTopics = (topic_data_array) => {
        topic_data_array.sort(function(a,b) {
            return b['created_time'] - a['created_time'];
        })
        const array_of_rendered_topics = [];
        for (const topic of topic_data_array) {
                array_of_rendered_topics.push(
                <ul key={topic['id']}
                    style={{ 
                        listStyleType: "none",
                        margin : "0",
                        padding: "0"
                    }}>
                    <TopicLeaf
                    topic_id={topic['id']}
                    anonymous_user_handle = {this.state.anonymous_user_handle} 
                    username = {this.state.username}
                    sendWithFeedWebsocket = {this.sendWithFeedWebsocket}
                    populateFeedCallbackDictionary = {this.populateFeedCallbackDictionary}
                    />
                </ul>
                )


        };
        return array_of_rendered_topics;
    };

    render() {
        return (
            <FeedGrid>
                <FeedMenuDiv>
                    <button 
                    style={{
                        width: "20%",
                        height: "100%",                 
                        backgroundColor: "#ddd",
                        border: "none",
                        color: "black",
                        textAlign: "center",
                        textDecoration: "none",
                        display: "inline-block",
                        outline : "none",
                        // padding :"1px",
                        // margin: "1px 1px",
                        cursor: "pointer",
                        borderRadius: "16px"
                        }}
                    onClick = {(e) => this.transitionNotificationsToFeed()}
                    >
                      {this.state.topic_notification_data_store.length}!
                    </button>
                </FeedMenuDiv>
                <InputDiv>
                    <textarea 
                    name="topicpost"
                    ref="postInput"
                    placeholder="What's on your mind?"
                    type="text"                     
                    style=
                    {{  
                        boxSizing : "border-box",
                        width : "90%",
                        height : "50%",
                        borderRadius : "1em",
                        fontSize : "20px",
                        outline : "none",
                        border : "1px solid #000"
                    }}
                    onChange={(e) => this.setState({ topic_to_be_posted: e.target.value })}
                    onFocus = {(e) => this.setState({postAreaOn:true})}
                    >
                    {this.state.topic_to_be_posted} 
                    </textarea>
                    <input 
                    type="image" 
                    src={upvoteIcon}
                    style={{
                        "width" : "10%",
                        "height" : "100%",
                        outline : "none"

                    //     "height" : "100%",
                    }}
                    onClick = {(e) => this.setState({postAreaOn:false})}                        
                    />

                    {this.state.postAreaOn &&
                    <InputDetailGrid>
                        <SpaceAreaOneDiv>
                        </SpaceAreaOneDiv>
                        <IdentityToggleDiv>
                            <button 
                                style={{
                                    width: "100%",
                                    height: "100%",                 
                                    backgroundColor: "#ddd",
                                    border: "none",
                                    color: "black",
                                    textAlign: "center",
                                    textDecoration: "none",
                                    display: "inline-block",
                                    outline : "none",
                                    // padding :"1px",
                                    // margin: "1px 1px",
                                    cursor: "pointer",
                                    borderRadius: "16px"
                                    }}
                                onClick = {(e) => this.toggleIdentity()}
                                >
                                  {this.state.currently_anonymous ? this.state.anonymous_user_handle : this.state.username}
                            </button>
                        </IdentityToggleDiv>
                        <LoudspeakerDiv>
                            <img src={loudspeakerimage}
                                style={{
                                    width: "100%",
                                    maxHeight: "100%"
                                }}
                            />
                        </LoudspeakerDiv>
                        <AudienceToggleDiv>
                            <button 
                            style={{
                                width: "100%",
                                height: "100%",
                                backgroundColor: "#ddd",
                                border: "none",
                                outline : "none",
                                color: "black",
                                textAlign: "center",
                                textDecoration: "none",
                                display: "inline-block",
                                // padding :"1px",
                                // margin: "1px 1px",
                                cursor: "pointer",
                                borderRadius: "16px"
                                }}
                            onClick = {(e) => this.iterateThroughGroupCodes()}
                            >
                            {this.state.user_groups[this.state.current_toggled_index_of_group_code_array]}
                            </button>
                        </AudienceToggleDiv>
                        <SpaceAreaDiv>
                        </SpaceAreaDiv>
                        <PostButtonDiv>
                            <button 
                            style={{
                                width: "100%",
                                height: "100%",    
                                backgroundColor: "#ddd",
                                border: "none",
                                outline : "none",
                                color: "black",
                                textAlign: "center",
                                textDecoration: "none",
                                display: "inline-block",
                                // padding :"1px",
                                // margin: "1px 1px",
                                cursor: "pointer",
                                borderRadius: "16px"
                            }}
                            onClick = {
                                (e) => {
                                    e.preventDefault();
                                    if (this.state.topic_to_be_posted) {
                                        const message = {
                                            'type' : 'websocket_message',
                                            'action' : 'add_topic',
                                            'content' : this.state.topic_to_be_posted,
                                            'user_id' : this.state.user_id,
                                            "created_time" : Date.now(),
                                            "group_code" : this.state.user_groups[this.state.current_toggled_index_of_group_code_array],
                                            "posted_as_anonymous" : this.state.currently_anonymous
                                        };
                                        WebSocketInstance.sendMessage(message);
                                        console.log('posted topic');

                                        this.setState({topic_to_be_posted:""});
                                    } else {
                                        console.log('topic not posted');

                                        //pass
                                    }
                                }
                            }
                            >
                            Post
                            </button>
                        </PostButtonDiv>
                        <SpaceAreaThreeDiv>
                        </SpaceAreaThreeDiv>
                    </InputDetailGrid>
                    }
                </InputDiv>

                <FeedContentDiv>
                    <ul style={{ 
                        listStyleType: "none",
                        margin : "0",
                        padding: "0"
                    }}
                    >
                    {this.renderTopics(this.state.topic_data)}
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
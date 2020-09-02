import React, { Component } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../axiosApi";
import styled from 'styled-components';
import WebSocketInstance from './websocket'
import TopicLeaf from './TopicLeaf';
import sendButton from './sendbutton.png';
import loudspeakerimage from './loudspeakerimage.png';
import upvoteIcon from './upvote-icon.jpg';



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
        topic_id_list:[],
        user_id: "",
        group_codes_and_ids : [],
        current_toggled_index_of_group_code_array: 0,
        anonymous_user_handle : "",
        currently_anonymous: true,
        postAreaOn:false,
        audience: "",
        topic_notification_data_store:[],
        


        //USER INPUT
        topic_to_be_posted: ""


        //need to store messages in state here... as a dictionary? with groups as keys... values also a dictionary with message data....
    };

        this.callbackDictionaryPopulatedFromTopicLeafsForWebsocketCallbackDictionary = {
            'add_new_topic' : this.handleNewTopic
        }


        this.handleChange = this.handleChange.bind(this);
        this.sendWithFeedWebsocket = this.sendWithFeedWebsocket.bind(this);
        this.populateFeedCallbackDictionary = this.populateFeedCallbackDictionary.bind(this);
        this.iterateThroughGroupCodes = this.iterateThroughGroupCodes.bind(this);
        this.toggleIdentity = this.toggleIdentity.bind(this);
        this.handleNewTopic = this.handleNewTopic.bind(this);
        this.prepareNewTopicsForRender = this.prepareNewTopicsForRender.bind(this);
    }


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

    handleNewTopic(new_topic) { // totally new items vs under existing group code forces rerender
        if (new_topic['user_id'] == this.state.user_id) {
            const group_codes_array = this.state.group_codes_and_ids;
            const new_topic_dict = {'group_code' : new_topic['group_code'],'ids':[new_topic['topic_id']]};
            group_codes_array.push(new_topic_dict);
            this.setState({group_codes_and_ids:group_codes_array});
        } else {
            const notif_data_array = this.state.topic_notification_data_store;
            const new_topic_dict = {'group_code' : new_topic['group_code'],'ids':[new_topic['topic_id']]};
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

    getGroupCodesAndStartWebSocket() {
        axiosInstance.get('/getusergroups/')
        .then(
            result => {
                this.setState({
                    username:result.data.username,
                    university:result.data.university,
                    faculty:result.data.faculty,
                    group_codes_and_ids : result.data.GroupCodesAndIds,
                    user_id : result.data.user_id,
                    anonymous_user_handle : 'Anon from ' + result.data.university
                });
                console.log('about to call connect websocket to: ', this.state.user_id);

                WebSocketInstance.connect(this.state.user_id);
                this.getWebSocketStatus(() => {
                    WebSocketInstance.populateCallbackDictionary(this.callbackDictionaryPopulatedFromTopicLeafsForWebsocketCallbackDictionary);
                    } 
                );

                console.log('group codes and ids in CDM: ', this.state);
            }
        ).catch(error => {throw error;})
    }

    componentDidMount(){
        this.getGroupCodesAndStartWebSocket();
        // const remainingHeightForContentView = (window.innerHeight - 160); // 140 = remaining rows + gaps
        // const remainingWidthForInputView = (window.innerWidth - 56); // 140 = remaining rows + gaps (in Topic and feed)
        
        // const ReactDOM = require('react-dom')
        // if ( document.activeElement === ReactDOM.findDOMNode(this.refs.postInput) ) {
        //     this.setState({postAreaOn:true})
        //     console.log('toggled post area to true');
        // }



    };


    handleChange(event) {

        this.setState({[event.target.name]: event.target.value});
    };

    // renderTopics(topicIdArray) {
    //     <TopicLeaf topic_id="5" username = {this.state.username}/>
    // }

    iterateThroughGroupCodes() {
    //repeatedly iterating through group_codes_and_their_ids
        const current_index = this.state.current_toggled_index_of_group_code_array
        const max_possible_index = (this.state.group_codes_and_ids.length - 1)
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

    prepareNewTopicsForRender(){
        const array_for_render = this.state.group_codes_and_their_ids
        for (item of this.state.topic_notification_data_store) {
            array_for_render.push(item) // totally new items vs under existing group code forces rerender
        }
        this.setState({topic_notification_data_store:[]})
    };



    renderTopics = (groupCodesAndTheirTopicIds) => {
        const final_topic_array = []
        //sort comment array by comment.created_time (ascending)
        for (const group of groupCodesAndTheirTopicIds) {
            const group_id = group['group_code'];
            const topic_id_array = group['ids'];
            for (const id of topic_id_array) {
                final_topic_array.push(
                <ul key={id}
                    style={{ 
                        listStyleType: "none",
                        margin : "0",
                        padding: "0"
                    }}>
                    <TopicLeaf
                    topic_id={id} 
                    username = {this.state.username}
                    group_code = {group_id}
                    sendWithFeedWebsocket = {this.sendWithFeedWebsocket}
                    populateFeedCallbackDictionary = {this.populateFeedCallbackDictionary}
                    />
                </ul>
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
                    onClick = {(e) => this.prepareNewTopicsForRender()}
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
                            {this.state.group_codes_and_ids[this.state.current_toggled_index_of_group_code_array]['group_code']}
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
                                    console.log('post button pressed')
                                    if (this.state.topic_to_be_posted) {
                                        const message = {
                                            'type' : 'websocket_message',
                                            'action' : 'add_topic',
                                            'content' : this.state.topic_to_be_posted,
                                            'user_id' : this.state.user_id,
                                            "created_time" : Date.now(),
                                            "group_code" : this.state.group_codes_and_ids[this.state.current_toggled_index_of_group_code_array]['group_code'],
                                            "posted_as_anonymous" : this.state.currently_anonymous
                                        };
                                        WebSocketInstance.sendMessage(message);
                                        this.setState({topic_to_be_posted:""});
                                    } else {
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
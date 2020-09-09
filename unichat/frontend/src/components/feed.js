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
import InfiniteScroll from 'react-infinite-scroller';
import MenuListComposition from './menulist';



const remainingWidthForInputView = (window.innerWidth - 56); // 140 = remaining rows + gaps (in Topic and feed) 56

const remainingHeightForContentView = (window.innerHeight - 160); // 140 = remaining rows + gaps 160


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
        notification_data_store:[],
        new_topics:[],
        notifications_as_text:[],

        //infinite scroll
        hasMoreItems : true,
        functionCallTracker:1, //multiplier for loadMoreTopics - specifies which 10 topics should be returned
        


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
        this.transitionNotificationToFeed = this.transitionNotificationToFeed.bind(this);
        this.handleNotification = this.handleNotification.bind(this);

        this.callbackDictionaryPopulatedFromTopicLeafsForWebsocketCallbackDictionary = {
            'add_new_topic' : this.handleNewTopic,
            'new_notification' : this.handleNotification
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



///////////////////////////////////////////////////////////




    handleNewTopic(new_topic) { // totally new items vs under existing group code forces rerender
    //for spinner up top to load new topics

        if (new_topic['user_id'] == this.state.user_id) {
            const topic_data_array = this.state.topic_data;
            const new_topic_dict = {'id' : new_topic['topic_id'],'created_time':new_topic['created_time']};
            topic_data_array.push(new_topic_dict);
            this.setState({topic_data:topic_data_array});

        } else {
            const topics_data_array = this.state.new_topics;
            const new_topic_dict = {'id' : new_topic['topic_id'],'created_time':new_topic['created_time']};
            topics_data_array.push(new_topic_dict);
            this.setState({new_topics:topics_data_array})
        }
    };

    handleNotification(parsedData) { // create a notification whenever websocket reaceives msg, also can be used in initial componentdidmount get recent notifs
        console.log('running handlenotif in feedjs');
        console.log('parsed data followers', parsedData.followers);
        if (parsedData.followers.includes(this.state.user_id)) {
            console.log('running handleNotification');
            const new_notif = {
                'topic_id' : parsedData.topic_id,
                'action_type' : parsedData.action,
                'action_value' : 1,
                'action_time' : parsedData.time,
                'last_actor' : parsedData.logged_user_id, //the person who submitted the action
                'og_topic_owner' : parsedData.og_topic_poster

            }

            if (parsedData.comment_id) { //concerns a comment
                new_notif['comment_id'] = parsedData.comment_id
                new_notif['og_comment_owner'] = parsedData.og_comment_poster
            };


            const new_array = this.state.notification_data_store;
            new_array.push(new_notif);
            this.setState({notification_data_store:new_array})
            console.log('notif data store in state', this.state.notification_data_store);
        } else {
            //pass
        }
    };


    groupNotificationsTogether(notif_array, type_as_string) { //type is eitther 'topic' or 'comment'
        console.log('groupNotificationsTogether param array: ', notif_array);

        const array_of_groups = [];
        for (const notif of notif_array) {
            const grouped_notification = [];
            const current_id = notif[`${type_as_string}_id`]
            for (const item of notif_array) {
                if (current_id == notif[`${type_as_string}_id`]) {
                    grouped_notification.push(item)
                    notif_array.splice(notif_array.indexOf(item),1) //removes so doesn't have to be processed next loop
                }
            }
            array_of_groups.push(grouped_notification)
        }
        console.log('produced array of groups in groupNotificationsTogether: ', array_of_groups);
        return array_of_groups;
    }

    notificationToText(grouped_array, type_as_string, user_owns_as_boolean) { //type is eitther 'topic' or 'comment'   // for the menulist component
        console.log('notificationToText  grouped_array: ', grouped_array);

        const final_text_based_array = [];

        var variable1;
        var variable2;
        var variable3;
        var variable4;

        for (const group of grouped_array) {
            const text_dict = {
                'action_type' : [],
                'action_time' : 0,
            }
            if (type_as_string == 'comment') {
                text_dict['comment_id'] = group[0]['comment_id']
            } else {
                text_dict['topic_id'] = group[0]['topic_id']
            }
            for (const individual_notif of group) {
                text_dict['action_type'].push(individual_notif['action_type'])
                text_dict['action_value'] += individual_notif['action_value']
                if (individual_notif['action_time'] > text_dict['action_time']) {
                    text_dict['action_time'] = individual_notif['action_time']
                    text_dict['last_actor'] = individual_notif['last_actor']
                } 
            }

            if (text_dict['action_value'] = 1) {
                 variable1 = 'has'
            } else { variable1 = `and ${action_value - 1} have`}

            if (text_dict['action_type'].includes('vote') && text_dict['action_type'].includes('comment')) { //must concern both
                 variable2 = 'commented and voted'
            } else if (text_dict['action_type'].includes('comment')) { //must be only mentioning comments
                 variable2 = 'commented'
            } else { //must be only mentioning votes
                 variable2 = 'voted'
            } 

            if (user_owns_as_boolean) {
                 variable3 = 'your'
            } else {
                if (type_as_string == 'comment') {
                 variable3 = `${group[0]['og_comment_owner']}'s`
                } else {
                     variable3 = `${group[0]['og_topic_owner']}'s`
                }
            } 

            if (type_as_string == 'topic') {
                 variable4 = 'topic'
            } else { //concernts comment
                 variable4 = 'comment'
            } 


            const message = `${text_dict['last_actor']} ${variable1} ${variable2} on ${variable3} ${variable4}`
            final_text_based_array.push({'topic_id' : group[0]['topic_id'], 'message' : message })

        }
        const new_array = this.state.notifications_as_text;
        for (const item of final_text_based_array) {
        new_array.push(item)
        }
        this.setState({notifications_as_text:new_array})
        console.log('text notifications in state: ', this.state.notifications_as_text)

    } 

    transformRawNotifications() { // transforming raw array into user-specific notifications for the drop down menu
        console.log('running transformraw');
        const raw_array = this.state.notification_data_store;
        console.log('this.state.notification data store: ', this.state.notification_data_store);
        const text_array = [];
        const user_is_topic_owner_array = [];
        const user_is_comment_owner_array = [];
        const user_is_not_owner_array = [];
        for (const notif of raw_array) {
            if (this.state.user_id == notif['og_topic_owner']) {
                user_is_topic_owner_array.push(notif);
            } else if (this.state.user_id == notif['og_comment_owner']) {
                user_is_comment_owner_array.push(notif);
            } else if (notif['action_type'] == 'add_comment') { //if user is following but neither owner of topic or comment the only notifs they 
                //receive shouldbe additional comments
                user_is_not_owner_array.push(notif);
            }

        };
        console.log('user id: ', this.state.user_id);
        console.log('user_is_topic_owner_array: ', user_is_topic_owner_array);
        console.log('user_is_comment_owner_array: ', user_is_comment_owner_array);
        console.log('user_is_not_owner_array: ', user_is_not_owner_array);


        if (user_is_topic_owner_array[0]) {
            const grouped_array = this.groupNotificationsTogether(user_is_topic_owner_array, 'topic')
            const text_array = this.notificationToText(grouped_array, 'topic', true);//boolean is ownership of something
            console.log(text_array);

        }
           if (user_is_comment_owner_array[0]) {
            const grouped_array = this.groupNotificationsTogether(user_is_topic_owner_array, 'comment')
            const text_array = this.notificationToText(grouped_array, 'comment', true);//boolean is ownership of something 
            console.log(text_array);

        }
           if (user_is_not_owner_array[0]) {
            const grouped_array = this.groupNotificationsTogether(user_is_not_owner_array, 'comment') //user should be alertd of only extra comments
            const text_array = this.notificationToText(grouped_array, 'comment', false); //boolean is ownership of something
            console.log(text_array);

        }

    };

    /// write render method for menulist, get onclick working... also write the api for get more notifications (GET REQUEST)


    transitionNotificationToFeed(event){ //for clicking on a notification in drop down notification list, which will add the related topic to the top of the feed
        const new_topic_array = this.state.topic_data
        new_topic_array.push(event.topic) //somehow append topic data in correct format. will create a duplicate but removeDuplicatesByID should remove in render msg
        //have an extra field for render method to indicate that topic has been reloaded out of the proper chron sorted order? ... extra field needs to be handled by render msg
        //displayed time should be original topic creation, time in render should be time the topic was last replaced in feed.......? 
        this.setState({topic_data:new_topic_array}) //triggers re-render
        new_notification_array = this.state.notification_data_store
        const notification_array_without_justrendered_topic = new_notification_array.filter(topic => topic.id != event.topic.id);
        this.setState({notification_data_store:notification_array_without_justrendered_topic})
    };

    getNotifications() { // get most recent notification_items created, probably while user was away....
        axiosInstance.get('/getnotifications/')
        .then(
            result => {
                this.setState({
                    notification_data_store:result.data.notification_array
                });

                console.log('axios updated state: ', this.state);
            }
        ).catch(error => {throw error})
    }





////////////////////////////////////////////




    populateFeedCallbackDictionary(dictionaryFromTopicLeaf) {
        if (this.callbackDictionaryPopulatedFromTopicLeafsForWebsocketCallbackDictionary) {
          var old_dict = this.callbackDictionaryPopulatedFromTopicLeafsForWebsocketCallbackDictionary,
          new_addition = dictionaryFromTopicLeaf,
          new_dict = Object.assign({}, old_dict, new_addition);
          this.callbackDictionaryPopulatedFromTopicLeafsForWebsocketCallbackDictionary = new_dict;
          WebSocketInstance.populateCallbackDictionary(this.callbackDictionaryPopulatedFromTopicLeafsForWebsocketCallbackDictionary)
        } else {
          this.callbackDictionaryPopulatedFromTopicLeafsForWebsocketCallbackDictionary = dictionaryFromTopicLeaf;
          WebSocketInstance.populateCallbackDictionary(this.callbackDictionaryPopulatedFromTopicLeafsForWebsocketCallbackDictionary)
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



    loadMoreTopics(page) { //interacts with infinite scroll
        var self = this;
        axiosInstance.post('/getmoretopics/', {page:this.state.functionCallTracker})
        .then(
            result => {
                const topics_array = this.state.topic_data;
                if (result.data.topic_data) {
                    for (const topic of result.data.topic_data) {
                        topics_array.push(topic)
                        }
                    };

                this.setState({topic_data:topics_array});
                const timesFunctionCalled = this.state.functionCallTracker;
                this.setState({functionCallTracker:timesFunctionCalled+1});
                // if (topics_array.length < 10) {
                if (result.data.topic_data.length < 10) { //before 10

                    console.log('no more topics to be loaded (loadItems)');
                    this.setState({hasMoreItems:false});
                    }
                }
                ).catch(error => {throw error})    
        };

    removeDuplicatesByID(array) { //required in relation to infinite scroll
      let cloned_array = array.slice(); // You can define the comparing function here. 
      // JS by default uses a crappy string compare.
      // (we use slice to clone the array so the
      // original array won't be modified)
      let results = [];
      for (let i = 0; i < cloned_array.length; i++) { //used to be cloned_array.length -1
        if (!cloned_array[i+1] || cloned_array[i + 1].id != cloned_array[i].id ) { // or cloned_array[i+1] is undefined, reached the end 
          results.push(cloned_array[i]);
        }
      }
      return results;
    }


    renderTopics = (topic_array) => {
        const topic_data_array = this.removeDuplicatesByID(topic_array); //required due to infinite scroll component
        //somehow creating multiple topic components ...

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
                    user_id = {this.state.user_id}
                    sendWithFeedWebsocket = {this.sendWithFeedWebsocket}
                    populateFeedCallbackDictionary = {this.populateFeedCallbackDictionary}
                    />
                </ul>
                )


        };
        return array_of_rendered_topics;
    };

    render() {

        const loader = <div className="loader" key={1000000}>Loading ...</div>;

        return (
            <FeedGrid>
                <FeedMenuDiv>
                    <MenuListComposition 
                    >
                    </MenuListComposition>
                    <button 
                    style={{
                        width: "20%",
                        height: "20%",                 
                        backgroundColor: "#ddd",
                        border: "none",
                        color: "black",
                        textAlign: "center",
                        textDecoration: "none",
                        outline : "none",
                        // padding :"1px",
                        // margin: "1px 1px",
                        cursor: "pointer",
                        borderRadius: "16px"
                        }}
                    onClick = {(e) => this.transformRawNotifications()}
                    >
                      {this.state.notification_data_store.length}!
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
                                        console.log('posted');
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
        <InfiniteScroll
                    pageStart={0}
                    loadMore={this.loadMoreTopics.bind(this)}
                    hasMore={this.state.hasMoreItems}
                    loader={loader}>
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
        </InfiniteScroll>
                <FeedNavDiv>
                    <Link className={"nav-link"} to={"/authentication/"}>Account management for {this.state.username}</Link>
                </FeedNavDiv>
            </FeedGrid>
        )
    }
}
export default Feed;
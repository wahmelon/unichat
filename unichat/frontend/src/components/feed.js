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
        if (parsedData.followers.includes(this.state.user_id)) {
            console.log('running handleNotification');
            const new_notif = {
                'action_type' : parsedData.action,
                'action_value' : 1,
                'action_time' : parsedData.time,
                'last_actor' : parsedData.last_actor, //the person who submitted the action
                'parent_topic_id' : parsedData.topic_id
            };

            if (parsedData.action == 'add_comment' || parsedData.action == 'topic_upvote' || parsedData.action == 'topic_downvote') { //concerns a topic
                new_notif['topic_id'] = parsedData.topic_id,
                new_notif['og_topic_owner'] = parsedData.og_topic_poster
            } else if (this.state.user_id == parsedData.og_comment_poster) {
            //remaining actions (comment up/downvotes) only relevant to comment owner
                new_notif['comment_id'] = parsedData.comment_id
                new_notif['og_comment_owner'] = parsedData.og_comment_poster
            } else {
                //pass
            };


            const new_array = this.state.notification_data_store;
            new_array.push(new_notif);
            this.setState({notification_data_store:new_array})
            console.log('notif data store in state', this.state.notification_data_store);
        } else { //user is in group notif intended for but not following
            //pass
        }
    };

    transformNotifications(notif_array) {
        const output_array = [];
        for (const notif of notif_array) {
            var idToFind;
            var TopicNotifDoesNotExist = true;
            if (notif.topic_id) { //concerns topic (add comment, topic up/downvote)
                idToFind = notif.topic_id;
                for (var i in output_array) {
                    if (output_array[i].topic_id == idToFind) { //notification already exists
                        TopicNotifDoesNotExist = false;
                        //modify existing notification
                        if (notif.og_topic_owner == this.state.user_id) {
                            output_array[i].number_of_actions ++;
                            if (!output_array[i].action_array.includes(notif.action_type)) {
                                output_array[i].action_array.push(notif.action_type);
                            }
                            if (output_array[i].action_time < notif.action_time) {
                                output_array[i].action_time = notif.action_time;
                                output_array[i].last_actor = notif.last_actor;
                            }
                        } else if (notif.action_type == 'add_comment') { //add comment only notif relevant if not topic owner
                            output_array[i].number_of_actions ++;
                            if (output_array[i].action_time < notif.action_time) {
                                output_array[i].action_time = notif.action_time;
                                output_array[i].last_actor = notif.last_actor;
                            }
                        } else {
                            //pass
                        }
                        //modification (adding action and action value) dependent on ownership of topic 
                    }
                }

                if (TopicNotifDoesNotExist) {
                    //create notification for easy transform to text in render menulist
                    // topic votes only matter if you are topic owner. if topic owner, add three actions, if not , only add add comments
                    if (notif.og_topic_owner == this.state.user_id) {
                        output_array.push({
                            'topic_id' : notif.topic_id,
                            'action_array' : [notif.action_type],
                            'number_of_actions':1,
                            'action_time':notif.action_time,
                            'last_actor' : notif.last_actor,
                            'user_owns' : true,
                            'parent_topic_id' : notif.parent_topic_id

                        });
                    } else if (notif.action_type == 'add_comment') { 
                    //^ 'add_comment' is the only one of three actions relevant if not topic owner
                        output_array.push({
                            'topic_id' : notif.topic_id,
                            'action_array' : [notif.action_type],
                            'number_of_actions':1,
                            'action_time':notif.action_time,
                            'last_actor' : notif.last_actor,
                            'user_owns' : false,
                            'parent_topic_id' : notif.parent_topic_id

                        });
                    } else{
                        //pass
                    }
                }

            } else { //concerns comment (comment up/downvote)
                var idToFind = notif.comment_id; 
                var CommentNotifDoesNotExist = true;
                for (var i in output_array) {
                    if (output_array[i].comment_id == idToFind) { //notification already exists
                        CommentNotifDoesNotExist = false;
                        if (notif.og_comment_owner == this.state.user_id) {
                            output_array[i].number_of_actions ++;                            
                            if (!output_array[i].action_array.includes(notif.action_type)) {
                                output_array[i].action_array.push(notif.action_type);
                            }
                            if (output_array[i].action_time < notif.action_time) {
                                output_array[i].action_time = notif.action_time;
                                output_array[i].last_actor = notif.last_actor;
                            }
                        } else {
                            //pass , comment up/downvotes not relevant to anyone except comment owner
                        }
                    }
                }
                if (CommentNotifDoesNotExist) {
                    output_array.push({
                            'comment_id' : notif.comment_id,
                            'action_array' : [notif.action_type],
                            'number_of_actions':1,
                            'action_time':notif.action_time,
                            'last_actor' : notif.last_actor,
                            'user_owns' : true, //has to be true to get past initial parsedData -> notification item
                            'parent_topic_id' : notif.parent_topic_id

                        });
                    //create notification for easy transform to text in render menulist
                }

            }
        }
        console.log(output_array);
        console.log(this.groupedNotificationsToText(output_array));
    };

    groupedNotificationsToText(grouped_array) {
        const output_array = [];

        for (notification of grouped_array) {
            var actors;
            var action_types;
            var owner;
            var item;

            // setting actors

            if (notification.number_of_actions == 1) {
                actors = `${notification.last_actor} has`;
            } else if (notification.number_of_actions == 2) {
                actors = `${notification.last_actor} and 1 other user have`;
            } else {
                actors = `${notification.last_actor} and ${notification.number_of_actions - 1} other users have`;
            };

            //setting actions

            if (notification.action_array.includes('comment_upvote') || notification.action_array.includes('comment_downvote')) {
                action_types = 'voted on'
            } else if (

                (notification.action_array.includes('topic_upvote') || notification.action_array.includes('topic_downvote'))
                && notification.action_array.includes('add_comment')

            ) {
                
                action_types = 'commented and voted on'

            } else if (notification.action_array.includes('topic_upvote') || notification.action_array.includes('topic_downvote')) { //only topic votes
                    action_types = 'voted on'
            } else {
                action_types = 'commented on'
            }

            //setting owner

            if (notification.user_owns) {
                owner = 'your'
            } else {
                if (notification.comment_id) {
                    owner = `${notification.og_comment_owner}'s`
                } else { //must concern topic...
                    owner = `${notification.og_topic_owner}'s`
                }
            }

            //setting item

            if (notification.comment_id) {
                item = 'comment'
            } else {
                item = 'topic'
            }

            const final_message = `${actors} ${action_types} ${owner} ${item}`
            console.log(notification);
            console.log(final_message);
            output_array.push({
                'topic_id' : notification.parent_topic_id,
                'text' : final_message
            })

        }

        console.log(output_array);

    };











    //combine the three methods, with different dict to text rules for relating to owned topic, owned comment, and everything else..


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
            } else { variable1 = `and ${action_value - 1} have`} //if only 2, one other  otherwise two others.. etc

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
        console.log('this.state.notification data store (raw_array): ', raw_array);
        const text_array = [];
        const user_is_topic_owner_array = [];
        const user_is_comment_owner_array = [];
        const user_is_not_owner_array = [];
        for (const notif of raw_array) {
            if (this.state.user_id == notif['og_topic_owner']) {
                console.log('yes to test');
                user_is_topic_owner_array.push(notif);
                user_is_topic_owner_array.push('test_item 2');
                console.log('topic owner: ', user_is_topic_owner_array);
            };
            if (this.state.user_id == notif['og_comment_owner']) {
                user_is_comment_owner_array.push(notif);
                user_is_comment_owner_array.push('test_item');
                console.log('comment owner: ', user_is_comment_owner_array);
            };
            if (notif['action_type'] == 'add_comment') { //if user is following but neither owner of topic or comment the only notifs they 
                //receive shouldbe additional comments
                user_is_not_owner_array.push(notif);
                user_is_not_owner_array.push('test item 3');
                console.log('other following: ', user_is_not_owner_array);
            };

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
                    onClick = {(e) => this.transformNotifications(this.state.notification_data_store)}
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
import axiosInstance from "../axiosApi";
import * as jwt_decode from 'jwt-decode';


class WebSocketService {

  callbackDictionary = {};

  static instance = null;

  static getInstance() {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }


  constructor() {
    this.socketRef = null;
    
  }

  // getPath(user_id) {
  //   if (!user_id) {
  //     axiosInstance.get('/getusergroups/')
  //       .then(
  //           result => {
  //             console.log('user_id from feed.js bad, called got path for: ', result.data.user_id);
  //             return `ws://127.0.0.1:8000/ws/chat/${result.data.user_id}/`
  //           }
  //       ).catch(error => {throw error;})
  //     } else {
  //       console.log('user_id from feed.js good, passing default path');
  //       return `ws://127.0.0.1:8000/ws/chat/${user_id}/`

  //     }
  //   };

  getPath() {
    const accessToken = localStorage.getItem('access_token')
    const decodedToken = jwt_decode(accessToken);
    const currentUserId = decodedToken.user_id;
    return `ws://127.0.0.1:8000/ws/chat/${currentUserId}/` //dev django server
  }

  connect(user_id) {


    this.socketRef = new WebSocket(this.getPath()) 

    this.socketRef.onopen = () => {
      console.log('Websocket open');
    };
    this.socketRef.onmessage = e => {
      const parsedData = JSON.parse(e.data);
      console.log('websocket: ', parsedData);
      console.log('parsedData action: ', parsedData.action);

      if(parsedData.action != 'add_topic') { // no notif handling for add topic
        console.log('running!!');
        this.callbackDictionary['new_notification'](parsedData);

      };
      // this.callbackDictionary['update_topic_data'](updatedTopic);
      // console.log(parsedData);
      try {

          if (parsedData['action'] === 'add_comment') {
            this.callbackDictionary[`add_comment_to_${parsedData['topic_id']}`](parsedData);
            

          } else if (parsedData['action'] === 'topic_upvote') {
            this.callbackDictionary[`update_topic_upvote_to_${parsedData['topic_id']}`]();
            

          } else if (parsedData['action'] === 'topic_downvote') {
            this.callbackDictionary[`update_topic_downvote_to_${parsedData['topic_id']}`]();
            


          } else if (parsedData['action'] === 'comment_upvote' || parsedData['action'] === 'comment_downvote') {
            this.callbackDictionary[`update_comment_to_${parsedData['topic_id']}`](parsedData);


          } else if (parsedData['action'] === 'add_topic') {
            this.callbackDictionary['add_new_topic'](parsedData);
          } else {
            //pass
          }
      } catch(err) {
        console.log('error running callbackdict functions: ', err);
      }
      //shouldn't run if dictionary hasn't been populated successfully
      //updateMessagesInStateCallback is populated in the component that imports the WS instance
    };
    this.socketRef.onerror = e => {
      console.log(e.message);
    };
    this.socketRef.onclose = () => {
      console.log('WebSocket closed lets reopen');
      this.connect();
    };    

  }

  disconnect() {
    this.socketRef.close();
  }

 //below takes in a dictionary as message argument
  sendMessage(message) {
    try {
      this.socketRef.send(JSON.stringify({ ...message}));
    } catch (err) {
      console.log(err.message);
    }
  }

  state() {
    return this.socketRef.readyState;
  }

  populateCallbackDictionary(dictionary) {
    this.callbackDictionary = dictionary;

    // if (this.callbackDictionary) {
    //   var old_dict = this.callbackDictionary,
    //   new_addition = dictionary,
    //   new_dict = Object.assign({}, old_dict, new_addition);
    //   this.callbackDictionary = new_dict;
    //   console.log('updated callback dict: ', this.callbackDictionary);
    // } else {
    //   this.callbackDictionary = new_dict;
    //   console.log('updated callback dict: ', this.callbackDictionary);
    // }
  };

  // addGroupName(topic_id) {
  //   this.callbackDictionary['topic_id'] = topic_id;
  //   console.log(this.callbackDictionary);
  // }; 

  // addCommentsCallback(command) {
  //   this.callbackDictionary['update_comments'] = command;
  //   console.log(this.callbackDictionary);
  // };

  // addUpvoteCallback(command) {
  //   this.callbackDictionary['update_upvotes'] = command;
  //   console.log(this.callbackDictionary);
  // };

  // addDownvoteCallback(command) {
  //   this.callbackDictionary['update_downvotes'] = command;
  //   console.log(this.callbackDictionary);
  // };




};

const WebSocketInstance = WebSocketService.getInstance();


export default WebSocketInstance;

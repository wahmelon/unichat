import axiosInstance from "../axiosApi";

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

  getPath(user_id) {
    if (!user_id) {
      axiosInstance.get('/getusergroups/')
        .then(
            result => {
              console.log('user_id from feed.js bad, called got path for: ', result.data.user_id);
              return `ws://127.0.0.1:8000/ws/chat/${result.data.user_id}/`
            }
        ).catch(error => {throw error;})
      } else {
        console.log('user_id from feed.js good, passing default path');
        return `ws://127.0.0.1:8000/ws/chat/${user_id}/`

      }
    };

  connect(user_id) {


    // this.socketRef = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${user_id}/`) //dev django server

    this.socketRef = new WebSocket(this.getPath(user_id));



    this.socketRef.onopen = () => {
      console.log('Websocket open');
    };
    this.socketRef.onmessage = e => {
      const parsedData = JSON.parse(e.data);
      console.log(parsedData);

      // this.callbackDictionary['update_topic_data'](updatedTopic);
      // console.log(parsedData);
      if (parsedData['action'] === 'add_comment') {
        this.callbackDictionary[`add_comment_to_${parsedData['topic_id']}`](parsedData);
        return
      } else if (parsedData['action'] === 'topic_upvote') {
        const topic_id_in_data = parsedData['topic_id'];
        const function_name = `update_topic_upvote_to_${topic_id_in_data}`;
        console.log(function_name);
        this.callbackDictionary[function_name]();
        return
      } else if (parsedData['action'] === 'topic_downvote') {
        this.callbackDictionary[`update_topic_downvote_to_${parsedData['topic_id']}`]();
        return
      } else if (parsedData['action'] === 'comment_upvote' || parsedData['action'] === 'comment_downvote') {
        console.log(`update_comment_to_${parsedData['comment_id']}`);
        this.callbackDictionary[`update_comment_to_${parsedData['topic_id']}`](parsedData);
      } else if (parsedData['action'] === 'add_topic') {
        console.log(`update_comment_to_${parsedData['comment_id']}`);
        this.callbackDictionary['add_new_topic'](parsedData);
      } else {
        //pass
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
    console.log('before population CBD: ', this.callbackDictionary);
    this.callbackDictionary = dictionary;
    console.log('populated callbackDictionary: ', this.callbackDictionary);

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

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

  connect(topic_id) {

    const path = `ws://127.0.0.1:8000/ws/chat/${this.callbackDictionary.topic_id}/`
    //dev django server
    this.socketRef = new WebSocket(path);

    this.socketRef.onopen = () => {
      console.log(`WebSocket for ${this.callbackDictionary.topic_id} open`);
    };
    this.socketRef.onmessage = e => {
      const data = e.data;
      const parsedData = JSON.parse(data);
      if (parsedData.action === 'comment' ) {
        this.callbackDictionary['update_comments'](parsedData);
      } else if (parsedData.action === 'upvote') {
        this.callbackDictionary['update_upvotes']();
      } else if (parsedData.action === 'downvote') {
        this.callbackDictionary['update_downvotes']();
      } else {
        console.log('no action found in websocket message')
      }
      //shouldn't run if dictionary hasn't been populated successfully
      //updateMessagesInStateCallback is populated in the component that imports the WS instance
    };
    this.socketRef.onerror = e => {
      console.log(e.message);
    };
    this.socketRef.onclose = () => {
      console.log(`WebSocket for ${this.callbackDictionary.topic_id} closed let's reopen`);
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
    console.log(this.callbackDictionary)
  }

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

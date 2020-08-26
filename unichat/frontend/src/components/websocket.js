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

  connect(group_name) {

    const path = `ws://127.0.0.1:8000/ws/chat/${this.callbackDictionary.group_name}/`
    //dev django server
    this.socketRef = new WebSocket(path);

    this.socketRef.onopen = () => {
      console.log(`WebSocket for ${this.callbackDictionary.group_name} open`);
    };
    this.socketRef.onmessage = e => {
      const data = e.data;
      const parsedData = JSON.parse(data);
      this.callbackDictionary['command'](parsedData);
      //shouldn't run if dictionary hasn't been populated successfully
      //updateMessagesInStateCallback is populated in the component that imports the WS instance
    };
    this.socketRef.onerror = e => {
      console.log(e.message);
    };
    this.socketRef.onclose = () => {
      console.log(`WebSocket for ${this.callbackDictionary.group_name} closed let's reopen`);
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

  addCallback(command) {
    this.callbackDictionary['command'] = command;
    console.log(this.callbackDictionary);
  }

  addGroupName(group_name) {
    this.callbackDictionary['group_name'] = group_name;
    console.log(this.callbackDictionary);
  }



};

const WebSocketInstance = WebSocketService.getInstance();


export default WebSocketInstance;

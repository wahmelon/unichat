import React, { Component} from "react";
import { Switch, Route, Link } from "react-router-dom";
import Login from "./login";
import Signup from "./signup";
import Logout from "./logout";
import Feed from "./feed";

class App extends Component {

	state = {

		isAuthenticated : false, //default value
	}

	componentDidMount(){
		console.log("running componentDidMount")
		if (localStorage.getItem('access_token')){
			this.setState({isAuthenticated: true})
		}
	}


    render() {
        return (
	        <Switch>
	            <Route exact path={"/authentication/"} component={this.state.isAuthenticated ? Logout : Login}/>
	            <Route exact path={"/signup/"} component={Signup}/>
	            <Route exact path={"/"} component={this.state.isAuthenticated ? Feed : Login}/> 
	        </Switch>
        );
    }
}

//homepage will be either Feed or login depending if user is already logged in

export default App;
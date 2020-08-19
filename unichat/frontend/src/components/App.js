import React, { Component} from "react";
import { Switch, Route, Link } from "react-router-dom";
import Login from "./login";
import Signup from "./signup";
import Hello from "./hello";
import Logout from "./logout";
import Authentication from "./authentication";
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
            <div className="site">
            <h1> Authentication state: {this.state.isAuthenticated ? " logged in." : " not logged in."}</h1>
                <nav>
                    <Link className={"nav-link"} to={"/feed/"}>Feed</Link>
                    <Link className={"nav-link"} to={"/login/"}>Login</Link>
                    <Link className={"nav-link"} to={"/signup/"}>Signup</Link>
					<Link className={"nav-link"} to={"/hello/"}>Hello</Link>
					<Link className={"nav-link"} to={"/logout/"}>Logout</Link>



                </nav>
                <main>
                    <Switch>
                        <Route exact path={"/login/"} component={Login}/>
                        <Route exact path={"/signup/"} component={Signup}/>
                        <Route exact path={"/hello/"} component={Hello}/>
                        <Route exact path={"/logout/"} component={Logout}/>
                        <Route exact path={"/feed/"} component={Feed}/>
                        <Route exact path={"/"} component={this.state.isAuthenticated ? Feed : Login}/> 
                    </Switch>
                </main>
            </div>
        );
    }
}

//homepage will be either Feed or login depending if user is already logged in

export default App;
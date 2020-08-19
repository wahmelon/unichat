// djsr/frontend/src/components/login.js

import React, { Component } from "react";
import { Link } from "react-router-dom";


class Feed extends Component {
    constructor(props) {
        super(props);
        this.state = {};

    }


    render() {
        return (
            <div>
                <nav>
                    <Link className={"nav-link"} to={"/authentication/"}>Logout</Link>
                </nav>
            Feed
            </div>
        )
    }
}
export default Feed;
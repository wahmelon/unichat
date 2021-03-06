import React, { Component } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../axiosApi";
import styled from 'styled-components';
import WebSocketInstance from './websocket';
import upvoteIcon from './upvote-icon.jpg';
import downvoteIcon from './downvoteicon.jpg';
import sendButton from './sendbutton.png';
import collapseIcon from './collapseIcon.png';


//material ui stuff

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Typography from '@material-ui/core/Typography';

const remainingWidthForContentView = window.innerWidth - 56; // 140 = remaining rows + gaps (in Topic and feed)

const TopicLeafGrid = styled.div`
  display: grid;
  grid-template-columns:  ${remainingWidthForContentView}px 50px ;
  grid-template-rows:  25px minmax(25px, auto) minmax(50px, auto) minmax(50px, auto) 25px;
  //gap: 2px 2px;
  grid-template-areas: 
  "UserAndAudience Voting"
  "Topic Voting"
  "Comments Voting"
  "Userinput Voting"
  "Report Voting";

`;

const UserAndAudience = styled.div`
    font-size: 20px;
    grid-area: UserAndAudience;
    background-color: #FF8A71;
    align-items: center;

    
`;

const Content = styled.div`
    font-size: 30px;
    grid-area: Topic;
    background-color: #FF8A71;
    align-items: center;            
    
`;

const Comments = styled.div`
    font-size: 1.5em;
    grid-area: Comments;
    background-color: #FF8A71;
    
`;

const Userinput = styled.div`
    font-size: 1.5em;
    grid-area: Userinput;
    background-color: #FF8A71;
    align-items: center;            
    
`;

const Report = styled.div`
    font-size: 20px;
    grid-area: Report;
    background-color: #FF8A71;
    align-items: center;            
    
`;

const Voting = styled.div`
    font-size: 15px;
    grid-area: Voting;
    background-color: #FF8A71;
    align-items: center;            
    
`;

const CommentGrid = styled.div`
  display: grid;
  grid-template-columns:  1fr 25px ;
  grid-template-rows:  25px minmax(50px, auto);
  grid-template-areas: 
  "CommentContent CommentVoting"
  "CommentContent CommentVoting"
`;

const CommentContent = styled.div`
    grid-area : CommentContent;
    background-color : #41FEF2;
`

const CommentVoting = styled.div`
    grid-area : CommentVoting;
    background-color : #41FEF2;
`

// TAKES ROOM_NAME as PROP
// ADD CODE TO SWITCH ON AND OFF DEPENDING ON VISIBILITY. FEED SHOULD MAINTAIN A LIST OF WHAT 
//WILL BE RENDERED IN THE FUTURE to preload/start websocket of card about to come into view...

class TopicLeaf extends Component {
    constructor(props){
        super(props);
        this.state = {
        logged_user_id : "",
        topic_poster : "",
        topic_content : "",
        topic_title: "",
        topic_audience: "",
        topic_created_time: 0,
        topic_upvotes: 0,
        topic_downvotes: 0,
        comments: [],
        posted_as_anonymous: true,
        //USER INPUT
        comment_to_be_posted :"",
        //TOGGLE COMMENTS
        comments_collapsed:true
    };



        this.handleChange = this.handleChange.bind(this);
        const add_comment_command_name = `add_comment_to_${this.props.topic_id}`;
        const update_topic_downvote_command_name = `update_topic_downvote_to_${this.props.topic_id}`;
        const update_topic_upvote_command_name = `update_topic_upvotes_to_${this.props.topic_id}`;
        const update_comment_command_name = `update_comment_to_${this.props.topic_id}`;

        this.tempCallbackDict = {};
        this.tempCallbackDict[`add_comment_to_${this.props.topic_id}`] = this.addCommentInState.bind(this);
        this.tempCallbackDict[`update_topic_upvote_to_${this.props.topic_id}`] = this.updateTopicUpvotesInState.bind(this);
        this.tempCallbackDict[`update_topic_downvote_to_${this.props.topic_id}`] = this.updateTopicDownvotesInState.bind(this);
        this.tempCallbackDict[`update_comment_to_${this.props.topic_id}`] = this.updateCommentInState.bind(this);
        this.props.populateFeedCallbackDictionary(this.tempCallbackDict);


    };

    componentDidMount(){
        this.setState({logged_user_id:this.props.user_id})
        axiosInstance.post('/get_topic_data/', {topic_id : this.props.topic_id})
        .then(
            result => {
                this.setState({
                    topic_content : result.data.topic_data.content,
                    topic_poster : result.data.topic_data.poster,
                    posted_as_anonymous : result.data.topic_data.posted_as_anonymous,
                    topic_title : result.data.topic_data.content,
                    topic_audience : result.data.topic_data.audience,
                    topic_created_time : result.data.topic_data.created_time,
                    topic_upvotes : result.data.topic_data.upvotes,
                    topic_downvotes : result.data.topic_data.downvotes,
                    comments : result.data.topic_data.comments,  
                });
                console.log('topicleaf comment array: ', this.state.comments);

            }
        ).catch(error => {throw error;})
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    };

    updateCommentInState(updatedComment) {

        const oldComment = this.state.comments.find(comment => comment.comment_id === updatedComment['comment_id'])
        const clonedCommentsInState = this.state.comments.slice(); 
        clonedCommentsInState.splice(this.state.comments.indexOf(oldComment), 1, updatedComment); //takes out old comment and adds updatedComment
        this.setState({comments : clonedCommentsInState});
    };


    addCommentInState(newComment) {
        console.log('add comment in state - new comment: ', newComment);
        console.log('calling update comments in topicleaf ', newComment);
        if (newComment.time) {
            const time_created = newComment.time; //there is a discrepancy between model record of comment and how consumer sends it
            // (created_time on model) which is how the render method in topicleaf reads it and (time) which is how websocket sends it.
            newComment.created_time = time_created;
        };
        // let withNewComment = [...this.state.comments, comment_websocket_message.content].sort((a,b)=> a['created_time'] - b['created_time']);
        this.setState({comments : [...this.state.comments, newComment]});
        //spread operator ... is fully necessary to create a shallow clone - new version of the entire array so that javascript will rerender all properties of 
        //the comments in case not new object but new properties altered on existing objects (eg. upvoted existing comment)
        // this.setState({comments:withNewComment});
        console.log(this.state.comments)
    };

    updateTopicDownvotesInState() {
        console.log('added downvote');
        this.setState({topic_downvotes: this.state.topic_downvotes + 1});
        console.log(this.state.topic_downvotes)
    };

    updateTopicUpvotesInState() {
        console.log('added a vote');
        this.setState({topic_upvotes: this.state.topic_upvotes + 1});
        console.log(this.state.topic_upvotes)
    };

    submitTopicUpvote(e) {
        e.preventDefault();
        this.props.sendWithFeedWebsocket({
            'logged_user_id' : this.state.logged_user_id,
            'type':'websocket_message',
            'action':'topic_upvote',
            'group_code' : this.state.topic_audience,
            'topic_id' :  this.props.topic_id,
            'time' : Date.now()           
        });
    };

    submitTopicDownvote(e) {
        e.preventDefault();
        this.props.sendWithFeedWebsocket({
            'logged_user_id' : this.state.logged_user_id,
            'type':'websocket_message',
            'action':'topic_downvote',
            'group_code' : this.state.topic_audience,
            'topic_id' :  this.props.topic_id,
            'time' : Date.now()
        });
    };

    submitCommentDownvote(e, comment_id) {
        e.preventDefault();
        this.props.sendWithFeedWebsocket({
            'logged_user_id' : this.state.logged_user_id,
            'type':'websocket_message',
            'action':'comment_downvote',
            'group_code' :  this.state.topic_audience,
            'topic_id' :  this.props.topic_id,
            'comment_id' : comment_id,
            'time' : Date.now()

        });
    };

    submitCommentUpvote(e, comment_id) {
        e.preventDefault();
        this.props.sendWithFeedWebsocket({
            'logged_user_id' : this.state.logged_user_id,
            'type':'websocket_message',
            'action':'comment_upvote',
            'group_code' :  this.state.topic_audience,
            'topic_id' :  this.props.topic_id,            
            'comment_id' : comment_id,
            'time' : Date.now()
        });
    };




    submitComment(e) {
        e.preventDefault();
        if (this.state.comment_to_be_posted) {
        this.props.sendWithFeedWebsocket({
            'logged_user_id' : this.state.logged_user_id,
            'type' : 'websocket_message',
            'action' : 'add_comment',
            'content' : this.state.comment_to_be_posted,
            'poster' : this.props.username,
            'topic_id' : this.props.topic_id,
            'group_code' : this.state.topic_audience,
            'time' : Date.now()
        });
        this.setState({comment_to_be_posted: ""});
        console.log(this.state.comment_to_be_posted)
        } else {
            //pass
        };
    };

//     renderComments = (commentArray) => {
//         commentArray.sort(function(a,b) {
//             return a['created_time'] - b['created_time']; //comments are rendered with more recent ones at the bottom
//         })
//         //sort comment array by comment.created_time (ascending)
// 
//         const array_of_comments = [];
//         for (const comment of commentArray) {
//             var date = new Date(comment['created_time']);
//             const timeInString = date.toLocaleString();
//           array_of_comments.push(
//              <Card className={classes.root}>
//                   <CardContent>
//                     <Typography className={classes.title} color="textSecondary" gutterBottom>
//                       {timeInString}
//                     </Typography>
//                     <Typography className={classes.pos} color="textSecondary">
//                       {comment['poster']}
//                     </Typography>
//                     <Typography variant="body2" component="p">
//                       {comment['content']}
//                     </Typography>
//                   </CardContent>
//                   <CardActions>
//                     <ButtonGroup color="primary" aria-label="outlined primary button group">
//                     <Button onClick = {(e) => this.submitCommentUpvote(e, comment['comment_id'])}>Upvote</Button>
//                     <Button onClick = {(e) => this.submitCommentDownvote(e, comment['comment_id'])}>Downvote</Button>
//                     </ButtonGroup>
//                     <Button size="small">Report</Button>
//                   </CardActions>
//                 </Card>
//             )
//         };
//         return array_of_comments;
//       };


// add renderMethod that turns arrays back into dictionaries for display in jsx... arrayindexOf + 1.... etc



    render() {
        const comments_collapsed = this.state.comments_collapsed;

        return (
            <TopicLeafGrid>
                <UserAndAudience>
                {this.state.posted_as_anonymous ? this.props.anonymous_user_handle : this.state.topic_poster} => {this.state.topic_audience}
                </UserAndAudience>
                <Content>
                {this.state.topic_content}
                </Content>
                <Comments>
                {comments_collapsed ? 
                    <span style = {{"fontSize" : "15px"}}>Expand comments to the right</span>
                    : 
                    <ul style = {{ listStyleType : "none" }}>
                        {this.state.comments.map((comment, index) =>
                        <Card key={index}>
                          <CardContent>
                            <Typography  color="textSecondary" gutterBottom>
                              {comment['created_time']}
                            </Typography>
                            <Typography  color="textSecondary">
                              {comment['poster']}
                            </Typography>
                            <Typography variant="body2" component="p">
                              {comment['content']}
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <ButtonGroup color="primary" aria-label="outlined primary button group">
                            <Button onClick = {(e) => this.submitCommentUpvote(e, comment['comment_id'])}>Upvote</Button>
                            <Button onClick = {(e) => this.submitCommentDownvote(e, comment['comment_id'])}>Downvote</Button>
                            </ButtonGroup>
                            <Button size="small">Report</Button>
                          </CardActions>
                        </Card>
                    )}
                    </ul>
                }
                </Comments>
                <Userinput>
                    <input 
                        name="comment_to_be_posted"
                        placeholder="Write comment here"
                        type="text"                     
                        style=
                        {{
                            "width" : "80%",
                            "height" : "50%",
                            "fontSize" : "20px",
                            outline : "none"
                        }}
                        value={this.state.comment_to_be_posted} 
                        onChange={(e) => this.setState({ comment_to_be_posted: e.target.value })}/>
                        <input 
                        type="image" 
                        src={sendButton}
                        style={{
                            "width" : "10%",
                            outline : "none"
                            // "height" : "100%"
                        }}
                        onClick = {(e) => this.submitComment(e)}                        
                        />

                </Userinput>
                <Report>
                Report something
                </Report>
                <Voting>
                    {this.state.topic_upvotes}
                    <br/>
                    <input 
                    type="image" 
                    src={upvoteIcon}
                    style={{
                        "width" : "100%",
                        outline : "none"
                    //     "height" : "100%",
                    }}
                    onClick = {(e) => this.submitTopicUpvote(e)}                        
                    />
                    <br/>
                     <input 
                    type="image" 
                    src={downvoteIcon}
                    style={{
                        "width" : "100%",
                        outline : "none"
                    //     "height" : "100%",
                    }}
                    onClick = {(e)=>this.submitTopicDownvote(e)}                        
                    />
                    <br/>
                    {this.state.topic_downvotes}
                    <br/>
                     <input 
                    type="image" 
                    src={collapseIcon}
                    style={{
                        "width" : "100%",
                        outline : "none"
                    //     "height" : "100%",
                    }}
                    onClick = {(e) => {
                        e.preventDefault();
                        if (this.state.comments_collapsed) {
                            this.setState({comments_collapsed:false}) 
                            } else {
                            this.setState({comments_collapsed:true})
                            };
                        }
                    }
                        
                    />
                </Voting>
            </TopicLeafGrid>
        )
    }
}
export default TopicLeaf;
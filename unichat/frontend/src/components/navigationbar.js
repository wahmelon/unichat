import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Badge from '@material-ui/core/Badge';
import MailIcon from '@material-ui/icons/Mail';
import PersonIcon from '@material-ui/icons/Person';
import NotificationsIcon from '@material-ui/icons/Notifications';

const remainingWidthForContentView = (window.innerWidth - 100); 

const NavBar = styled.div` 
    display: grid;
    grid-template-columns: 50px ${remainingWidthForContentView}px 50px;
    grid-template-rows:  50px ;
    grid-template-areas: 

    "profile spacer notifications" 

`;

const profile = styled.div`
    font-size: 1.5em;
    grid-area: profile;
    background-color: #dfe3ee;
    align-items: center;            
    
`;

const spacer = styled.div`
    font-size: 1.5em;
    grid-area: spacer;
    background-color: #dfe3ee;
    align-items: center;            
    
`;

const notifications = styled.div`
    font-size: 1.5em;
    grid-area: notifications;
    background-color: #dfe3ee;
    align-items: center;            
    
`;

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

export default function SimpleBadge() {
  const classes = useStyles();

  return (
    <NavBar>
    <div className={classes.root}>
      <Badge badgeContent={4} color="primary">
        <PersonIcon />
      </Badge>
      <Badge badgeContent={4} color="secondary">
        <MailIcon />
      </Badge>
      <Badge badgeContent={4} color="error">
        <NotificationsIcon />
      </Badge>
    </div>
    </NavBar>
  );
}
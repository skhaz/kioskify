import './helpers/bootstrap';
import React, { useState, useEffect } from 'react';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import { deepPurple, deepOrange } from '@material-ui/core/colors';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase/app';
import { auth } from './helpers/firebase';
import PlaylistEditor from './playlist/PlaylistEditor';
import MachineManager from './machine/MachineManager';

const uiConfig = {
  signInFlow: 'popup',

  signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],

  callbacks: {
    signInSuccessWithAuthResult: () => false
  }
};

const App = () => {
  const TabContainer = props => (
    <Typography component='div' style={{ padding: 8, height: 2 }}>
      {props.children}
    </Typography>
  );

  const LinkTab = props => (
    <Tab component='a' onClick={event => event.preventDefault()} {...props} />
  );

  const [index, setIndex] = useState(2);

  const [isSignedIn, setSignedIn] = useState(null);

  useEffect(() => {
    const unsubscribe = auth
      .onAuthStateChanged(user => setSignedIn(!!user));

    return () => {
      unsubscribe();
    };
  }, []);

  const renderUnauthorized = () => (
    <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
  );

  const renderEditor = () => (
    <>
      <AppBar position='static' color='default'>
        <Tabs
          variant='fullWidth'
          indicatorColor='primary'
          value={index}
          onChange={(_, newValue) => setIndex(newValue)}
        >
          <LinkTab label='analytics' href='#' />
          <LinkTab label='machines' href='#' />
          <LinkTab label='playlist' href='#' />
        </Tabs>
      </AppBar>
      {index === 1 && (
        <TabContainer>
          <MachineManager />
        </TabContainer>
      )}
      {index === 2 && (
        <TabContainer>
          <PlaylistEditor />
        </TabContainer>
      )}
    </>
  );

  return (
    <>
      <AppBar position='static'>
        <Toolbar>
          <Typography variant='h6' color='inherit'>
            Kioskify
          </Typography>
        </Toolbar>
      </AppBar>
      {isSignedIn && renderEditor()}
      {isSignedIn !== null && !isSignedIn && renderUnauthorized()}
    </>
  );
};

export default () => {
  const theme = createMuiTheme({
    palette: {
      primary: deepPurple,
      secondary: deepOrange,
    },

    typography: {
      useNextVariants: true
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
};

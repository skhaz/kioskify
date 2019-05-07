import './helpers/bootstrap';
import React, { useState } from 'react';
import { createMuiTheme } from '@material-ui/core/styles';
import { makeStyles, ThemeProvider } from '@material-ui/styles';
import { deepPurple, red } from '@material-ui/core/colors';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import PlaylistEditor from './playlist/PlaylistEditor';
import MachineManager from './machine/MachineManager';

const useStyles = makeStyles({
  grow: {
    flexGrow: 1
  },

  menu: {
    marginLeft: -12,
    marginRight: 20
  }
});

const App = () => {
  const [index, setIndex] = useState(2);

  const classes = useStyles();

  const TabContainer = props => (
    <Typography component='div' style={{ padding: 8, height: 2 }}>
      {props.children}
    </Typography>
  );

  const LinkTab = props => (
    <Tab component='a' onClick={event => event.preventDefault()} {...props} />
  );

  return (
    <>
      <AppBar position='static'>
        <Toolbar>
          <IconButton
            className={classes.menu}
            color='inherit'
            aria-label='Menu'
          >
            <MenuIcon />
          </IconButton>
          <Typography variant='h6' color='inherit' className={classes.grow}>
            Kioskify
          </Typography>
        </Toolbar>
      </AppBar>
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
      {index === 0 && <TabContainer />}
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
};

export default () => {
  const theme = createMuiTheme({
    palette: {
      primary: deepPurple,
      secondary: red
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

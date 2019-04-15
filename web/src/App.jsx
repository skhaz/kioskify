import './bootstrap'

import React, { useState } from 'react'

import { createMuiTheme } from '@material-ui/core/styles'
import { ThemeProvider, makeStyles } from '@material-ui/styles'
import teal from '@material-ui/core/colors/teal'
import indigo from '@material-ui/core/colors/indigo'

import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Fab from '@material-ui/core/Fab'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import CssBaseline from '@material-ui/core/CssBaseline'

import IconButton from '@material-ui/core/IconButton'
import MoreIcon from '@material-ui/icons/More'
import SearchIcon from '@material-ui/icons/Search'
import AddIcon from '@material-ui/icons/Add'
import MenuIcon from '@material-ui/icons/Menu'

import DragDropRegion from './DragDropRegion'

const theme = createMuiTheme({
  palette: {
    primary: teal,
    secondary: indigo
  },
  typography: {
    useNextVariants: true
  }
})

const useStyles = makeStyles({
  root: {
    flexGrow: 1
  },
})

const initialState = {
  tabIndex: 0
}

const TabContainer = props => (
  <Typography component='div' style={{ padding: 8, height: 2 }}>
    {props.children}
  </Typography>
)

const LinkTab = props => (
  <Tab component='a' onClick={event => event.preventDefault()} {...props} />
)

export default () => {

  const [state, setState] = useState(initialState)

  const classes = useStyles()

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position='static'>
        <Toolbar>
          <IconButton className={classes.menuButton} color='inherit' aria-label='Menu'>
            <MenuIcon />
          </IconButton>
          <Typography variant='h6' color='inherit'>
            Kioskify
          </Typography>
        </Toolbar>
      </AppBar>
      <AppBar position='static' color='default'>
        <Tabs
          variant='fullWidth'
          indicatorColor='primary'
          value={state.tabIndex}
          onChange={(_, newValue) => setState({ ...state, tabIndex: newValue })}
        >
          <LinkTab label='Page One' href='page1' />
          <LinkTab label='Page Two' href='page2' />
          <LinkTab label='Page Three' href='page3' />
        </Tabs>
      </AppBar>
      {state.tabIndex === 2 && <TabContainer>Page One</TabContainer>}
      {state.tabIndex === 1 && (<TabContainer><Paper>Page Two></Paper></TabContainer>)}
      {state.tabIndex === 0 && (<TabContainer><DragDropRegion /></TabContainer>)}
    </ThemeProvider>
  )
}

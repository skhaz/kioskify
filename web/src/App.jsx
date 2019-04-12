import React, { useState } from 'react'

import { ThemeProvider } from '@material-ui/styles'
import { createMuiTheme } from '@material-ui/core/styles'
import { makeStyles } from '@material-ui/styles'
import primary from '@material-ui/core/colors/teal'
import secondary from '@material-ui/core/colors/indigo'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import NoSsr from '@material-ui/core/NoSsr'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'

import DragDropRegion from './DragDropRegion'

const TabContainer = props => (
  <Typography component="div" style={{ padding: 8, height: 2 }}>
    {props.children}
  </Typography>
)

const LinkTab = props => <Tab component="a" onClick={event => event.preventDefault()} {...props} />

const theme = createMuiTheme({
  palette: {
    primary,
    secondary,
  },
  typography: {
    useNextVariants: true,
  },
})

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    // backgroundColor: theme.palette.background.paper,
  },
}))

export default () => {

  const [value, setValue] = useState(0)

  const classes = useStyles()

  const handleChange = (event, newValue) => {
    setValue(newValue);
  }

  return (
    <ThemeProvider theme={theme}>
      <NoSsr>
        <div className={classes.root}>
          <AppBar position="static">
            <Tabs variant="fullWidth" value={value} onChange={handleChange}>
              <LinkTab label="Page One" href="page1" />
              <LinkTab label="Page Two" href="page2" />
              <LinkTab label="Page Three" href="page3" />
            </Tabs>
          </AppBar>
          {value === 2 && <TabContainer>Page One</TabContainer>}
          {value === 1 && <TabContainer><Paper>Page Two></Paper></TabContainer>}
          {value === 0 && <TabContainer><DragDropRegion /></TabContainer>}
        </div>
      </NoSsr>
    </ThemeProvider>
  )
}

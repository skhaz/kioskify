import React, { useState } from 'react'

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import { makeStyles } from '@material-ui/styles'
import teal from '@material-ui/core/colors/teal'
import indigo from '@material-ui/core/colors/indigo'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
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
    primary: teal,
    secondary: indigo,
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
    <MuiThemeProvider theme={theme}>
      <div className={classes.root}>
        <AppBar position="static" color="default">
          <Tabs variant="fullWidth" indicatorColor="primary" value={value} onChange={handleChange}>
            <LinkTab label="Page One" href="page1" />
            <LinkTab label="Page Two" href="page2" />
            <LinkTab label="Page Three" href="page3" />
          </Tabs>
        </AppBar>
        {value === 2 && <TabContainer>Page One</TabContainer>}
        {value === 1 && <TabContainer><Paper>Page Two></Paper></TabContainer>}
        {value === 0 && <TabContainer><DragDropRegion /></TabContainer>}
      </div>
    </MuiThemeProvider>
  )
}

import React from 'react'
import { makeStyles } from '@material-ui/styles'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import Tooltip from '@material-ui/core/Tooltip'

const useStyles = makeStyles(theme => {
  return {
    root: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
    }
  }
})

export default () => {

  const classes = useStyles()

  const url = 'https://i.ytimg.com/vi/NQQBmldQFZ8/mqdefault.jpg';

  return (
    <div className={classes.root}>
      <List component="nav">
        <Tooltip title="Add" placement="top">
          <ListItem button>
            <ListItemText primary="Propaganda 1" secondary="00:32" />
            <ListItemSecondaryAction>
              <ListItemText primary="1" secondary="3" />
            </ListItemSecondaryAction>
          </ListItem>
        </Tooltip>

        <Tooltip title="Add" placement="top">
          <ListItem button>
            <ListItemText primary="Propaganda 1" secondary="00:32" />
            <ListItemSecondaryAction>
              <ListItemText primary="1" secondary="3" />
            </ListItemSecondaryAction>
          </ListItem>
        </Tooltip>

        <Tooltip title="Add" placement="top">
          <ListItem button>
            <ListItemText primary="Propaganda 1" secondary="00:32" />
            <ListItemSecondaryAction>
              <ListItemText primary="1" secondary="2" />
            </ListItemSecondaryAction>
          </ListItem>
        </Tooltip>

      </List>
    </div>
  )
}

import React, { useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import Paper from '@material-ui/core/Paper'
import List from '@material-ui/core/List'
import AddIcon from '@material-ui/icons/Add'
import Fab from '@material-ui/core/Fab'
import firebase from '../helpers/firebase'

const firestore = firebase.firestore()

const useStyles = makeStyles(theme => ({
  paper: {
    flexGrow: 1
  },

  fab: {
    position: 'absolute',
    bottom: theme.spacing.unit * 2,
    right: theme.spacing.unit * 2
  },

  list: {
    overflowY: 'auto',
    overflowX: 'hidden',
    height: 'calc(100vh - 96pt)',
    backgroundColor: '#f8f8f8'
  }
}))

export default () => {

  const [visible, setVisible] = useState(false)

  const classes = useStyles()

  return (
    <Paper className={classes.paper}>
      <List
        dense
        disablePadding
        className={classes.list}
      >
      </List>
      <Fab
        color='secondary'
        className={classes.fab}
        onClick={() => setVisible(true)}
      >
        <AddIcon />
      </Fab>
    </Paper>
  )
}
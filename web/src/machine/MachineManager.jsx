import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/styles'
import Paper from '@material-ui/core/Paper'
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
  }
}))

export default () => {

  const [visible, setVisible] = useState(false)

  const classes = useStyles()

  return (
    <Paper className={classes.paper}>
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
import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/styles'
import { sortableElement } from 'react-sortable-hoc'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import firebase from '../helpers/firebase'

const firestore = firebase.firestore()

const useStyles = makeStyles({
  root: {
    cursor: 'default',

    backgroundColor: 'white',

    '&:hover': {
      backgroundColor: 'lightgrey !important'
    },

    '&$selected': {
      backgroundColor: 'lightgrey'
    }
  },

  selected: {}
})

export default sortableElement((props) => {

  const { value, selected, onClick } = props

  const [state, setState] = useState({})

  const classes = useStyles()

  const handleSnapshot = document => {
    if (!document) {
      return
    }

    const { title, ready, error } = document.data()

    const status = error ? 'error' : ready ? 'done' : 'processing'

    setState({ title, status })
  }

  useEffect(() => {
    const { vid: id } = value

    const unsubscribe = firestore
      .collection('videos')
      .doc(id)
      .onSnapshot(handleSnapshot)

    return () => {
      unsubscribe()
    }
  }, [])

  const handleClick = () => {
    onClick(value)
  }

  return (
    <ListItem
      classes={classes}
      selected={selected}
      onClick={handleClick}
    >
      {state.status && (
        <ListItemText
          primary={state.title || '...'}
          secondary={state.status}
        />
      )}
    </ListItem>
  )
})

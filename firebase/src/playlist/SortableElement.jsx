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

  const [state, setState] = useState({ loading: true })

  const classes = useStyles()

  const stringify = (error, ready, title) => {
    if (error) {
      return 'error'
    } else if (ready) {
      return 'done'
    } else if (title) {
      return 'processing'
    } else {
      return 'loading'
    }
  }

  const onSnapshot = (snapshot) => {
    if (!snapshot.exists) {
      return
    }

    const document = snapshot.data()

    if (!document) {
      return
    }

    const { error, ready, title, durationInSec } = document

    const date = new Date(durationInSec * 1000)
    let minutes = date.getUTCMinutes()
    let seconds = date.getSeconds()

    if (minutes < 10) {
      minutes = '0' + minutes
    }

    if (seconds < 10) {
      seconds = '0' + seconds
    }

    const duration = `${minutes}:${seconds}`

    const status = stringify(error, ready, title)

    setState({ status, ready, title, loading: false })
  }

  useEffect(() => {
    const { vid: id } = value

    const unsubscribe = firestore
      .collection('videos')
      .doc(id)
      .onSnapshot(onSnapshot)

    return () => {
      unsubscribe()
    }
  }, [])

  const handleClick = () => {
    onClick(value)
  }

  return (
    <ListItem
      disabled={state.loading}
      classes={classes}
      selected={selected}
      onClick={handleClick}
    >
      <ListItemText
        primary={state.title || 'loading...'}
        secondary={state.status}
      />
    </ListItem>
  )
})

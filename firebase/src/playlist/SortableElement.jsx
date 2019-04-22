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

  const [holder, setHolder] = useState({})

  const [loading, setLoading] = useState(true)

  const classes = useStyles()

  const stringify = (error, ready, title, durationInSec) => {
    if (error) {
      return '⚠︎'
    } else if (ready) {
      const date = new Date(durationInSec * 1000)
      const mins = date.getUTCMinutes()
      const secs = date.getSeconds()
      const minutes = mins < 10 ? '0' + mins : mins
      const seconds = secs < 10 ? '0' + secs : secs
      return [minutes, seconds].join(':')
    } else if (title) {
      return '...'
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

    const status = stringify(error, ready, title, durationInSec)

    setLoading(false)
    setHolder({ status, ready, title })
  }

  useEffect(() => {
    const { vid: id } = value

    const unsubscribe = firestore
      .collection('videos')
      .doc(id)
      .onSnapshot(onSnapshot)

    return () => unsubscribe()
  }, [])

  const handleClick = () => {
    onClick(value)
  }

  return (
    <ListItem
      disabled={!holder.ready}
      classes={classes}
      selected={selected}
      onClick={handleClick}
      style={{ display: loading ? 'none' : '' }}
    >
      <ListItemText
        primary={holder.title || ''}
        secondary={holder.status}
      />
    </ListItem >
  )
})

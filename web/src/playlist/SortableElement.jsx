import React, { useState, useEffect } from 'react'

import { sortableElement } from 'react-sortable-hoc'

import { makeStyles } from '@material-ui/styles'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'

import firebase from '../helpers/firebase'

const firestore = firebase.firestore()

const useStyles = makeStyles({
  card: {
    //width: 320
  },
  media: {
    width: 320,
    height: 180
  },
})

export default sortableElement((props) => {

  const { value, selected, onClick } = props

  const classes = useStyles()

  const [state, setState] = useState({})

  const handleSnapshot = doc => {
    const { title, yid, ready, error } = doc.data()

    const thumbnail = `<img src="https://i.ytimg.com/vi/${yid}/mqdefault.jpg" />`

    const status = error ? 'error' : ready ? 'done' : 'processing'

    setState({ title, thumbnail, status })
  }

  useEffect(() => {
    const unsubscribe = firestore
      .collection('videos')
      .doc(value.vid)
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
      rightIconButton={state.thumbnail}
      selected={selected}
      onClick={handleClick}
    >
      {state.thumbnail && (
        <ListItemText
          primary={state.title || '...'}
          secondary={state.status}
        />
      )}
    </ListItem>
  )
})

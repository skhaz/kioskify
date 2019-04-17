import React, { useState, useEffect } from 'react'

import { sortableElement } from 'react-sortable-hoc'

import { makeStyles } from '@material-ui/styles'
import ListItem from '@material-ui/core/ListItem'
import Card from '@material-ui/core/Card'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import CardHeader from '@material-ui/core/CardHeader'
import IconButton from '@material-ui/core/IconButton'
import MoreVertIcon from '@material-ui/icons/MoreVert'

import firebase from '../helpers/firebase'

const firestore = firebase.firestore()

const useStyles = makeStyles({
  card: {
    width: 320
  },
  media: {
    width: 320,
    height: 180
  },
})

export default sortableElement(({ value, selected, onClick }) => {

  const [holder, setHolder] = useState({})

  const classes = useStyles()

  const handleSnapshot = doc => {
    const { title, yid, ready, error } = doc.data()

    const thumbnail = `https://i.ytimg.com/vi/${yid}/mqdefault.jpg`

    setHolder({ title, ready, thumbnail, error })
  }

  useEffect(() => {
    const { vid } = value

    const unsubscribe = firestore
      .collection('videos')
      .doc(vid)
      .onSnapshot(handleSnapshot)

    return () => {
      unsubscribe()
    }
  }, [])

  const handleClick = () => {
    onClick(value)
  }

  return (
    <ListItem selected={selected} onClick={handleClick}>
      <Card className={classes.card}>
        <CardHeader
          action={
            <IconButton>
              <MoreVertIcon />
            </IconButton>
          }
          title={holder.title}
          subheader={holder.error ? 'error' : holder.ready ? 'done' : 'processing'}
        />
        <CardMedia
          component='img'
          className={classes.media}
          image={holder.thumbnail}
        />
      </Card>
    </ListItem>
  )
})

import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/styles'
import { sortableElement } from 'react-sortable-hoc'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'

import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'

import firebase from '../helpers/firebase'

const firestore = firebase.firestore()

const useStyles = makeStyles({
  card: {
    display: 'flex',
    height: 90,
    borderRadius: 0
  },

  cover: {
    width: 160,
    height: 90,
  }
})

export default sortableElement(props => {
  const { value, selected, onClick, onRightClick } = props

  const [holder, setHolder] = useState()

  const [loading, setLoading] = useState(true)

  const classes = useStyles()

  const stringify = (error, ready, title, durationInSec) => {
    if (error) {
      return '⚠︎'
    } else if (ready) {
      const date = new Date(durationInSec * 1000)
      let minutes = date.getUTCMinutes()
      let seconds = date.getSeconds()
      minutes = minutes < 10 ? '0' + minutes : minutes
      seconds = seconds < 10 ? '0' + seconds : seconds
      return [minutes, seconds].join(':')
    } else if (title) {
      return '...'
    }
  }

  const handleSnapshot = snapshot => {
    if (!snapshot.exists) {
      return
    }

    const document = snapshot.data()

    if (!document) {
      return
    }

    const { error, ready, title, durationInSec, yid } = document

    const status = stringify(error, ready, title, durationInSec)

    setLoading(false)
    setHolder({ status, ready, title, yid })
  }

  useEffect(() => {
    const { vid: id } = value

    const unsubscribe = firestore
      .collection('videos')
      .doc(id)
      .onSnapshot(handleSnapshot)

    return () => unsubscribe()
  }, [])

  return (
    <Card
      className={classes.card}
    >
      {holder && (
        <>
          <CardMedia
            className={classes.cover}
            image={`https://i.ytimg.com/vi/${holder.yid}/mqdefault.jpg`}
          />
          <CardContent selected className={classes.content}>
            <Typography component='h5' variant='h5'>
              {holder.title || `https://www.youtube.com/watch?v=${holder.yid}`}
            </Typography>
            <Typography variant='subtitle1' color='textSecondary'>
              {holder.status}
            </Typography>
          </CardContent>
        </>
      )}
    </Card>
  )
})

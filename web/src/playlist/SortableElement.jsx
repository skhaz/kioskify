import React, { useState, useEffect } from 'react'
import classnames from 'classnames'

import { sortableElement } from 'react-sortable-hoc'

import { makeStyles } from '@material-ui/styles'
import ListItem from '@material-ui/core/ListItem'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Collapse from '@material-ui/core/Collapse'
import Typography from '@material-ui/core/Typography'
import CardHeader from '@material-ui/core/CardHeader'
import IconButton from '@material-ui/core/IconButton'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import MoreVertIcon from '@material-ui/icons/MoreVert'

import firebase from '../helpers/firebase'

const firestore = firebase.firestore()

const useStyles = makeStyles(theme => ({
  card: {
    width: 320
  },

  media: {
    width: 320,
    height: 180
  },

  actions: {
    display: 'flex'
  },

  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest
    })
  },

  expandOpen: {
    transform: 'rotate(180deg)'
  }
}))

const SortableItem = (props) => {

  const [expanded, setExpanded] = useState()

  const [holder, setHolder] = useState({})

  const classes = useStyles()

  const { value, selected, onClick } = props

  const handleSnapshot = document => {
    const { title, yid, ready, error } = document.data()

    const thumbnail = `https://i.ytimg.com/vi/${yid}/mqdefault.jpg`
    console.log(title)
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

  const handleExpandClick = () => {
    setExpanded(!expanded)
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

        <CardActions className={classes.actions} disableActionSpacing>
          <IconButton
            className={classnames(classes.expand, {
              [classes.expandOpen]: expanded
            })}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label='Show more'
          >
            <ExpandMoreIcon />
          </IconButton>
        </CardActions>
        <Collapse in={expanded} timeout='auto' unmountOnExit>
          <CardContent>
            <Typography>
              Set aside off of the heat to let rest for 10 minutes, and then
              serve.
            </Typography>
          </CardContent>
        </Collapse>
      </Card>
    </ListItem>
  )
}

export default sortableElement((SortableItem))

import React from 'react'
import { makeStyles } from '@material-ui/styles'

import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardMedia from '@material-ui/core/CardMedia'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles(theme => {
  return {
    card: {
      width: 168,
    },
    media: {
      height: 94,
    },
  }
})

export default () => {

  const classes = useStyles()

  const url = 'https://i.ytimg.com/vi/NQQBmldQFZ8/mqdefault.jpg';

  return (
    <Card className={classes.card}>
      <CardActionArea>
        <CardMedia className={classes.media} image={url} />
        <CardContent>
          <Typography gutterBottom variant="subtitle2">
            Bump
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

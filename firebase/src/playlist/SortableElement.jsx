import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { sortableElement } from 'react-sortable-hoc';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import { firestore } from '../helpers/firebase';

const useStyles = makeStyles(theme => ({
  card: {
    display: 'flex',

    height: 90,

    '&:hover': {
      textDecoration: 'none',
      backgroundColor: theme.palette.action.hover
    }
  },

  cover: {
    width: 160,
    minWidth: 160
  },

  content: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundClip: 'padding-box',
    flexGrow: 1
  }
}));

export default sortableElement(props => {
  const { value, selected, onClick, onRightClick } = props;

  const [holder, setHolder] = useState();

  const classes = useStyles();

  const stringify = (error, ready, title, durationInSec) => {
    if (error) {
      return '⚠︎';
    } else if (ready) {
      const date = new Date(durationInSec * 1000);
      let minutes = date.getUTCMinutes();
      let seconds = date.getSeconds();
      minutes = minutes < 10 ? '0' + minutes : minutes;
      seconds = seconds < 10 ? '0' + seconds : seconds;
      return [minutes, seconds].join(':');
    } else if (title) {
      return '...';
    }
  };

  const handleSnapshot = snapshot => {
    if (!snapshot.exists) {
      return;
    }

    const document = snapshot.data();

    if (!document) {
      return;
    }

    const { error, ready, title, durationInSec, yid } = document;

    const status = stringify(error, ready, title, durationInSec);

    setHolder({ status, ready, title, yid });
  };

  useEffect(() => {
    const { vid: id } = value;

    const unsubscribe = firestore
      .collection('videos')
      .doc(id)
      .onSnapshot(handleSnapshot);

    return () => unsubscribe();
  }, []);

  return (
    <Card elevation={0} square className={classes.card}>
      {holder && (
        <>
          <CardMedia
            className={classes.cover}
            image={`https://i.ytimg.com/vi/${holder.yid}/mqdefault.jpg`}
          />
          <CardContent className={classes.content}>
            <Typography component='h6' variant='h6'>
              {holder.title || `https://www.youtube.com/watch?v=${holder.yid}`}
            </Typography>
            <Typography variant='subtitle1' color='textSecondary'>
              {holder.status}
            </Typography>
          </CardContent>
        </>
      )}
    </Card>
  );
});

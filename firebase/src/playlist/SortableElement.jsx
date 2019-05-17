import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { sortableElement } from 'react-sortable-hoc';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Checkbox from '@material-ui/core/Checkbox';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import { firestore } from '../helpers/firebase';

const useStyles = makeStyles(theme => ({

}));

export default sortableElement(props => {
  const { value, selected, onClick, onRightClick } = props;

  const [holder, setHolder] = useState();

  const classes = useStyles();

  const stringify = (error, ready, durationInSec) => {
    if (error) {
      return '⚠︎';
    }

    if (ready) {
      const date = new Date(durationInSec * 1000);
      const v1 = date.getUTCMinutes();
      const v2 = date.getSeconds();
      const mins = v1 < 10 ? '0' + v1 : v1;
      const secs = v2 < 10 ? '0' + v2 : v2;

      return [mins, secs].join(':');
    }

    return '...';
  };

  const handleSnapshot = snapshot => {
    if (!snapshot.exists) {
      return;
    }

    const document = snapshot.data();

    if (!document) {
      return;
    }

    const {
      error,
      ready,
      durationInSec,
      yid,
    } = document;

    const status = stringify(error, ready, durationInSec);

    const thumbnail = `https://i.ytimg.com/vi/${yid}/mqdefault.jpg`;

    const title = document.title || `https://www.youtube.com/watch?v=${yid}`;

    setHolder({ status, ready, title, thumbnail });
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
    <ListItem>
      {holder && (
        <>
          <ListItemAvatar>
            <Avatar src={holder.thumbnail}/>
          </ListItemAvatar>
          <ListItemText
            primary={holder.title}
            secondary={holder.status}
          />
          <ListItemSecondaryAction>
            <Checkbox />
          </ListItemSecondaryAction>
        </>
      )}
    </ListItem>
  );
});

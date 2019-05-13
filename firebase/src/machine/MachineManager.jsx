import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import AddIcon from '@material-ui/icons/Add';
import Fab from '@material-ui/core/Fab';
import firebase from 'firebase/app';
import { firestore, auth } from '../helpers/firebase';
import AddDialog from './AddDialog';

const useStyles = makeStyles(theme => ({
  paper: {
    flexGrow: 1
  },

  fab: {
    position: 'absolute',
    bottom: theme.spacing.unit * 4,
    right: theme.spacing.unit * 4
  },

  list: {
    overflowY: 'auto',
    overflowX: 'hidden',
    height: 'calc(100vh - 96pt)'
  }
}));

const useMachines = () => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [machines, setMachines] = React.useState([]);

  useEffect(() => {
    const { uid } = auth.currentUser;

    const unsubscribe = firestore
      .collection('machines')
      .where('owner', '==', uid)
      .onSnapshot(
        snapshot => {
          const machines = [];

          snapshot.forEach(doc => {
            machines.push({ id: doc.id, ...doc.data() });
          });

          setLoading(false);
          setMachines(machines);
        },
        error => setError(error)
      );

    return () => unsubscribe();
  }, []);

  return [error, loading, machines];
};

export default () => {
  const [visible, setVisible] = useState(false);

  const classes = useStyles();

  const [error, loading, machines] = useMachines();

  const handleSubmit = async value => {
    if (value.replace(/\s/g, '') === '') {
      return;
    }

    const query1 = await firestore
      .collection('machines')
      .where('pinCode', '==', value.toUpperCase())
      .limit(1)
      .get();

    if (query1.empty) {
      alert('machine not found or offline!');
      // ...
      return;
    }

    const { uid: owner } = auth.currentUser;

    const query2 = await firestore
      .collection('groups')
      .where('owner', '==', owner)
      .where('default', '==', true)
      .limit(1)
      .get();

    const gid = query2.empty
      ? firestore.collection('groups').doc()
      : query2.docs[0].ref;

    const batch = firestore.batch();
    const added = new Date();
    const { ref } = query1.docs[0];
    batch.update(ref, { pinCode: firebase.firestore.FieldValue.delete() });
    batch.update(ref, { owner, added, gid });
    batch.set(gid, { owner, default: true }, { merge: true });
    return batch.commit();
  };

  return (
    <Paper className={classes.paper}>
      <List disablePadding className={classes.list}>
        {!loading && (
          machines.map(machine => (
            <ListItem button key={machine.id}>
              <ListItemText
                primary={machine.model || 'Untitled'}
                secondary={machine.manufacture || 'Unknow'}
              />
            </ListItem>
          ))
        )}
      </List>
      <AddDialog
        open={visible}
        onSubmit={value => {
          setVisible(false) || handleSubmit(value);
        }}
        onClose={() => setVisible(false)}
      />
      <Fab
        color='secondary'
        className={classes.fab}
        onClick={() => setVisible(true)}
      >
        <AddIcon />
      </Fab>
    </Paper>
  );
};

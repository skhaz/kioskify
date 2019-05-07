import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import AddIcon from '@material-ui/icons/Add';
import Fab from '@material-ui/core/Fab';
import firebase from '../helpers/firebase';
import AddDialog from './AddDialog';

const firestore = firebase.firestore();

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
    const unsubscribe = firestore
      .collection('machines')
      .orderBy('added')
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
    const query = await firestore
      .collection('machines')
      .where('pinCode', '==', value)
      .limit(1)
      .get();

    if (query.empty) {
      // ...
      return;
    }

    const { uid } = firebase.auth().currentUser;
    const added = new Date();
    return firestore
      .doc(`machines/${query.docs[0].id}`)
      .set({ owner: uid, added });
  };

  return (
    <Paper className={classes.paper}>
      <List disablePadding className={classes.list}>
        {!loading && (
          machines.map(machine => (
            <ListItem button key={machine.id}>
              <ListItemText
                primary={machine.name || 'Untitled'}
                secondary={machine.location || 'Unknow location'}
              />
            </ListItem>
          )
        ))}
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

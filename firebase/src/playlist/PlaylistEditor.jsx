import React, { useState, useEffect } from 'react';
import arrayMove from 'array-move';
import { makeStyles } from '@material-ui/styles';
import Paper from '@material-ui/core/Paper';
import AddIcon from '@material-ui/icons/Add';
import Fab from '@material-ui/core/Fab';
import { firestore, auth } from '../helpers/firebase';
import NewVideoDialog from './NewVideoDialog';
import SortableContainer from './SortableContainer';
import PreviewDialog from './PreviewDialog';

const useStyles = makeStyles(theme => ({
  paper: {
    flexGrow: 1
  },

  fab: {
    position: 'absolute',
    bottom: theme.spacing.unit * 4,
    right: theme.spacing.unit * 4
  }
}));

export default () => {

  const [items, setItems] = useState([]);

  const [open, setOpen] = useState(false);

  const [preview, setPreview] = useState({ open: false });

  const classes = useStyles();

  const publish = async () => {
    const batch = firestore.batch();

    items.forEach(({ id }, index) => {
      batch.update(firestore.collection('v1').doc(id), { '#': index });
    });

    await batch.commit();
  };

  const onCompletion = querySnapshot => {
    const arr = [];

    querySnapshot.forEach(document => {
      const { video: { id: vid }, '#': index } = document.data();

      const { id } = document;

      arr.push({ id, vid, index });
    });

    setItems(arr);
  };

  useEffect(() => {
    const unsubscribe = firestore
      .collection('v1')
      .orderBy('#')
      .onSnapshot(onCompletion);

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => { publish(); }, [items]);

  const handleSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex === newIndex) {
      return;
    }

    setItems(arrayMove(items, oldIndex, newIndex));
  };

  const handleClick = async ({ id, vid }) => {
    const document = await firestore
      .collection('videos')
      .doc(vid)
      .get();

    const { ready, title, url } = document.data();

    if (!ready) {
      // return;
    }

    setPreview({ open: true, id, title, url });
  };

  const handleDelete = async (id) => {
    return firestore.doc(`v1/${id}`).delete();
  };

  const handleSubmit = async (yid) => {
    const { uid } = auth.currentUser;

    const userRef = firestore.doc(`users/${uid}`);

    const groupQuery = await firestore
      .collection('groups')
      .where('user', '==', userRef)
      .where('default', '==', true)
      .limit(1)
      .get();

    const videoQuery = await firestore
      .collection('videos')
      .where('yid', '==', yid)
      .limit(1)
      .get();

      const newRef1 = firestore.collection('groups').doc();
      const groupRef = groupQuery.empty ? newRef1 : groupQuery.docs[0].ref;
      const newRef2 = firestore.collection('videos').doc();
      const v1Ref = firestore.collection('v1').doc();
      const alreadyExists = !videoQuery.empty;
      const videoRef = alreadyExists ? videoQuery.docs[0].ref : newRef2;
      const batch = firestore.batch();
      batch.set(groupRef, { user: userRef, default: true }, { merge: true });
      batch.set(videoRef, { user: userRef, group: groupRef, yid }, { merge: true });
      batch.set(v1Ref, { video: videoRef, group: groupRef, '#': items.length });

      if (alreadyExists) {
        const document = await videoRef.get();

        if (document.data().ready) {
          batch.update(v1Ref, { enabled: true });
        }
      }

      return batch.commit();
  };

  return (
    <Paper className={classes.paper}>
      <SortableContainer
        items={items}
        onSortEnd={handleSortEnd}
        onClick={handleClick}
        onDelete={({ id }) => { handleDelete(id); }}
        distance={2}
        lockAxis='y'
      />
      <Fab
        color='secondary'
        className={classes.fab}
        onClick={() => setOpen(true)}
      >
        <AddIcon />
      </Fab>
      <NewVideoDialog
        open={open}
        onSubmit={value => {
          setOpen(false);
          handleSubmit(value);
        }}
        onClose={() => setOpen(false)}
      />
      <PreviewDialog
        open={preview.open}
        url={preview.url}
        title={preview.title}
        onClose={() => setPreview({ open: false })}
        onDelete={() => handleDelete(preview.id)}
      />
    </Paper>
  );
};

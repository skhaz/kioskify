import React, { useState, useEffect } from 'react';
import { debounce } from 'throttle-debounce';
import arrayMove from 'array-move';
import { makeStyles } from '@material-ui/styles';
import Paper from '@material-ui/core/Paper';
import AddIcon from '@material-ui/icons/Add';
import Fab from '@material-ui/core/Fab';
import { firestore, auth } from '../helpers/firebase';
import AddDialog from './AddDialog';
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

  const [videos, setVideos] = useState([]);

  const [visible, setVisible] = useState(false);

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
      const { vid: { id: vid }, '#': index } = document.data();

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

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = firestore.collection('videos').onSnapshot(snapshot => {
      const videos = [];

      snapshot.forEach(doc => {
        videos.push({ id: doc.id, ...doc.data() });
      });

      setVideos(videos);
    });

    return () => unsubscribe();
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
      return;
    }

    setPreview({ open: true, id, title, url });
  };

  const handleDelete = async (id) => {
    return firestore.doc(`v1/${id}`).delete();
  };

  const handleSubmit = async yid => {
    const { uid: owner } = auth.currentUser;

    const query1 = await firestore
      .collection('groups')
      .where('owner', '==', owner)
      .where('default', '==', true)
      .limit(1)
      .get();

    const query2 = await firestore
      .collection('videos')
      .where('yid', '==', yid)
      .limit(1)
      .get();

    const batch = firestore.batch();
    const newRef1 = firestore.collection('groups').doc();
    const gidRef = query1.empty ? newRef1 : query1.docs[0].ref;
    const newRef2 = firestore.collection('videos').doc();
    const docRef = query2.empty ? newRef2 : query2.docs[0].ref;
    batch.set(gidRef, { owner, default: true }, { merge: true });
    batch.set(docRef, { yid, gid: gidRef, owner, added: new Date() }, { merge: true });
    const v1Ref = firestore.collection('v1').doc();
    batch.set(v1Ref, { gid: gidRef, vid: docRef, owner, '#': items.length });
    return batch.commit();
  };

  const handleContextMenu = event => {
    // event.preventDefault();
  };

  return (
    <Paper
      className={classes.paper}
      onContextMenu={handleContextMenu}
    >
      <SortableContainer
        items={items}
        onSortEnd={handleSortEnd}
        onClick={handleClick}
        onDelete={({ id }) => { handleDelete(id); }}
        distance={2}
        lockAxis='y'
      />
      <AddDialog
        open={visible}
        videos={videos}
        onSubmit={value => {
          setVisible(false);
          handleSubmit(value);
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

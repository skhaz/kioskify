import React, { useState, useEffect } from 'react'
import { debounce } from 'throttle-debounce'
import arrayMove from 'array-move'
import { makeStyles } from '@material-ui/styles'
import Paper from '@material-ui/core/Paper'
import AddIcon from '@material-ui/icons/Add'
import Fab from '@material-ui/core/Fab'
import firebase from '../helpers/firebase'
import AddDialog from './AddDialog'
import SortableContainer from './SortableContainer'
import PreviewDialog from './PreviewDialog'

const firestore = firebase.firestore()

const useStyles = makeStyles(theme => ({
  paper: {
    flexGrow: 1
  },

  fab: {
    position: 'absolute',
    bottom: theme.spacing.unit * 2,
    right: theme.spacing.unit * 2
  }
}))

export default () => {

  const [items, setItems] = useState([])

  const [videos, setVideos] = useState([])

  const [visible, setVisible] = useState(false)

  const [preview, setPreview] = useState({ open: false })

  const classes = useStyles()

  const onCompletion = querySnapshot => {
    const arr = []

    querySnapshot.forEach(document => {
      const { vid: { id: vid }, '#': index } = document.data()

      const { id } = document

      arr.push({ id, vid, index })
    })

    setItems(arr)
  }

  const publish = async () => {
    const batch = firestore.batch()

    items.forEach(({ id }, index) => {
      batch.update(
        firestore.collection('v1').doc(id), { '#': index }
      )
    })

    await batch.commit()
  }

  useEffect(() => {
    const unsubscribe = firestore
      .collection('v1')
      .orderBy('#')
      .onSnapshot(onCompletion)

    return () => unsubscribe()
  }, [])


  useEffect(() => {
    const unsubscribe = firestore
      .collection('videos')
      .onSnapshot(snapshot => {
        const videos = []

        snapshot.forEach(doc => {
          videos.push({ id: doc.id, ...doc.data() })
        })

        setVideos(videos)
      })

    return () => unsubscribe()
  }, [])

  const handleSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex === newIndex) {
      return
    }

    setItems(arrayMove(items, oldIndex, newIndex))

    publish()
  }

  const handleClick = async ({ id, vid }) => {
    const document = await firestore
      .collection('videos')
      .doc(vid)
      .get()

    const { ready, title, url } = document.data()

    if (!ready) {
      return
    }

    setPreview({ open: true, id, title, url })
  }

  const handleDelete = async (preview) => {
    return firestore.doc(`v1/${preview.id}`).delete()
  }

  const handleSubmit = async (yid) => {
    const gid = firestore.doc('groups/y0mFxOO9CSGzHHiMypPs')

    const query = await firestore
      .collection('videos')
      .where('yid', '==', yid)
      .limit(1)
      .get()

    const added = new Date()
    const batch = firestore.batch()
    const newRef = firestore.collection('videos').doc()
    const docRef = query.empty ? newRef : query.docs[0].ref
    batch.set(docRef, { added, yid, gid }, { merge: true })
    const v1Ref = firestore.collection('v1').doc()
    batch.set(v1Ref, { gid, vid: docRef, '#': items.length })
    return batch.commit()
  }

  return (
    <Paper
      className={classes.paper}
      onContextMenu={(e) => { e.preventDefault() }}
    >
      <SortableContainer
        items={items}
        onSortEnd={handleSortEnd}
        onClick={handleClick}
        distance={2}
        lockAxis='y'
      />
      <AddDialog
        open={visible}
        videos={videos}
        onSubmit={(value) => { setVisible(false) || handleSubmit(value) }}
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
        onDelete={() => handleDelete(preview)}
      />
    </Paper>
  )
}
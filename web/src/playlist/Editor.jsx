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

  const [visible, setVisible] = useState(false)

  const [preview, setPreview] = useState({ open: false })

  const classes = useStyles()

  const onCompletion = querySnapshot => {
    const arr = []

    querySnapshot.forEach(doc => {
      const { vid: { id: vid }, '#': index } = doc.data()
      const { id } = doc

      arr.push({ id, vid, index })
    })

    setItems(arr)
  }

  const onPublish = debounce(300, async () => {
    const batch = firestore.batch()

    items.forEach(({ id }, index) => {
      batch.update(
        firestore.collection('v1').doc(id), { '#': index }
      )
    })

    return batch.commit()
  })

  useEffect(() => {
    const unsubscribe = firestore
      .collection('v1')
      .orderBy('#')
      .onSnapshot(onCompletion)

    return () => {
      unsubscribe()
    }
  }, [])

  const handleSortEnd = ({ oldIndex, newIndex }) => {
    setItems(arrayMove(items, oldIndex, newIndex))
  }

  const handleClick = async ({ vid: id }) => {
    const document = await firestore
      .collection('videos')
      .doc(id)
      .get()

    const { ready, title, url } = document.data()

    if (!ready) {
      return
    }

    setPreview({ open: true, title, url })
  }

  const handleSubmit = async (yid) => {
    const gid = firestore.doc('groups/Z0pKmfYxMLw6RD7RMfN4')

    const query = await firestore
      .collection('videos')
      .where('yid', '==', yid)
      .where('gid', '==', gid)
      .get()

    const batch = firestore.batch()
    const r0 = firestore.collection('videos').doc()
    const r1 = query.empty ? r0 : query.docs[0].ref
    batch.set(r1, { yid, gid }, { merge: true })
    const r2 = firestore.collection('v1').doc()
    batch.set(r2, { gid, vid: r1, '#': items.length })
    return batch.commit()
  }

  return (
    <Paper className={classes.paper}>
      <SortableContainer
        items={items}
        onSortEnd={handleSortEnd}
        onClick={handleClick}
        distance={2}
        lockAxis='y'
      />
      <AddDialog
        open={visible}
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
      />
    </Paper>
  )
}
import React, { Fragment, useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/styles'

import arrayMove from 'array-move'

import firebase from '../helpers/firebase'
import { debounce } from 'throttle-debounce'

import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'

import AddDialog from './AddDialog'
import SortableContainer from './SortableContainer'

const firestore = firebase.firestore()

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    display: 'flex'
  },

}))

export default () => {

  const [items, setItems] = useState([])

  const [visible, setVisible] = useState(false)

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

  const handlePublish = () => {
    onPublish()
  }

  const handleClick = () => {
    setVisible(true)
  }

  const handleClose = () => {
    setVisible(false)
  }

  const handleSubmit = async (yid) => {
    const group = 'Z0pKmfYxMLw6RD7RMfN4'

    const gid = firestore
      .collection('groups')
      .doc(group)

    const query = await firestore
      .collection('videos')
      .where('yid', '==', yid)
      .where('gid', '==', gid)
      .get()

    const batch = firestore.batch()
    const r0 = firestore.collection('videos').doc()
    const r1 = query.empty ? r0 : query.docs[0].ref
    batch.set(r1, { yid, gid })
    const r2 = firestore.collection('v1').doc()
    batch.set(r2, { gid, vid: r1, '#': items.length })
    return batch.commit()
  }

  return (
    <Paper>
      <Button onClick={handlePublish}>
        Publish
      </Button>

      <SortableContainer
        className={classes.root}
        items={items}
        onSortEnd={handleSortEnd}
        distance={2}
        lockAxis='y'
      />

      <AddDialog
        open={visible}
        onSubmit={(value) => { handleClose() || handleSubmit(value) }}
        onClose={handleClose}
      />
    </Paper>
  )
}
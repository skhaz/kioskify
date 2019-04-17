import React, { useState, useEffect } from 'react'

import { makeStyles } from '@material-ui/styles'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import AddIcon from '@material-ui/icons/Add'
import Fab from '@material-ui/core/Fab'

import { debounce } from 'throttle-debounce'
import { DragDropContext } from 'react-beautiful-dnd'
import firebase from './firebase'

import AddDialog from './AddDialog'
import DroppableList from './DroppableList'

const initialData = {
  visible: false,

  videos: {},

  columns: {
    'column-1': {
      id: 'column-1',
      ids: [
      ]
    },

    'column-2': {
      id: 'column-2',
      ids: [
      ]
    }
  },
  /*

  tasks: {
    'task-1': { id: 'task-1', primary: 'content 1', secondary: 1 },
    'task-2': { id: 'task-2', primary: 'content 2', secondary: 2 },
    'task-3': { id: 'task-3', primary: 'content 3', secondary: 3 },
    'task-4': { id: 'task-4', primary: 'content 4', secondary: 4 },
    'task-5': { id: 'task-5', primary: 'content 5', secondary: 5 },
    'task-6': { id: 'task-6', primary: 'content 6', secondary: 6 },
    'task-7': { id: 'task-7', primary: 'content 7', secondary: 7 },
    'task-8': { id: 'task-8', primary: 'content 8', secondary: 8 },
    'task-9': { id: 'task-9', primary: 'content 9', secondary: 9 },
    'task-10': { id: 'task-10', primary: 'content 10', secondary: 10 },
    'task-11': { id: 'task-11', primary: 'content 11', secondary: 11 },
    'task-12': { id: 'task-12', primary: 'content 12', secondary: 12 },
    'task-13': { id: 'task-13', primary: 'content 13', secondary: 13 },
    'task-14': { id: 'task-14', primary: 'content 14', secondary: 14 },
    'task-15': { id: 'task-15', primary: 'content 15', secondary: 15 },
    'task-16': { id: 'task-16', primary: 'content 16', secondary: 16 }
  },

  columns: {
    'column-1': {
      id: 'column-1',
      title: 'title 1',
      taskIds: [
        'task-1',
        'task-2',
        'task-3',
        'task-4',
        'task-5',
        'task-6',
        'task-7',
        'task-8',
        'task-9',
        'task-10',
        'task-11',
        'task-12',
        'task-13',
        'task-14',
        'task-15',
        'task-16'
      ]
    },
    'column-2': {
      id: 'column-2',
      title: 'title 2',
      taskIds: []
    }
  }
  */
}

const useStyles = makeStyles(theme => ({
  fab: {
    position: 'absolute',
    bottom: theme.spacing.unit * 2,
    right: theme.spacing.unit * 4
  }
}))

const firestore = firebase.firestore()

export default () => {

  const [state, setState] = useState(initialData)

  useEffect(() => {
    const unsubscribe = firestore
      .collection('videos')
      .onSnapshot((querySnapshot) => {
        const videos = {}
        querySnapshot.forEach(doc => videos[doc.id] = { id: doc.id, ...doc.data() })
        // setVideos(arr)

        const newState = {
          ...state,
          videos,
          columns: {
            ...state.columns,
            'column-1': {
              ...state.columns['column-1'],
              ids: Object.keys(videos)
            }
          }
        }

        setState(newState)
      })

    return () => {
      unsubscribe()
    }
  }, [])

  /*

  // const [videos, setVideos] = useState({})

  // const [playlist, setPlaylist] = useState({})

  useEffect(() => {
    const unsubscribe = firestore
      .collection('v1')
      .where('gid', '==', group)
      .orderBy('#')
      .onSnapshot((querySnapshot) => {
        const arr = []

        querySnapshot.forEach(doc => {
          const { vid: { id: vid }, '#': index } = doc.data()

          const { id } = doc

          arr.push({ id, vid, index })
        })

        setPlaylist(arr)

      })

    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    const newState = {
      ...state,
      videos,
      columns: {
        ...state.columns,
        'column-1': {
          ...state.columns['column-1'],
          ids: Object.keys(videos)
        }
      }
    }

    setState(newState)
  }, [videos, playlist])

  const onPublish = debounce(300, async () => {
    const batch = firestore.batch()

    state.items.forEach(({ id }, index) => {
      batch.update(firestore.collection('v1').doc(id), { '#': index })
    })

    return batch.commit()
  })
  */

  const onDragEnd = result => {
    const { source, destination, draggableId } = result

    console.log('#onDragEnd', source, destination, draggableId)

    if (!destination) {
      return
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return
    }

    const start = state.columns[source.droppableId]
    const finish = state.columns[destination.droppableId]

    if (start === finish) {
      const column = state.columns[source.droppableId]
      const newTasksIds = Array.from(column.ids)
      newTasksIds.splice(source.index, 1)
      newTasksIds.splice(destination.index, 0, draggableId)

      const newColumn = {
        ...start,
        ids: newTasksIds
      }

      const newState = {
        ...state,
        columns: {
          ...state.columns,
          [newColumn.id]: newColumn
        }
      }

      setState(newState)
      return
    }

    const startTaskId = Array.from(start.ids)
    startTaskId.splice(source.index, 1)
    const newStart = {
      ...start,
      ids: startTaskId
    }

    const finishTaskIds = Array.from(finish.ids)
    finishTaskIds.splice(destination.index, 0, draggableId)
    const newFinish = {
      ...finish,
      ids: finishTaskIds
    }

    const newState = {
      ...state,
      columns: {
        ...state.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish
      }
    }

    setState(newState)

    /*
    const start = state.columns[source.droppableId]
    const finish = state.columns[destination.droppableId]
  
    if (start === finish) {
      const column = state.columns[source.droppableId]
      const newTasksIds = Array.from(column.taskIds)
      newTasksIds.splice(source.index, 1)
      newTasksIds.splice(destination.index, 0, draggableId)
  
      const newColumn = {
        ...start,
        taskIds: newTasksIds
      }
  
      const newState = {
        ...state,
        columns: {
          ...state.columns,
          [newColumn.id]: newColumn
        }
      }
  
      setState(newState)
      return
    }
  
    const startTaskId = Array.from(start.taskIds)
    startTaskId.splice(source.index, 1)
    const newStart = {
      ...start,
      taskIds: startTaskId
    }
  
    const finishTaskIds = Array.from(finish.taskIds)
    finishTaskIds.splice(destination.index, 0, draggableId)
    const newFinish = {
      ...finish,
      taskIds: finishTaskIds
    }
  
    const newState = {
      ...state,
      columns: {
        ...state.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish
      }
    }
  
    setState(newState)
  */
  }

  const handleSubmit = async yid => {
    const group = 'Z0pKmfYxMLw6RD7RMfN4'

    const gid = firestore.collection('groups').doc(group)

    const query = await firestore
      .collection('videos')
      .where('yid', '==', yid)
      .where('gid', '==', gid)
      .limit(1)
      .get()

    const batch = firestore.batch()
    const r0 = firestore.collection('videos').doc()
    const r1 = query.empty ? r0 : query.docs[0].ref
    batch.set(r1, { yid, gid }, { merge: true })
    const r2 = firestore.collection('v1').doc()
    batch.set(r2, { gid, vid: r1, '#': 0 })
    return batch.commit()
  }

  const handleClose = () => {
    setState({ ...state, visible: false })
  }

  const classes = useStyles()

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Grid container spacing={8}>
        <Grid item xs>
          <Paper>
            <DroppableList
              key={state.columns['column-1'].id}
              column={state.columns['column-1']}
              items={state.columns['column-1'].ids.map(
                id => state.videos[id]
              )}
            />
          </Paper>
        </Grid>
        <Grid item xs>
          <Paper>
            <DroppableList
              key={state.columns['column-2'].id}
              column={state.columns['column-2']}
              items={state.columns['column-2'].ids.map(
                id => state.videos[id]
              )}
            />
          </Paper>
        </Grid>

        {/*
        <Grid item xs>
          <Paper>
            <DroppableList
              key={state.columns['column-1'].id}
              column={state.columns['column-1']}
              items={state.columns['column-1'].taskIds.map(
                taskId => state.tasks[taskId]
              )}
            />
          </Paper>
        </Grid>
        <Grid item xs>
          <Paper>
            <DroppableList
              key={state.columns['column-2'].id}
              column={state.columns['column-2']}
              items={state.columns['column-2'].taskIds.map(
                taskId => state.tasks[taskId]
              )}
            />
          </Paper>
        </Grid>
      */}
      </Grid>

      <AddDialog
        open={state.visible}
        onSubmit={value => {
          handleClose() || handleSubmit(value)
        }}
        onClose={handleClose}
      />

      <Fab
        color='secondary'
        className={classes.fab}
        onClick={() => setState({ ...state, visible: true })}
      >
        <AddIcon />
      </Fab>

    </DragDropContext>
  )
}

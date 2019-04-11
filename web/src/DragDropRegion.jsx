import React, { useState } from 'react'

import { makeStyles } from '@material-ui/styles'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import { DragDropContext } from 'react-beautiful-dnd'

import DroppableList from './DroppableList'

const initialData = {
  tasks: {
    'task-1': { id: 'task-1', primary: 'content 1', secondary: 1},
    'task-2': { id: 'task-2', primary: 'content 2', secondary: 2},
    'task-3': { id: 'task-3', primary: 'content 3', secondary: 3},
    'task-4': { id: 'task-4', primary: 'content 4', secondary: 4},
    'task-5': { id: 'task-5', primary: 'content 5', secondary: 5},
    'task-6': { id: 'task-6', primary: 'content 6', secondary: 6},
    'task-7': { id: 'task-7', primary: 'content 7', secondary: 7},
  },
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'title 1',
      taskIds: ['task-1', 'task-2', 'task-3', 'task-4', 'task-5', 'task-6', 'task-7'],
    },
    'column-2': {
      id: 'column-2',
      title: 'title 2',
      taskIds: [],
    }
  }
}

const useStyles = makeStyles(theme => {
  return {
    root: {
      flexGrow: 1,
      minHeight: '100vh' 
    }
  }
})

export default () => {

  const classes = useStyles()

  const [state, setState] = useState(initialData)

  const onDragEnd = result => {
    const { source, destination, draggableId } = result

    if (!destination) {
      return
    }

    if (source.droppableId === destination.droppableId
      && source.index === destination.index) {
        return
      }
    
    const start = state.columns[source.droppableId]
    const finish = state.columns[destination.droppableId]

    if (start === finish) {
      const column = state.columns[source.droppableId]
      const newTasksIds = Array.from(column.taskIds)
      newTasksIds.splice(source.index, 1)
      newTasksIds.splice(destination.index, 0, draggableId)
  
      const newColumn = {
        ...start,
        taskIds: newTasksIds,
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
      taskIds: startTaskId,
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
        [newFinish.id]: newFinish,
      }
    }

    setState(newState)
  }

  return (
    <div className={classes.root}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Grid container spacing={8}>
          <Grid item xs>
            <Paper>
              <DroppableList
                key={state.columns['column-1'].id}
                column={state.columns['column-1']}
                items={state.columns['column-1'].taskIds.map(taskId => state.tasks[taskId])} />
            </Paper>
          </Grid>
          <Grid item xs>
            <Paper>
              <DroppableList
                key={state.columns['column-2'].id}
                column={state.columns['column-2']}
                items={state.columns['column-2'].taskIds.map(taskId => state.tasks[taskId])} />
            </Paper>
          </Grid>
        </Grid>
      </DragDropContext>
    </div>
  )
}

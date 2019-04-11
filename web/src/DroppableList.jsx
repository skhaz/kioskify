import React from 'react'

import { Droppable } from 'react-beautiful-dnd'

import { makeStyles } from '@material-ui/styles'
import RootRef from '@material-ui/core/RootRef'
import List from '@material-ui/core/List'

import DraggableItem from './DraggableItem'

const useStyles = makeStyles(theme => {
  return {
    list: {
      overflow: 'auto',
      minHeight: '100vh',
    }
  }
})

export default ({ column, items }) => {

  const classes = useStyles()

  const stylize = isDraggingOver => ({
    background: isDraggingOver ? 'lightgrey' : 'white'
  })

  return (
    <Droppable droppableId={column.id}>
      {(provided, snapshot) => (
        <RootRef rootRef={provided.innerRef}>
          <List className={classes.list} style={stylize(snapshot.isDraggingOver)}>
            {items.map((item, index) => (
              <DraggableItem key={item.id} item={item} index={index} />
            ))}
            {provided.placeholder}
          </List>
        </RootRef>
      )}
    </Droppable>
  )
}

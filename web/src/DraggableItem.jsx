import React from 'react'

import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'

import { Draggable } from 'react-beautiful-dnd'

export default ({ item, index }) => {

  const stylize = (isDragging, draggableStyle) => ({
    ...draggableStyle,

    ...(isDragging && {
      background: 'grey'
    })
  })

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={stylize(
            snapshot.isDragging,
            provided.draggableProps.style
          )}
        >
          <ListItem button>
            <ListItemText
              primary={item.title}
              secondary={item.duriationInSec}
            />
          </ListItem>
        </div>
      )}
    </Draggable>
  )
}

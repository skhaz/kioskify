import React from 'react'

import { Draggable } from 'react-beautiful-dnd'

import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'

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
          <ListItem>
            <ListItemText
              primary={item.primary}
              secondary={item.secondary}
            />
          </ListItem>
        </div>
      )}
    </Draggable>
  )
}

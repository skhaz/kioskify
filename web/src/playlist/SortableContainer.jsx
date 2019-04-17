import React, { useState } from "react"

import { makeStyles } from '@material-ui/styles'
import List from "@material-ui/core/List"

import { sortableContainer } from "react-sortable-hoc"

import SortableElement from "./SortableElement"

const useStyles = makeStyles({
  list: {
    overflowY: 'auto',
    overflowX: 'hidden',
    height: 'calc(100vh - 96pt)'
  }
})

export default sortableContainer(({ items, onClick }) => {

  const [selected, setSelected] = useState()

  const classes = useStyles()

  const handleClick = item => {
    setSelected(item) || (onClick && onClick(item))
  }

  return (
    <List
      disablePadding
      className={classes.list}
    >
      {items && items.map((item, index) => (
        <SortableElement
          index={index}
          value={item}
          key={item.id}
          selected={selected === item}
          onClick={handleClick}
        />
      ))}
    </List>
  )
})

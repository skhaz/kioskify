import React, { useState } from "react"

import { makeStyles } from '@material-ui/styles'
import List from "@material-ui/core/List"

import { sortableContainer } from "react-sortable-hoc"

import SortableElement from "./SortableElement"

const useStyles = makeStyles(theme => ({
  list: {
    overflowY: 'scroll',
    overflowX: 'hidden',
    height: 'calc(100vh - 124pt)',
  },
}))

const SortableList = props => {
  const [selected, setSelected] = useState()

  const { items, onClick } = props

  const classes = useStyles()

  const handleClick = item => {
    setSelected(item) || (onClick && onClick(item))
  }

  return (
    <List className={classes.list}>
      {items.map((item, index) => (
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
}

export default sortableContainer(SortableList)
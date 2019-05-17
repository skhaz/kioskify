import React, { useState } from 'react';
import { sortableContainer } from 'react-sortable-hoc';
import { makeStyles } from '@material-ui/styles';
import List from '@material-ui/core/List';
import SortableElement from './SortableElement';

const useStyles = makeStyles({
  root: {
    overflowY: 'auto',
    overflowX: 'hidden',
    height: 'calc(100vh - 96pt)',
    backgroundColor: '#f8f8f8'
  }
});

export default sortableContainer(({ items, onClick }) => {
  const [selected, setSelected] = useState();

  const classes = useStyles();

  const handleClick = item => {
    setSelected(item) || (onClick && onClick(item));
  };

  return (
    <>
      <List disablePadding className={classes.root}>
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
    </>
  );
});

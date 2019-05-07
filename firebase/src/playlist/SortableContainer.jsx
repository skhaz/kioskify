import React, { useState } from 'react';
import { sortableContainer } from 'react-sortable-hoc';
import { makeStyles } from '@material-ui/styles';
import List from '@material-ui/core/List';
import Popover from '@material-ui/core/Popover';
import Menu from '@material-ui/core/Popover';
import MenuItem from '@material-ui/core/MenuItem';
import SortableElement from './SortableElement';

const useStyles = makeStyles({
  list: {
    overflowY: 'auto',
    overflowX: 'hidden',
    height: 'calc(100vh - 96pt)',
    backgroundColor: '#f8f8f8'
  }
});

export default sortableContainer(({ items, onClick, onDelete }) => {
  const [selected, setSelected] = useState();

  const [anchorEl, setAnchorEl] = useState(null);

  const classes = useStyles();

  const handleClick = item => {
    setSelected(item) || (onClick && onClick(item));
  };

  const handleClose = () => setAnchorEl(null);

  const handleRightClick = el => setAnchorEl(el);

  return (
    <>
      <List disablePadding className={classes.list}>
        {items.map((item, index) => (
          <SortableElement
            index={index}
            value={item}
            key={item.id}
            selected={selected === item}
            onClick={handleClick}
            onRightClick={handleRightClick}
          />
        ))}
      </List>
      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={onDelete}>Delete</MenuItem>
      </Popover>
    </>
  );
});

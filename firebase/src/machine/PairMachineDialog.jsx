import React, { useState, useEffect, useRef } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import withMobileDialog from '@material-ui/core/withMobileDialog';

export default withMobileDialog()(props => {

  const { fullScreen, open, onClose, onSubmit } = props;

  const [value, setValue] = useState('');

  const [error, setError] = useState(false);

  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    setError(!value);
  }, [value]);

  const handleChange = event => {
    const { target: { value } } = event;

    setValue(value);
  };

  const handleSubmit = () => {
    if (error || !value) {
      return;
    }

    onSubmit(value);
  };

  const handleKeyPress = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog fullScreen={fullScreen} open={open} onClose={onClose}>
      <DialogTitle>Subscribe</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To subscribe to this website, please enter your email address here. We
          will send updates occasionally.
        </DialogContentText>
        <TextField
          margin='dense'
          id='name'
          label=''
          error={error}
          fullWidth
          autoFocus
          onChange={handleChange}
          onKeyPress={handleKeyPress}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='primary'>
          Cancel
        </Button>
        <Button
          color='primary'
          onClick={handleSubmit}
          disabled={error || !value}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
});

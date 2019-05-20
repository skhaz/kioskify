import React, { useState, useEffect, useRef } from 'react';
import urlParser from 'js-video-url-parser';
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

  const [yid, setYid] = useState('');

  const [error, setError] = useState(false);

  const firstRun = useRef(true);

  const inputRef = useRef(null);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    setError(!yid);
  }, [yid]);

  const handleChange = event => {
    const { target: { value } } = event;

    const { id } = urlParser.parse(value) || {};

    setYid(id);
  };

  const handleSubmit = () => {
    if (error || !yid) {
      return;
    }

    onSubmit(yid);
  };

  const handleKeyPress = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleClick = ({ yid }) => {
    inputRef.current.value = `https://www.youtube.com/watch?v=${yid}`;

    setYid(yid);
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
          type='url'
          inputRef={inputRef}
          error={error}
          placeholder={'https://www.youtube.com/watch?v=...'}
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
        <Button color='primary' onClick={handleSubmit} disabled={error || !yid}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
});
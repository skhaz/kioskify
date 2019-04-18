import React, { useState } from 'react'
import withMobileDialog from '@material-ui/core/withMobileDialog'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import ReactPlayer from 'react-player'

const VideoPreview = (props) => {

  const { fullScreen, open, onClose, url, title } = props

  const [controls, setControls] = useState(false)

  const handleClose = () => {
    setControls(false) || onClose()
  }

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={handleClose}
    >
      {open && (
        <>
          <DialogTitle>
            {title}
          </DialogTitle>
          <ReactPlayer
            onClick={() => setControls(true)}
            playing
            muted
            controls={controls}
            width='100%'
            url={url}
          />
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}

export default withMobileDialog()(VideoPreview)

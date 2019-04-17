import React, { useState } from 'react'

import { makeStyles } from '@material-ui/styles'
import withMobileDialog from '@material-ui/core/withMobileDialog'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

import ReactPlayer from 'react-player'

const VideoPreview = (props) => {

  const { fullScreen, open, onClose, url, title } = props

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={onClose}
    >
      {open && (
        <>
          <DialogTitle>
            {title}
          </DialogTitle>
          <ReactPlayer
            playing
            muted
            width='100%'
            url={url}
          />
          <DialogActions>
            <Button onClick={onClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}

export default withMobileDialog()(VideoPreview)

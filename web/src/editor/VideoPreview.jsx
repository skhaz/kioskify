import React, { useState } from 'react'

import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'

import ReactPlayer from 'react-player'


export default () => {

  return (
    <Dialog
      open
      onClose={() => console.log('close')}
    >
      <ReactPlayer muted playing width={'100%'} height={'100%'} url='https://gcs.kioskify.app/Z0pKmfYxMLw6RD7RMfN4/vsmQKSQpNFKKU8KuziuM.mp4' />
    </Dialog>
  )
}


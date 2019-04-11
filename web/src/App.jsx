import React from 'react'

import { ThemeProvider } from '@material-ui/styles'
import { createMuiTheme } from '@material-ui/core/styles'
import primary from '@material-ui/core/colors/teal'
import secondary from '@material-ui/core/colors/indigo'

import DragDropRegion from './DragDropRegion'

export default () => {
  const theme = createMuiTheme({
    palette: {
      primary,
      secondary,
    },
    typography: {
      useNextVariants: true,
    },
  })

  return (
    <ThemeProvider theme={theme}>
      <DragDropRegion />
    </ThemeProvider>
  )
}

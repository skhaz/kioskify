import React from 'react'

import { ThemeProvider } from '@material-ui/styles'
import { createMuiTheme } from '@material-ui/core/styles'

import MyComponent from './MyComponent'

export default () => {
  const theme = createMuiTheme({
    typography: {
      useNextVariants: true,
    },
  })
  
  return (
    <ThemeProvider theme={theme}>
      <MyComponent />
    </ThemeProvider>
  )
}

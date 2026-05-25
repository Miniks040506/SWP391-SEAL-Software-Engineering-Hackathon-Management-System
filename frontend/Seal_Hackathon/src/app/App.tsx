import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';
export default function App() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <RouterProvider router={router} />
      </ThemeProvider>
    </>
  )
}

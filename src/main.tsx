import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import '@mantine/core/styles.css';
import './index.css'
import { createTheme, MantineProvider } from '@mantine/core';

const queryClient = new QueryClient()
const theme = createTheme({
  fontFamily: 'Inter, sans-serif',
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider forceColorScheme='dark' theme={theme}>
        <App />
      </MantineProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)

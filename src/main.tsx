import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { MantineProvider, v8CssVariablesResolver } from '@mantine/core'
import '@fontsource-variable/inter'
import '@mantine/core/styles.css'
import './index.css'
import App from './App.tsx'
import { theme } from './theme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: Infinity,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* Mantine 9 made `light` variants solid; keep the translucent tint the
          dashboard was designed with (muted alert surfaces on graphite). */}
      <MantineProvider forceColorScheme="dark" theme={theme} cssVariablesResolver={v8CssVariablesResolver}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </MantineProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)

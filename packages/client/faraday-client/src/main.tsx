/// <reference types="react/canary" />
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  RouterProvider,
} from "react-router-dom";
import './index.css'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import StateProvider from './state/AppStateProvider.tsx';
import { router } from './router.tsx';
import { PersistentAudioPlayer } from './components/PersistentAudioPlayer/index.tsx';

const queryClient = new QueryClient()


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <StateProvider>
        <PersistentAudioPlayer />
        <RouterProvider router={router} />
      </StateProvider>
    </QueryClientProvider>
  </StrictMode>,
)

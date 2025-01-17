/// <reference types="react/canary" />
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  RouterProvider,
} from "react-router-dom";
import './index.css'
import StateProvider from './state/AppStateProvider.tsx';
import { router } from './router.tsx';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StateProvider>
      <RouterProvider router={router} />
    </StateProvider>
  </StrictMode>,
)

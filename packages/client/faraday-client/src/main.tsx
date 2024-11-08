import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from './App.tsx'
import './index.css'
import StateProvider from './state/AppStateProvider.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/redirected",
    element:<App />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StateProvider>
      <RouterProvider router={router} />
    </StateProvider>
  </StrictMode>,
)

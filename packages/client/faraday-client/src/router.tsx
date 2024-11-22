import {
  createBrowserRouter,
} from "react-router-dom";
import App from './App.tsx'

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/redirected",
    element:<App redirected/>,
  },
]);

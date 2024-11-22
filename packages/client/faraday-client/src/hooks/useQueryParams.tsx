import { useLocation } from 'react-router-dom';

function useQuery() {
  const { search, pathname  } = useLocation();
  return {
    searchParams: new URLSearchParams(search),
    pathname: pathname
  };
}

export default useQuery
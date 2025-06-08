import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    window.location.replace('/docs/decoy');
  }, []);

  return null; // or a loading spinner if you want
}

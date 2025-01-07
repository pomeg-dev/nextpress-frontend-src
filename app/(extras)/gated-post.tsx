"use client";

import { getLoginStatus } from '@/lib/wp/user-flow';
import { getCookie } from '@/utils/cookies';
import { useEffect, useState } from 'react';

export function GatedPost({ settings }: { settings: any }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = getCookie('jwt_token');
    if (token) {
      getLoginStatus(token)
        .then((response) => {
          console.log('test', response);
          setIsLoggedIn(response.success);
        })
        .catch((err) => console.log(err));;
    } else {
      setIsLoggedIn(false);
      setLoading(false);
    }
  }, []);

  return (
    <>TEST</>
  );
}
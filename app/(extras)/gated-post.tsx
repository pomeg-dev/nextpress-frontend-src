"use client";

import { getLoginStatus } from '@/lib/wp/user-flow';
import { getCookie } from '@/utils/cookies';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function GatedPost({ settings }: { settings: any }) {
  const router = useRouter();

  useEffect(() => {
    let loginPage = settings?.login_page?.path ?? '/login';
    loginPage = loginPage.endsWith('/') ? loginPage.slice(0, -1) : loginPage;
    let registerPage = settings?.register_page?.path ?? '/register';
    registerPage = registerPage.endsWith('/') ? registerPage.slice(0, -1) : registerPage;
    const currentUrl = window.location.href;
    if (currentUrl.includes(loginPage) || currentUrl.includes(registerPage)) {
      return;
    }

    const url = new URL(loginPage, window.location.origin);
    const existingReferrer = url.searchParams.get('referrer');
    if (!existingReferrer) {
      url.searchParams.set('referrer', currentUrl);
    }

    const token = getCookie('jwt_token');
    if (token) {
      getLoginStatus(token)
        .then((response) => {
          if (!response.success) {
            router.push(url.toString());
          }
        })
        .catch((err) => console.log(err));
    } else {
      router.push(url.toString());
    }
  }, [router, settings]);

  return (
    <></>
  );
}
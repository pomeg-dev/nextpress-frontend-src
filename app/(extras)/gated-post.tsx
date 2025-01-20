"use client";

import { authOptions } from '@/lib/authOptions';
import { Post } from '@/lib/types';
import { Login } from '@themes/pomedash/blocks/login';
import { getServerSession } from 'next-auth';
import { SessionProvider, useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

interface GatedProps {
  settings: any;
  post: Post;
  children: React.ReactNode;
}

export function GatedPost({
  settings,
  post,
  children,
}: GatedProps) {
  return (
    <SessionProvider>
      <GatedPostContent settings={settings} post={post}>
        {children}
      </GatedPostContent>
    </SessionProvider>
  );
}

export function GatedPostContent({
  settings,
  post,
  children,
}: GatedProps) {
  const [isGated, setIsGated] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { data: session } = useSession();

  // Get settings vars.
  const isSettingsGated = settings?.enable_login_redirect;
  const loginPage = settings?.login_page;
  const props = loginPage && loginPage.content && loginPage.content.length > 0 ?
    loginPage.content[0] :
    { data: {heading: "Login"} };

  useEffect(() => {
    setIsGated(isSettingsGated);
    if (session) {
      setIsLoggedIn(true);
    }
  }, [session, isSettingsGated]);

  return (
    <>
      {isGated && !isLoggedIn ? (
        <Login {...props} />
      ) : (
        <>{children}</>
      )}
    </>
  );
}
"use client";

import { logout } from "@/lib/wp/user-flow";
import { Session } from "next-auth";
import { useSession, signOut, SessionProvider, } from "next-auth/react";
import { useEffect, useState } from "react";

interface ExtendedUser extends Session {
  id: number;
  blog_id: string;
  blog_url: string;
  is_admin: boolean;
  token: string;
}

export function NPAdminBar({ postID }: { postID: number }) {
  return (
    <SessionProvider>
      <NPAdminBarContent postID={postID} />
    </SessionProvider>
  );
}

function NPAdminBarContent({ postID }: { postID: number }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState(0);
  const [userName, setUserName] = useState('');
  const [blogUrl, setBlogUrl] = useState('');
  const [blogId, setBlogId] = useState('');
  const [token, setToken] = useState('');
  const { data: session } = useSession();

  const handleLogout = () => {
    logout()
    signOut();
  };

  useEffect(() => {
    if (session && session.user) {
      const user = session.user as ExtendedUser;
      setLoggedIn(true);
      setUserId(user.id);
      setUserName(session.user.name ?? '');
      setBlogId(user.blog_id);
      setBlogUrl(user.blog_url);
      setIsAdmin(user.is_admin);
      setToken(user.token);
    }
  }, [session]);

  if (!loggedIn || !isAdmin) return null;

  return (
    <div className="np-admin-bar fixed bottom-0 left-0 z-50 flex w-full justify-between bg-[#0073aa] px-8 py-2 text-center text-white">
      <div>
        <span>
          Site: {blogId} | User ID: {userId} ({userName})
        </span>
        <a
          href={`${blogUrl}/wp-admin?token=${token}`}
          className="ml-4 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Dashboard
        </a>
        <a
          href={
            `${blogUrl}/wp-admin/post.php?post=${postID}&action=edit&token=${token}`
          }
          className="ml-4 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Edit this page on Site {blogId}
        </a>
      </div>
      <span className="cursor-pointer underline" onClick={() => handleLogout()}>Logout</span>
    </div>
  );
}

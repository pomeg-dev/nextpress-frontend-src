"use client";

import { getLoginStatus, logout } from "@/lib/wp/user-flow";
import { deleteWPCookies, getCookie } from "@/utils/cookies";
import { useEffect, useState } from "react";

export function NPAdminBar({ postID }: { postID: number }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState(0);
  const [blogUrl, setBlogUrl] = useState('');
  const [blogId, setBlogId] = useState('');

  const handleLogout = () => {
    deleteWPCookies();
    logout();
    window.location.reload();
  };

  useEffect(() => {
    const token = getCookie('jwt_token');
    if (token) {
      getLoginStatus(token)
        .then((response) => {
          setLoggedIn(response.success);
          if (response.userId) {
            setUserId(response.userId);
          }
          if (response.blogUrl) {
            setBlogUrl(response.blogUrl);
          }
          if (response.blogId) {
            setBlogId(response.blogId);
          }
        })
        .catch((err) => console.log(err));
    } else {
      setLoggedIn(false);
    }
  }, []);

  if (!loggedIn) return null;

  return (
    <div className="np-admin-bar fixed bottom-0 left-0 z-50 flex w-full justify-between bg-[#0073aa] px-8 py-2 text-center text-white">
      <div>
        <span>
          Site: {blogId} | User ID: {userId}
        </span>
        <a
          href={`${blogUrl}/wp-admin`}
          className="ml-4 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Dashboard
        </a>
        <a
          href={
            `${blogUrl}/wp-admin/post.php?post=${postID}&action=edit`
          }
          className="ml-4 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Edit this page on Site {blogId}
        </a>
      </div>
      <span className="cursor-pointer underline" onClick={handleLogout}>Logout</span>
    </div>
  );
}

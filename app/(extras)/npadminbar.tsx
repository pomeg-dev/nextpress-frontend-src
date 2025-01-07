"use client";

import { getLoginStatus } from "@/lib/wp/user-flow";
import { getCookie } from "@/utils/cookies";
import { useEffect, useState } from "react";

export function NPAdminBar({ postID }: { postID: number }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState(0);
  const [blogUrl, setBlogUrl] = useState('');
  const [blogId, setBlogId] = useState('');

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
    <div className="np-admin-bar fixed bottom-0 left-0 z-50 w-full bg-[#0073aa] py-2 text-center text-white">
      <div style={{ marginBottom: "5px" }}>
        <span>
          Site {blogId} | User ID: {userId}
        </span>
        <a
          href={
            `${blogUrl}/wp-admin/post.php?post=${postID}&action=edit`
          }
          style={{
            color: "white",
            textDecoration: "underline",
            marginLeft: "10px",
          }}
          target="_blank"
          rel="noopener noreferrer"
        >
          Edit this page on Site {blogId}
        </a>
      </div>
    </div>
  );
}

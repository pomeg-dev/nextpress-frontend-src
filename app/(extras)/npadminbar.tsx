import { cookies } from "next/headers";

export function NPAdminBar({ postID }: { postID: number }) {
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();

  const nextpressCookies = allCookies.filter((cookie) =>
    cookie.name.startsWith("nextpress_wp_")
  );

  const decodedCookies = nextpressCookies
    .map((cookie) => {
      try {
        return JSON.parse(atob(cookie.value));
      } catch (e) {
        console.error(`Failed to parse ${cookie.name} cookie:`, e);
        return null;
      }
    })
    .filter(Boolean);

  if (decodedCookies.length === 0) return null;

  return (
    <div className="np-admin-bar fixed bottom-0 left-0 z-50 w-full bg-[#0073aa] py-2 text-center text-white">
      {decodedCookies.map((data, index) => (
        <div key={index} style={{ marginBottom: "5px" }}>
          <span>
            Site {data.blog_id} | User ID: {data.user_id}
          </span>
          <a
            href={
              data.edit_link ||
              `${data.wp_url}/wp-admin/post.php?post=${postID}&action=edit`
            }
            style={{
              color: "white",
              textDecoration: "underline",
              marginLeft: "10px",
            }}
            target="_blank"
            rel="noopener noreferrer"
          >
            Edit this page on Site {data.blog_id}
          </a>
        </div>
      ))}
    </div>
  );
}

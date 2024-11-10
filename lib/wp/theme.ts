import { WPQuery } from "lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

//route for getting /wp-json/nextpress/block_theme
export async function getBlockTheme() {
  const url = `${API_URL}/wp-json/nextpress/block_theme`;

  const response = await fetch(url, {
    method: "GET",
    next: { tags: ["block_theme"] },
    cache: "no-cache",
  });

  if (!response.ok) {
    console.log(url);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const res = await response.json();
  return res;
}

// export async function getPosts(params: GetPostsParams = {}) {
//   const queryParams = new URLSearchParams();

//   // List of parameters that should be comma-separated when they're arrays
//   const commaSeparatedParams = ["post__in", "category", "tag"]; // Add more as needed

//   // Add each parameter to the query string if it's defined
//   Object.entries(params).forEach(([key, value]) => {
//     if (value !== undefined) {
//       if (Array.isArray(value)) {
//         if (commaSeparatedParams.includes(key)) {
//           // Join array values with commas for specified parameters
//           queryParams.append(key, value.join(","));
//         } else {
//           // For other array parameters, keep the original behavior
//           value.forEach((item) => queryParams.append(key, item.toString()));
//         }
//       } else if (key === "include_content") {
//         // Convert boolean to 0 or 1 for include_content
//         queryParams.append(key, value ? "1" : "0");
//       } else {
//         queryParams.append(key, value.toString());
//       }
//     }
//   });

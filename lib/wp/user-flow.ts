const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface LoginParams {
  user_login: FormDataEntryValue | null;
  user_password: FormDataEntryValue | null
  remember: FormDataEntryValue | null
}

export async function postLogin(params: LoginParams) {
  const url = `${API_URL}/wp-json/nextpress/login`;

  const response = await fetch(url, {
    method: "POST",
    next: { tags: ["users"] },
    cache: "no-store",
    body: JSON.stringify(params),
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    console.log(url);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const res = await response.json();
  return res;
}
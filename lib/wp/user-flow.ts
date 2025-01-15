const WP_API_URL = process.env.NEXT_PUBLIC_API_URL;
const FE_API_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;

export async function getLoginStatus(token: string) {
  const res = await fetch(`${FE_API_URL}/user-flow/login-verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    cache: "no-store",
    next: { tags: ["users"] },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch user flow status');
  }

  return res.json();
}

export async function logout() {
  const res = await fetch(`${FE_API_URL}/user-flow/logout`, {
    method: 'GET',
    cache: "no-store",
    next: { tags: ["users"] },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch user flow status');
  }

  return res.json();
}

interface LoginParams {
  user_login: string | FormDataEntryValue | null;
  user_password: string | FormDataEntryValue | null;
  remember: string | boolean | FormDataEntryValue | null;
  referrer: string | null;
}

export async function postLogin(params: LoginParams) {
  const url = `${WP_API_URL}/wp-json/nextpress/login`;

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

export async function requestPasswordReset(email: FormDataEntryValue | null) {
  const url = `${WP_API_URL}/wp-json/nextpress/request-reset`;

  const response = await fetch(url, {
    method: "POST",
    next: { tags: ["users"] },
    cache: "no-store",
    body: JSON.stringify({ email }),
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

interface ResetParams {
  key: string | null;
  login: string | null;
  password: FormDataEntryValue | null;
}

export async function resetPassword(params: ResetParams) {
  const url = `${WP_API_URL}/wp-json/nextpress/reset-password`;

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

interface RegisterParams {
  username: FormDataEntryValue | null;
  email: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
}

export async function registerUser(params: RegisterParams) {
  const url = `${WP_API_URL}/wp-json/nextpress/register`;

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
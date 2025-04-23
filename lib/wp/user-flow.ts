const WP_API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function logout() {
  const url = `${WP_API_URL}/wp-json/nextpress/logout`;

  const response = await fetch(url, {
    method: "GET",
    next: { tags: ["users"] },
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    console.log(url);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const res = await response.json();
  return res;
}

interface LoginParams {
  user_login: string | FormDataEntryValue | null;
  user_password: string | FormDataEntryValue | null;
  remember: string | boolean | FormDataEntryValue | null;
}

export async function postLogin(params: LoginParams) {
  const url = `${WP_API_URL}/wp-json/nextpress/login`;
  console.log('url', url);

  const response = await fetch(url, {
    method: "POST",
    next: { tags: ["users"] },
    cache: "no-store",
    body: JSON.stringify(params),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
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
      "Content-Type": "application/json",
    },
    credentials: "include",
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
      "Content-Type": "application/json",
    },
    credentials: "include",
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
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    console.log(url);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const res = await response.json();
  return res;
}

interface GetMetaResponse {
  metaValue: any;
  success: boolean;
}

export async function getMeta(
  userId: number,
  metaKey: string
): Promise<GetMetaResponse> {
  const url = `${WP_API_URL}/wp-json/nextpress/get-meta/${userId}/${metaKey}`;
  console.log(url);
  const response = await fetch(url, {
    method: "GET",
    next: { tags: ["users"] },
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    console.log(url);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const res = await response.json();
  return res;
}

export async function saveMeta(
  userId: number,
  metaKey: string,
  metaValue: any
) {
  const url = `${WP_API_URL}/wp-json/nextpress/save-meta`;

  const response = await fetch(url, {
    method: "POST",
    next: { tags: ["users"] },
    cache: "no-store",
    body: JSON.stringify({ userId, metaKey, metaValue }),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (!response.ok) {
    console.log(url);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const res = await response.json();
  return res;
}

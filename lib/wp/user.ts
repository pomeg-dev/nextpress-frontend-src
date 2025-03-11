const WP_API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Interface for meta response objects
 */
interface MetaResponse {
  metaValue: any;
  success: boolean;
}

/**
 * Interface for WordPress user meta entities
 */
interface UserMeta {
  id: number;
  userId: number;
  metaKey: string;
  metaValue: any;
}

// In-memory store for development/demo purposes
// In production, this would use WordPress REST API calls
let metaStore: UserMeta[] = [];

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

interface GetUserMetaResponse {
  metaValue: any;
  success: boolean;
}

export async function getUserMeta(
  userId: number,
  metaKey: string
): Promise<GetUserMetaResponse> {
  const url = `${WP_API_URL}/wp-json/nextpress/get-user-meta/${userId}/${metaKey}`;
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

/**
 * Get all meta values for a user
 * @param userId User ID to get meta for
 * @returns Array of user meta objects
 */
export async function getAllUserMeta(userId: number): Promise<UserMeta[]> {
  try {
    // In a real implementation, this would call the WordPress REST API
    console.log(`Getting all meta for user ${userId}`);
    const url = `${WP_API_URL}/wp-json/nextpress/get-user-meta/${userId}`;
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
    // Filter meta for this user
    return metaStore.filter((m) => m.userId === userId);
  } catch (error) {
    console.error(`Failed to get all meta for user ${userId}:`, error);
    return [];
  }
}

export async function saveUserMeta(
  userId: number,
  metaKey: string,
  metaValue: any
) {
  const url = `${WP_API_URL}/wp-json/nextpress/save-user-meta`;

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

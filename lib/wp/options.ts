const WP_API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Interface for option response objects
 */
interface OptionResponse {
  optionValue: any;
  success: boolean;
}

/**
 * Interface for WordPress options entities
 */
interface WordPressOption {
  id: number;
  optionName: string;
  optionValue: any;
  autoload: string;
  success?: boolean;
}

// In-memory store for development/demo purposes
// In production, this would use WordPress REST API calls
let optionsStore: WordPressOption[] = [];

/**
 * Get a specific WordPress option
 * @param optionName Name of the option to retrieve
 * @returns OptionResponse with the option value and success status
 */
export async function getOption(optionName: string): Promise<OptionResponse> {
  const url = `${WP_API_URL}/wp-json/nextpress/get-option/${optionName}`;
  console.log(url);
  const response = await fetch(url, {
    method: "GET",
    next: { tags: ["options"] },
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
 * Get all WordPress options or options with specific prefix
 * @param prefix Optional prefix to filter options by
 * @returns Array of WordPress option objects
 */
export async function getAllOptions(
  prefix?: string
): Promise<WordPressOption[]> {
  try {
    console.log(`Getting all options${prefix ? ` with prefix ${prefix}` : ""}`);
    const url = prefix
      ? `${WP_API_URL}/wp-json/nextpress/get-options?prefix=${prefix}`
      : `${WP_API_URL}/wp-json/nextpress/get-options`;

    console.log(url);
    const response = await fetch(url, {
      method: "GET",
      next: { tags: ["options"] },
      cache: "no-store",
      credentials: "include",
    });

    if (!response.ok) {
      console.log(url);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const res = await response.json();
    return res;
  } catch (error) {
    console.error(`Failed to get options:`, error);
    return [];
  }
}

/**
 * Update or create a WordPress option
 * @param optionName Name of the option to save
 * @param optionValue Value to save for the option
 * @param autoload Whether to autoload the option (default: 'yes')
 * @returns OptionResponse with success status
 */
export async function updateOption(
  optionName: string,
  optionValue: any,
  autoload: string = "yes"
) {
  const url = `${WP_API_URL}/wp-json/nextpress/update-option`;
  const response = await fetch(url, {
    method: "POST",
    next: { tags: ["options"] },
    cache: "no-store",
    body: JSON.stringify({ optionName, optionValue, autoload }),
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

/**
 * Delete a WordPress option
 * @param optionName Name of the option to delete
 * @returns OptionResponse with success status
 */
export async function deleteOption(optionName: string) {
  const url = `${WP_API_URL}/wp-json/nextpress/delete-option`;

  const response = await fetch(url, {
    method: "POST",
    next: { tags: ["options"] },
    cache: "no-store",
    body: JSON.stringify({ optionName }),
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

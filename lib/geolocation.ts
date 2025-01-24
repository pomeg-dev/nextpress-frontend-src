const API_KEY = process.env.NEXT_PUBLIC_GEO_API_KEY;

export async function fetchCoordinatesWithGoogle(city: string, state: string) {
  const query = `${city}, ${state}`;
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${API_KEY}`
    );

    if (!response.ok) {
      console.error(`Error fetching data for ${query}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    } else {
      console.warn(`No coordinates found for ${query}`);
    }
  } catch (error) {
    console.error(`Error fetching coordinates for ${query}:`, error);
  }
}

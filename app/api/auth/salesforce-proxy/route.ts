// pages/api/auth/salesforce-proxy.js
export async function POST(req) {
  try {
    const { username, password } = await req.json();

    const tokenUrl =
      "https://orapharma--orapharmad.sandbox.my.salesforce.com/services/oauth2/token";

    const tokenBody = new URLSearchParams({
      grant_type: "password",
      client_id: process.env.SALESFORCE_CLIENT_ID,
      client_secret: process.env.SALESFORCE_CLIENT_SECRET,
      username: username,
      password: password + process.env.SALESFORCE_SECURITY_TOKEN, // Add security token on server side
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenBody,
    });

    const data = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return new Response(
        JSON.stringify({
          error: data.error,
          error_description: data.error_description,
        }),
        { status: tokenResponse.status }
      );
    }

    return new Response(
      JSON.stringify({
        access_token: data.access_token,
        instance_url: data.instance_url,
        id: data.id,
      })
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        error_description: error.message,
      }),
      { status: 500 }
    );
  }
}

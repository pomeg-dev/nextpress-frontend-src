import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    // Validate that the URL is from our WordPress backend
    const videoUrl = new URL(url);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const allowedHosts = [
      'localhost',
      apiUrl.replace('http://', '').replace('https://', '').split('/')[0],
    ].filter(Boolean);

    if (!allowedHosts.some(host => videoUrl.hostname === host)) {
      return NextResponse.json({ error: 'Unauthorized video source' }, { status: 403 });
    }

    // Handle range requests for video seeking
    const range = request.headers.get('range');
    const headers: Record<string, string> = {};
    
    if (range) {
      headers['Range'] = range;
    }

    // Fetch the video from WordPress with range support
    const response = await fetch(url, {
      headers,
      // Add connection keep-alive for better performance
      keepalive: true,
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch video' }, { status: response.status });
    }

    // Prepare response headers
    const responseHeaders = new Headers({
      'Content-Type': response.headers.get('content-type') || 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range',
    });

    // Forward important headers from the original response
    const headersToForward = [
      'content-length',
      'content-range',
      'last-modified',
      'etag',
      'expires',
    ];

    headersToForward.forEach(headerName => {
      const headerValue = response.headers.get(headerName);
      if (headerValue) {
        responseHeaders.set(headerName, headerValue);
      }
    });

    // Return the response with streaming body
    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Video proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle HEAD requests for video metadata
export async function HEAD(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse(null, { status: 400 });
  }

  try {
    const videoUrl = new URL(url);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const allowedHosts = [
      'localhost',
      apiUrl.replace('http://', '').replace('https://', '').split('/')[0],
    ].filter(Boolean);

    if (!allowedHosts.some(host => videoUrl.hostname === host)) {
      return new NextResponse(null, { status: 403 });
    }

    const response = await fetch(url, { method: 'HEAD' });
    
    const headers = new Headers({
      'Content-Type': response.headers.get('content-type') || 'video/mp4',
      'Content-Length': response.headers.get('content-length') || '',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000, immutable',
    });

    return new NextResponse(null, {
      status: response.status,
      headers,
    });

  } catch (error) {
    console.error('Video HEAD request error:', error);
    return new NextResponse(null, { status: 500 });
  }
}
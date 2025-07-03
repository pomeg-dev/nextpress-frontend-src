import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');
  const quality = searchParams.get('quality') || '80';
  const format = searchParams.get('format');

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

    // Fetch the video from WordPress
    const response = await fetch(url);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch video' }, { status: response.status });
    }

    // Get the video data
    const videoBuffer = await response.arrayBuffer();
    
    // Set appropriate headers
    const headers = new Headers({
      'Content-Type': response.headers.get('content-type') || 'video/mp4',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Length': videoBuffer.byteLength.toString(),
    });

    // In the future, you could add video optimization here
    // For now, we're just proxying with caching headers
    
    return new NextResponse(videoBuffer, { headers });
  } catch (error) {
    console.error('Video proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
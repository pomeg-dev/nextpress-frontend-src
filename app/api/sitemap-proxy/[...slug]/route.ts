import { NextRequest, NextResponse } from 'next/server'

const WORDPRESS_URL = process.env.NEXT_PUBLIC_API_URL
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL

if (!WORDPRESS_URL || !FRONTEND_URL) {
  console.error('Missing environment variables:')
  console.error('NEXT_PUBLIC_API_URL:', WORDPRESS_URL ? 'SET' : 'MISSING')
  console.error('NEXT_PUBLIC_FRONTEND_URL:', FRONTEND_URL ? 'SET' : 'MISSING')
}

// Global regex to replace all WordPress URLs with frontend URLs
const HOSTNAME_REGEX = new RegExp(
  (WORDPRESS_URL ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  'g'
)


function replaceWordPressUrls(content: string): string {
  if (!WORDPRESS_URL || !FRONTEND_URL) return content
  
  let updatedContent = content
  
  // Remove XSL stylesheet references to prevent CORS issues
  updatedContent = updatedContent.replace(
    /<\?xml-stylesheet[^>]*\?>/gi,
    ''
  )
  
  // Replace WordPress domain with frontend domain
  updatedContent = updatedContent.replace(HOSTNAME_REGEX, FRONTEND_URL)
  
  // Keep WordPress URLs for media files and admin resources
  updatedContent = updatedContent.replace(
    new RegExp(`${FRONTEND_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/wp-content/`, 'g'),
    `${WORDPRESS_URL}/wp-content/`
  )
  
  // Handle common WordPress paths that should remain on WordPress
  const wordpressOnlyPaths = ['/wp-admin/', '/wp-includes/', '/wp-json/']
  wordpressOnlyPaths.forEach(path => {
    updatedContent = updatedContent.replace(
      new RegExp(`${FRONTEND_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}${path}`, 'g'),
      `${WORDPRESS_URL}${path}`
    )
  })
  
  return updatedContent
}

// Function to construct the WordPress sitemap URL
function buildWordPressSitemapUrl(slug: string[]): string {
  if (!slug || slug.length === 0) {
    return `${WORDPRESS_URL}/sitemap_index.xml`
  }
  
  // Join all slug parts.
  const sitemapPath = slug.join('/')
  
  console.log('[Sitemap Proxy] Building URL for slug:', slug, '-> path:', sitemapPath)
  
  // Handle common Yoast sitemap patterns
  if (sitemapPath.includes('sitemap') && sitemapPath.endsWith('.xml')) {
    // Direct sitemap file (page-sitemap.xml, post-sitemap1.xml, etc.)
    return `${WORDPRESS_URL}/${sitemapPath}`
  } else if (sitemapPath === 'sitemap_index.xml' || sitemapPath === 'sitemap.xml') {
    // Main sitemap index
    return `${WORDPRESS_URL}/sitemap_index.xml`
  } else {
    // Fallback - just append the path
    return `${WORDPRESS_URL}/${sitemapPath}`
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }): Promise<NextResponse> {
  const resolvedParams = await params
  
  // Environment variable check
  if (!WORDPRESS_URL || !FRONTEND_URL) {
    console.error('[Sitemap Proxy] Missing environment variables')
    return NextResponse.json(
      { 
        error: 'Missing required environment variables',
        missing: [
          !WORDPRESS_URL && 'NEXT_PUBLIC_API_URL',
          !FRONTEND_URL && 'NEXT_PUBLIC_FRONTEND_URL'
        ].filter(Boolean),
        help: 'Make sure these are set in your .env.local file'
      }, 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
  
  const { slug = [] } = resolvedParams
  
  // Build the WordPress sitemap URL
  const wordpressUrl = buildWordPressSitemapUrl(slug)
  
  try {
    // Fetch the sitemap from WordPress with proper headers
    const upstreamResponse = await fetch(wordpressUrl, {
      headers: {
        'User-Agent': 'Next.js Sitemap Proxy/1.0',
        'Accept': 'application/xml, text/xml, */*',
      },
      redirect: 'manual', // Handle redirects manually
    })
    
    let content: string
    let contentType = 'text/xml'
    
    // Handle redirects (common with WordPress)
    if (upstreamResponse.status >= 300 && upstreamResponse.status < 400) {
      const location = upstreamResponse.headers.get('location')
      if (location) {
        const locationURL = new URL(location, wordpressUrl)
        
        // Only follow redirect if it's to the same WordPress domain
        if (locationURL.href.includes(WORDPRESS_URL)) {
          const redirectResponse = await fetch(locationURL.href, {
            headers: {
              'User-Agent': 'Next.js Sitemap Proxy/1.0',
              'Accept': 'application/xml, text/xml, */*',
            },
          })
          
          if (!redirectResponse.ok) {
            throw new Error(`Redirect failed with status: ${redirectResponse.status}`)
          }
          
          content = await redirectResponse.text()
          contentType = redirectResponse.headers.get('content-type') || 'text/xml'
        } else {
          throw new Error(`Redirect to external domain not allowed: ${locationURL.href}`)
        }
      } else {
        throw new Error(`Redirect response missing location header`)
      }
    } else if (!upstreamResponse.ok) {
      // For debugging, let's see what WordPress returned
      const errorContent = await upstreamResponse.text()
      console.error('[Sitemap Proxy] WordPress error response:', errorContent.substring(0, 500))
      
      // Check if it's a 404 and suggest alternatives
      if (upstreamResponse.status === 404) {
        const suggestedUrls = [
          `${WORDPRESS_URL}/sitemap_index.xml`,
          `${WORDPRESS_URL}/sitemap.xml`,
          `${WORDPRESS_URL}/?sitemap=index`,
          `${WORDPRESS_URL}/?sitemap=${slug.join('-')}`
        ]
        
        console.log('[Sitemap Proxy] 404 error, suggested URLs to check:', suggestedUrls)
        
        return new NextResponse(
          `Sitemap not found at: ${wordpressUrl}

WordPress returned 404. This might help:

1. Check if Yoast SEO is properly configured
2. Verify XML sitemaps are enabled in Yoast SEO settings
3. Try these URLs directly in your browser:
   ${suggestedUrls.join('\n   ')}

4. Check your WordPress permalink structure
5. Make sure the requested sitemap type exists (e.g., if you have pages, page-sitemap.xml should exist)

Error response from WordPress:
${errorContent.substring(0, 1000)}`,
          {
            status: 404,
            headers: { 'Content-Type': 'text/plain' }
          }
        )
      }
      
      throw new Error(`WordPress returned status: ${upstreamResponse.status}`)
    } else {
      // Normal response
      content = await upstreamResponse.text()
      contentType = upstreamResponse.headers.get('content-type') || 'text/xml'
    }
    
    // Verify we got XML content
    if (!content.includes('<?xml') && !content.includes('<urlset') && !content.includes('<sitemapindex')) {
      
      // Return debug information
      return new NextResponse(
        `Debug Information:
Request URL: ${request.url}
WordPress URL: ${wordpressUrl}
Response Status: ${upstreamResponse.status}
Content Type: ${contentType}
Content Length: ${content.length}
Content Preview: ${content.substring(0, 500)}

This might help:
1. Check if your WordPress site has Yoast SEO enabled
2. Verify the sitemap is accessible at: ${wordpressUrl}
3. Check WordPress admin: Yoast SEO → Settings → Site features → XML sitemaps
4. Try accessing the sitemap directly in your browser`,
        {
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        }
      )
    }
    
    // Replace WordPress URLs with frontend URLs
    const processedContent = replaceWordPressUrls(content)
    
    return new NextResponse(processedContent, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'X-Robots-Tag': 'noindex, follow',
      },
    })
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : ''
    
    console.error('[Sitemap Proxy] Error processing sitemap:', errorMessage)
    console.error('[Sitemap Proxy] Stack trace:', errorStack)
    
    // Return a minimal fallback sitemap with helpful error info
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Fallback sitemap due to error: ${errorMessage} -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${FRONTEND_URL}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`
    
    return new NextResponse(fallbackSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
        'Cache-Control': 'public, max-age=300', // Shorter cache for fallback
        'X-Robots-Tag': 'noindex, follow',
        'X-Error': errorMessage.substring(0, 100), // Include error in header for debugging
      },
    })
  }
}
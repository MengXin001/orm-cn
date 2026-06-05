export async function onRequest(context) {
  const { request } = context;
  
  try {
    const url = new URL(request.url);
    const ua = request.headers.get('User-Agent') || '';
    if (!ua) {
      return new Response('User-Agent header is missing', { status: 400 });
    }
    const params = url.searchParams;
    
    // Build the target URL with the base domain
    const targetUrl = new URL('https://api.openrailwaymap.org/v2/timestamp');
    
    // Copy all query parameters to the target URL
    params.forEach((value, key) => {
      targetUrl.searchParams.set(key, value);
    });
    
    try {
      // Fetch data from the target API
      const response = await fetch(targetUrl.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': ua,
        },
      });
      
      // Clone the response
      const originalResponseClone = response.clone();
      
      // Get response headers and create new headers
      const responseHeaders = response.headers;
      const newResponseHeaders = new Headers(responseHeaders);
      
      // Set CORS headers
      newResponseHeaders.set('Access-Control-Allow-Origin', '*');
      newResponseHeaders.set('Access-Control-Allow-Headers', 'Content-Type');
      newResponseHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS');

      // Disable caching for real-time requests
      newResponseHeaders.set('Cache-Control', 'no-cache');

      // Remove cookie headers for security
      newResponseHeaders.delete('Set-Cookie');
      newResponseHeaders.delete('Cookie');
      
      // Ensure the response is treated as an image
      newResponseHeaders.set('Content-Type', 'text/plain');
      
      // Create a new response with the same body and headers
      const newResponse = new Response(originalResponseClone.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newResponseHeaders,
      });
      
      return newResponse;
    } catch (error) {
      // Handle fetch errors
      return new Response(`Error fetching`, {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store',
          'Access-Control-Max-Age': '0'
        },
      });
    }
  } catch (error) {
    // Handle URL parsing errors
    return new Response(`Unknown Error`, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
        'Access-Control-Max-Age': '0'
      },
    });
  }
}

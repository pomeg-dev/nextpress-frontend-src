import pako from "pako";

export function decompressFromUrlSafeBase64(urlSafeBase64: string) {
  try {
    const base64 = urlSafeBase64
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const padding = base64.length % 4;
    const paddedBase64 = padding ? 
      base64 + '='.repeat(4 - padding) : 
      base64;
    
    const binaryString = atob(paddedBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const decompressed = pako.inflate(bytes);
    return new TextDecoder().decode(decompressed);
  } catch (error) {
    console.error('Error decompressing data:', error);
    return null;
  }
}
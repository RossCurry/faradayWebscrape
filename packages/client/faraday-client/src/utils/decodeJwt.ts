export function getIsJwtExpired(token: string) {
  try {
    // Split the token into its parts
    const base64Payload = token.split('.')[1]; // The payload is the second part of the JWT
    const decodedPayload = JSON.parse(atob(base64Payload)); // Decode from Base64 and parse JSON

    console.log('!decodedPayload -> ', decodedPayload);
    // Access the expiration time
    if (decodedPayload.exp) {
      const expirationTime = new Date(decodedPayload.exp * 1000); // Convert to milliseconds
      // Check if Token is expired
      return expirationTime < new Date()
    } else {
      console.log('Token does not have an expiration field.');
    }
  } catch (error) {
    console.error('Invalid token format:', error);
  }
  return true
}
const rateLimit = { error: { status: 429, message: 'API rate limit exceeded' } }
const notAuthorized = {error: { status: 401, message: 'Valid user authentication required' }}
const noScope = { error: { status: 403, message: 'Insufficient client scope' } }
// !spotifyPlaylist ->  { trying to createa playlist as olga
//   error: {
//     status: 403,
//     message: 'You cannot create a playlist for another user'
//   }
// }
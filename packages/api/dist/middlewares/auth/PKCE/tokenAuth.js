export {};
// export async function authPKCE (ctx: AppContext, _next: Application.Next) {
//   const params = new URLSearchParams(ctx.querystring)
//   const code = params.get('code')
//   const codeChallenge = codeVerifier.get()
//   if (!code || !codeChallenge) throw new Error('Missing code or codeChallenge from redirect')
//   try {
//     const token = await getTokenPCKE(code, codeChallenge)
//     console.log('!getTokenPCKE response -> ', token);
//     ctx.state.accessToken = token
//   } catch (error) {
//     ctx.body = {code} 
//   }
// }

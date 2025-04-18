import Application from "koa"
import { URLS } from "../constants.js"
import { AppContext } from "../../../router.js"

// TODO I need user credentials to do this. I need to set up a redirect app online somewhere.
export async function getCurrentUser(ctx: AppContext) {
  if (!ctx.state.accessToken) throw new Error('No auth token')
  const authString = `Bearer ${ctx.state.accessToken}`
  const res = await fetch(URLS.GET_CURRENT_USERS_PROFILE, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${authString}`,
    },
  })
  if (!res) throw new Error("No response")
  if (res.ok){
    const userInfo = await res.json()
    ctx.body = userInfo
  } else {
    throw new Error("Res not OK")
  }
}
const localConnectEndpoint = 'http://localhost:3000/api/spotify/connect'

async function connectToSpoti(){
  try {
    const response = await fetch(localConnectEndpoint, {
      method: 'GET',
      headers: {
        // 'Content-Type': 'application/json',
        // 'Content-Type': 'text/html; charset=utf-8',
      },
      mode: 'cors',
      credentials: 'include', // Use this if you need to include cookies
    })
    if (response.ok) {
      const locationUrl = response.headers.get('location')
      try {
        const url = new URL(locationUrl)
        window.location.href = url.toString()
      } catch (error) {
        console.log('Location URL is not a valid url')
      }
    } else {
      throw Error(response)
    }

    
  } catch (error) {
    console.log('!Failed to fetch error -> ', error);
    console.error(error)
  }
}

const loginButton = document?.getElementById('login-button')
loginButton?.addEventListener('click', connectToSpoti)
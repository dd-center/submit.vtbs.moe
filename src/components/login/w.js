const IS_LOCAL = location.hostname === 'localhost'

const CLIENT_ID = IS_LOCAL ? '23b965c70f0005df2d72' : '0dcef2f6e6221b70214f'
const CLIENT_SECRET = IS_LOCAL ? '505afa12c4fda8164fb56e9f2b607f3e62f62de0' : 'e1d64c4471a750145616d38b22b063a380cd9a3a'

export const getGithubLoginUrl = () => {
  const url = new URL('https://github.com/login/oauth/authorize')
  url.searchParams.set('client_id', CLIENT_ID)
  if (IS_LOCAL) {
    url.searchParams.set('redirect_uri', 'http://localhost:8080/login')
  }
  url.searchParams.set('scope', 'public_repo')
  return url.toString()
}

export const getToken = async code => {
  const response = await fetch('https://dd.center/api/proxy/access_token', {
    method: 'POST',
    body: JSON.stringify({ code, client_secret: CLIENT_SECRET, client_id: CLIENT_ID })
  })
  const { access_token: token } = await response.json()
  return token
}

export const getUser = async token => {
  const response = await fetch('https://api.github.com/user', { headers: { Authorization: `token ${token}` } })
  const { login, name, email, avatar_url: avatar, html_url: url } = await response.json()
  return { login, name, email, avatar, url }
}

export const saveToken = token => {
  if (token) {
    localStorage.submitToken = token
  } else {
    localStorage.removeItem('submitToken')
  }
}

export const readToken = () => localStorage.submitToken

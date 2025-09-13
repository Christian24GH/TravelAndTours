import axios from 'axios'

const base = import.meta.env.VITE_AUTH_BACKEND

export const api = axios.create({
  baseURL: base ? `${base}/api` : "http://localhost:8091/api",
  // Switched to token based
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
  },
  

  //withCredentials: true, // important for Sanctum SESSION BASED
  //withXSRFToken: true,
});

// Token based auth
const TOKEN_KEY = "auth_token"

// Token handling
export function setToken(token) {
  if (!token) return removeToken()
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken() {
  delete api.defaults.headers.common["Authorization"]
  localStorage.removeItem(TOKEN_KEY)
}

// Boot existing token on app start
(function boot() {
  const t = localStorage.getItem(TOKEN_KEY)
  if (t) setToken(t)
})()

// API helpers
export async function login(credentials = {}) {
  const res = await api.post("/login", credentials)
  if (res?.data?.token) setToken(res.data.token)
  return res.data
}

export async function logout() {
  try {
    await api.post("/logout")
  } finally {
    removeToken()
  }
}


export default api

import api from './api'

interface TokenResponse {
  access_token: string
  token_type: string
}

export async function iniciarSesion(
  email: string,
  password: string
): Promise<TokenResponse> {
  const respuesta = await api.post<TokenResponse>(
    '/auth/login',
    {
      email,
      password
    }
  )

  return respuesta.data
}

export async function obtenerPerfil(token: string) {
  const respuesta = await api.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return respuesta.data
}
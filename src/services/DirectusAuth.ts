interface DirectusUser {
  id: string
  email: string
  first_name?: string
  last_name?: string
  external_identifier?: string
}

class DirectusAuth {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || ''
  }

  async checkUserExists(email: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/users?filter[email][_eq]=${email}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      const data = await response.json()
      return data.data && data.data.length > 0
    } catch (error) {
      console.error('Error checking user:', error)
      return false
    }
  }

  getGoogleAuthUrl(redirect: string): string {
    return `${this.baseUrl}/auth/login/google?redirect=${encodeURIComponent(redirect)}`
  }
}

export default DirectusAuth
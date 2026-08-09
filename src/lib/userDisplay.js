// Small presentation helpers so components never have to reimplement
// "derive initials / a stable color from whatever identity data we have."

export function getInitials(name, email) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return parts[0].slice(0, 2).toUpperCase()
  }
  if (email) return email.slice(0, 2).toUpperCase()
  return '?'
}

const AVATAR_COLORS = ['#155DFC', '#8F5CFF', '#1FAE6E', '#F0A61F', '#EF4444', '#FF8A2B', '#0EA5B7']

export function getAvatarColor(seed = '') {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

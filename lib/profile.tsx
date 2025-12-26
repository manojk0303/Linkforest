import { sql } from "./db"
import type { BioLink } from "./types"

export interface PublicProfile {
  user: {
    username: string
    display_name: string | null
    bio: string | null
    avatar_url: string | null
    profile_image_url: string | null
    theme: string
    custom_js: string | null
    subscription_tier: string
    background_type?: string
    background_value?: string | null
    font_family?: string
    button_style?: any
  }
  links: BioLink[]
}

export async function getPublicProfile(username: string): Promise<PublicProfile | null> {
  const userResult = await sql`
    SELECT username, display_name, bio, avatar_url, profile_image_url, theme, custom_js, subscription_tier,
           background_type, background_value, font_family, button_style
    FROM users
    WHERE username = ${username}
  `

  if (userResult.length === 0) {
    return null
  }

  const user = userResult[0]

  const linksResult = await sql`
    SELECT bl.id, bl.user_id, bl.title, bl.url, bl.icon, bl.position, bl.is_visible, bl.block_type, bl.block_data, bl.created_at, bl.updated_at
    FROM bio_links bl
    INNER JOIN users u ON bl.user_id = u.id
    WHERE u.username = ${username} AND bl.is_visible = true
    ORDER BY bl.position ASC
  `

  return {
    user: {
      username: user.username,
      display_name: user.display_name,
      bio: user.bio,
      avatar_url: user.avatar_url,
      profile_image_url: user.profile_image_url,
      theme: user.theme,
      custom_js: user.custom_js,
      subscription_tier: user.subscription_tier,
      background_type: user.background_type,
      background_value: user.background_value,
      font_family: user.font_family,
      button_style: user.button_style,
    },
    links: linksResult as BioLink[],
  }
}

export async function updateUserProfile(
  userId: string,
  data: {
    username?: string
    display_name?: string
    bio?: string
    avatar_url?: string
    profile_image_url?: string
    theme?: string
    custom_domain?: string
    custom_js?: string
    background_type?: string
    background_value?: string
    font_family?: string
    button_style?: any
  },
): Promise<void> {
  if (data.username) {
    await sql`
      UPDATE users
      SET 
        username = ${data.username},
        subdomain = LOWER(${data.username}),
        updated_at = NOW()
      WHERE id = ${userId}
    `
  }
  // </CHANGE>

  const updateFields: any = {}
  if (data.display_name !== undefined) updateFields.display_name = data.display_name
  if (data.bio !== undefined) updateFields.bio = data.bio
  if (data.avatar_url !== undefined) updateFields.avatar_url = data.avatar_url
  if (data.profile_image_url !== undefined) updateFields.profile_image_url = data.profile_image_url
  if (data.theme !== undefined) updateFields.theme = data.theme
  if (data.custom_domain !== undefined) updateFields.custom_domain = data.custom_domain
  if (data.custom_js !== undefined) updateFields.custom_js = data.custom_js
  if (data.background_type !== undefined) updateFields.background_type = data.background_type
  if (data.background_value !== undefined) updateFields.background_value = data.background_value
  if (data.font_family !== undefined) updateFields.font_family = data.font_family
  if (data.button_style !== undefined) updateFields.button_style = data.button_style

  if (Object.keys(updateFields).length > 0) {
    await sql`
      UPDATE users
      SET 
        display_name = COALESCE(${updateFields.display_name}, display_name),
        bio = COALESCE(${updateFields.bio}, bio),
        avatar_url = COALESCE(${updateFields.avatar_url}, avatar_url),
        profile_image_url = COALESCE(${updateFields.profile_image_url}, profile_image_url),
        theme = COALESCE(${updateFields.theme}, theme),
        custom_domain = COALESCE(${updateFields.custom_domain}, custom_domain),
        custom_js = COALESCE(${updateFields.custom_js}, custom_js),
        background_type = COALESCE(${updateFields.background_type}, background_type),
        background_value = COALESCE(${updateFields.background_value}, background_value),
        font_family = COALESCE(${updateFields.font_family}, font_family),
        button_style = COALESCE(${updateFields.button_style ? JSON.stringify(updateFields.button_style) : null}, button_style),
        updated_at = NOW()
      WHERE id = ${userId}
    `
  }
  // </CHANGE>
}

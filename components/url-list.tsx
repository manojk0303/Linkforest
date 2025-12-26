"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink, Trash2, Check } from "lucide-react"
import type { ShortenedUrl } from "@/lib/types"

interface UrlListProps {
  refreshTrigger?: number
}

export function UrlList({ refreshTrigger }: UrlListProps) {
  const [urls, setUrls] = useState<ShortenedUrl[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [username, setUsername] = useState<string>("")

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUsername(data.user.username)
        }
      })
      .catch(console.error)

    fetchUrls()
  }, [refreshTrigger])

  const fetchUrls = async () => {
    try {
      const response = await fetch("/api/urls")
      const data = await response.json()

      if (response.ok) {
        setUrls(data.urls)
      }
    } catch (error) {
      console.error("Failed to fetch URLs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this URL?")) {
      return
    }

    try {
      const response = await fetch(`/api/urls/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setUrls(urls.filter((url) => url.id !== id))
      }
    } catch (error) {
      console.error("Failed to delete URL:", error)
    }
  }

  const copyToClipboard = (shortCode: string, id: string) => {
    const fullUrl = `https://linkfo.rest/${shortCode}`

    navigator.clipboard.writeText(fullUrl)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading URLs...</p>
        </CardContent>
      </Card>
    )
  }

  if (urls.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">No shortened URLs yet. Create your first one above!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your URLs</CardTitle>
        <CardDescription>Manage your shortened links</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {urls.map((url) => (
            <div key={url.id} className="flex items-start justify-between gap-4 rounded-lg border p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium truncate">{url.title || "Untitled"}</h3>
                  {url.custom_code && (
                    <Badge variant="secondary" className="text-xs">
                      Custom
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground truncate">
                    <span className="font-medium">Short:</span>{" "}
                    <a
                      href={`/${url.short_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      linkfo.rest/{url.short_code}
                    </a>
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    <span className="font-medium">Original:</span>{" "}
                    <a
                      href={url.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {url.original_url}
                    </a>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {url.clicks} clicks • Created {new Date(url.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(url.short_code, url.id)}
                  title="Copy short URL"
                >
                  {copiedId === url.id ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
                <Button size="sm" variant="ghost" asChild title="Open short URL">
                  <a href={`/${url.short_code}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(url.id)} title="Delete URL">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

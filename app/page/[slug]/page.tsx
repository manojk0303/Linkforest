import { getPublicProfile } from "@/lib/profile"
import { notFound } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"

export default async function PageBlockPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ bid?: string; u?: string }>
}) {
  const { slug } = await params
  const { bid, u } = await searchParams

  if (!bid || !u) {
    notFound()
  }

  const profile = await getPublicProfile(u)

  if (!profile) {
    notFound()
  }

  const block = profile.links.find((link) => link.id === bid && link.block_type === "page")

  if (!block) {
    notFound()
  }

  const isDark = profile.user.theme === "dark"
  const backgroundStyle = isDark
    ? { background: "linear-gradient(135deg, rgb(17 24 39), rgb(30 41 59), rgb(17 24 39))" }
    : { background: "linear-gradient(135deg, rgb(243 232 255), rgb(219 234 254), rgb(252 231 243))" }

  const textColorClass = isDark ? "text-white" : "text-gray-900"
  const mutedTextClass = isDark ? "text-gray-300" : "text-gray-600"

  return (
    <div className={`min-h-screen ${isDark ? "dark" : ""}`} style={backgroundStyle}>
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <Button asChild variant="ghost" className="mb-6">
          <Link href={`/${u}`}>
            <ArrowLeft className="size-4 mr-2" />
            Back to Profile
          </Link>
        </Button>

        <Card className={`p-8 ${isDark ? "bg-gray-900/90 border-gray-700" : "bg-white/90"}`}>
          <h1 className={`text-3xl font-bold mb-6 ${textColorClass}`}>{block.title}</h1>
          <div className={`prose ${isDark ? "prose-invert" : ""} max-w-none ${mutedTextClass}`}>
            <ReactMarkdown>{block.block_data.content}</ReactMarkdown>
          </div>
        </Card>
      </div>
    </div>
  )
}

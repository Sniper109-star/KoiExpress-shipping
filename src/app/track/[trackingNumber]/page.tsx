import { redirect } from "next/navigation"

export default async function TrackingNumberPage({ params }: { params: Promise<{ trackingNumber: string }> }) {
  const { trackingNumber } = await params
  redirect(`/track?tracking=${encodeURIComponent(trackingNumber)}`)
}

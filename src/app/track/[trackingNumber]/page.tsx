import TrackPage from "@/app/track/page"

export default async function TrackingNumberPage({ params }: { params: Promise<{ trackingNumber: string }> }) {
  const { trackingNumber } = await params
  return <TrackPage initialTrackingNumber={trackingNumber} />
}

import { notFound } from "next/navigation"

import { KitchenSink } from "./kitchen-sink"

export const dynamic = "force-dynamic"

export default function DevUiPage() {
  if (process.env.NODE_ENV === "production") {
    notFound()
  }

  return <KitchenSink />
}

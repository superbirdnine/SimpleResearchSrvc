import { Library } from "@/components/library";
import { getNoteSummaries, noteIdFromRoute } from "@/lib/notes";

export const dynamic = "force-dynamic";

export default async function NotePage({
  params,
  searchParams,
}: {
  params: Promise<{ collection: string; segments: string[] }>;
  searchParams: Promise<{ collection?: string; topic?: string }>;
}) {
  const { collection, segments } = await params;
  const requestedFilter = await searchParams;
  const id = noteIdFromRoute(collection, segments);
  const initialFilter = requestedFilter.topic
    ? { collection: requestedFilter.collection || collection, topic: requestedFilter.topic }
    : requestedFilter.collection ? { collection: requestedFilter.collection } : {};
  return <Library key={id || "library"} notes={getNoteSummaries()} initialSelectedId={id || undefined} initialFilter={initialFilter} />;
}

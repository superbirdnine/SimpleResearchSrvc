import { Library } from "@/components/library";
import { getNoteSummaries } from "@/lib/notes";

export const dynamic = "force-dynamic";
export default function Home() {
  return <Library notes={getNoteSummaries()} />;
}

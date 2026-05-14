import { SharedNoteReader } from "@/components/shared/shared-note-reader";

interface SharedNotePageProps {
  params: Promise<{
    shareId: string;
  }>;
}

export default async function SharedNotePage({ params }: SharedNotePageProps) {
  const { shareId } = await params;

  return <SharedNoteReader shareId={shareId} />;
}

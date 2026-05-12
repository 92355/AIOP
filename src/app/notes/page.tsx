import { getNotes } from "@/app/notes/actions";
import { NotesInboxView } from "@/components/notes/NotesInboxView";

export default async function NotesPage() {
  const items = await getNotes();
  return <NotesInboxView initialItems={items} />;
}

import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
export default async function RoomRedirect({ params }: { params: Promise<{id:string}> }) {
  const { id } = await params;
  const { data: room } = await supabase.from("Rooms").select("share_token").eq("id", id).single();
  if (room?.share_token) redirect(`/r/${room.share_token}`);
  return <main className="min-h-screen bg-[#FBFBF9] p-10 text-[13px]">Room {id} has no share token</main>;
}

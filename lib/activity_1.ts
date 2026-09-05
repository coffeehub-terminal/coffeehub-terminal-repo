import { supabase } from "@/lib/supabase";

type ActivityInput = {
  entityType: string;
  entityId: string;
  roomId: string;
  action: string;
  title: string;
  description?: string;
  link?: string;
  createdBy?: string;
};

export async function createActivity(input: ActivityInput) {
  try {
    // Try Activities table with common column names
    const payload: any = {
      entity_type: input.entityType,
      entity_id: input.entityId,
      room_id: input.roomId,
      action: input.action,
      title: input.title,
      description: input.description || "",
      link: input.link || "",
      created_by: input.createdBy || "",
      type: input.action,
      message: input.description || input.title,
    };

    const { error } = await supabase.from("Activities").insert(payload);
    if (error) {
      // Fallback: try minimal columns if above fails
      console.warn("Activities insert warn:", error.message);
      const { error: e2 } = await supabase.from("Activities").insert({
        room_id: input.roomId,
        title: input.title,
        description: input.description,
        type: input.entityType,
        action: input.action,
      });
      if (e2) console.warn("Activities fallback warn:", e2.message);
    }
  } catch (err) {
    console.warn("createActivity failed (non-blocking):", err);
  }
}

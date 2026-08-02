import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getMemory, setMemory, deleteMemory, clearPhoneMemory } from "@/lib/ai/brain/memory";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");
    const agent_id = searchParams.get("agent_id") || undefined;
    const category = searchParams.get("category") || undefined;

    if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });

    const db = await getDB();
    const memories = await getMemory(db, phone, agent_id, category);
    return NextResponse.json({ memories });
  } catch (error) {
    return NextResponse.json({ error: "Failed to read memory" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      phone: string;
      agent_id: string;
      key: string;
      value: string;
      category?: string;
      priority?: number;
      ttl_minutes?: number;
    };

    if (!body.phone || !body.key) {
      return NextResponse.json({ error: "phone and key required" }, { status: 400 });
    }

    const db = await getDB();
    await setMemory(
      db,
      body.phone,
      body.agent_id || "",
      body.key,
      body.value,
      body.category || "general",
      body.priority || 0,
      body.ttl_minutes,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to write memory" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");
    const agent_id = searchParams.get("agent_id") || "";
    const key = searchParams.get("key");
    const clear = searchParams.get("clear");

    if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });

    const db = await getDB();
    if (clear === "all") {
      await clearPhoneMemory(db, phone);
    } else if (key) {
      await deleteMemory(db, phone, agent_id, key);
    } else {
      return NextResponse.json({ error: "key or clear=all required" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete memory" }, { status: 500 });
  }
}

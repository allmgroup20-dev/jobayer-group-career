import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getAllPatterns, addPattern, deletePattern, getDetections, logDetection, getKnowledgeBase } from "@/lib/ai/brain/negativity";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "patterns";
    const db = await getDB();

    switch (type) {
      case "patterns": {
        const patterns = await getAllPatterns(db);
        return NextResponse.json({ patterns });
      }
      case "detections": {
        const detections = await getDetections(db, Number(searchParams.get("limit")) || 50);
        return NextResponse.json({ detections });
      }
      case "knowledge": {
        const knowledge = await getKnowledgeBase(db);
        return NextResponse.json({ knowledge });
      }
      default:
        return NextResponse.json({ error: "Unknown type" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to load negativity data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      action: string;
      triggerWord?: string;
      category?: string;
      severity?: number;
      contextNotes?: string;
      alternativeWording?: string;
      patternId?: number;
      phone?: string;
      conversationText?: string;
      matchedPattern?: string;
      intent?: string;
      department?: string;
      agentAdvice?: string;
    };

    const db = await getDB();

    switch (body.action) {
      case "add-pattern":
        if (!body.triggerWord) return NextResponse.json({ error: "triggerWord required" }, { status: 400 });
        await addPattern(db, {
          triggerWord: body.triggerWord,
          category: body.category || "general",
          severity: body.severity || 3,
          contextNotes: body.contextNotes,
          alternativeWording: body.alternativeWording,
        });
        return NextResponse.json({ success: true });

      case "delete-pattern":
        if (!body.patternId) return NextResponse.json({ error: "patternId required" }, { status: 400 });
        await deletePattern(db, body.patternId);
        return NextResponse.json({ success: true });

      case "log-detection":
        if (!body.phone) return NextResponse.json({ error: "phone required" }, { status: 400 });
        await logDetection(db, {
          phone: body.phone,
          conversationText: body.conversationText,
          matchedPattern: body.matchedPattern,
          category: body.category,
          severity: body.severity,
          intent: body.intent,
          department: body.department,
          agentAdvice: body.agentAdvice,
        });
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to process negativity action" }, { status: 500 });
  }
}

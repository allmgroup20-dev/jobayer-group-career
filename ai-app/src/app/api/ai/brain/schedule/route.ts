import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { createSchedule, getSchedules, updateSchedule, deleteSchedule, getDueSchedules, markScheduleRun } from "@/lib/ai/brain/scheduler";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone") || undefined;
    const due = searchParams.get("due");

    const db = await getDB();

    if (due === "1") {
      const dueTasks = await getDueSchedules(db);
      return NextResponse.json({ schedules: dueTasks });
    }

    const schedules = await getSchedules(db, phone);
    return NextResponse.json({ schedules });
  } catch (error) {
    return NextResponse.json({ error: "Failed to list schedules" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      action: string;
      phone?: string;
      agent_id?: string;
      task_type?: string;
      cron_expression?: string;
      params?: Record<string, any>;
      schedule_id?: number;
    };

    const db = await getDB();

    if (body.action === "create") {
      if (!body.phone || !body.agent_id || !body.task_type || !body.cron_expression) {
        return NextResponse.json({ error: "phone, agent_id, task_type, cron_expression required" }, { status: 400 });
      }
      await createSchedule(db, body.phone, body.agent_id, body.task_type, body.cron_expression, body.params);
      return NextResponse.json({ success: true });
    }

    if (body.action === "update") {
      if (!body.schedule_id) return NextResponse.json({ error: "schedule_id required" }, { status: 400 });
      await updateSchedule(db, body.schedule_id, {
        cron_expression: body.cron_expression,
        enabled: body.params?.enabled !== undefined ? Number(body.params.enabled) as 0 | 1 : undefined,
        params: body.params ? JSON.stringify(body.params) : undefined,
      });
      return NextResponse.json({ success: true });
    }

    if (body.action === "delete") {
      if (!body.schedule_id) return NextResponse.json({ error: "schedule_id required" }, { status: 400 });
      await deleteSchedule(db, body.schedule_id);
      return NextResponse.json({ success: true });
    }

    if (body.action === "mark_done") {
      if (!body.schedule_id || !body.cron_expression) {
        return NextResponse.json({ error: "schedule_id and cron_expression required" }, { status: 400 });
      }
      await markScheduleRun(db, body.schedule_id, body.cron_expression);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Schedule operation failed" }, { status: 500 });
  }
}

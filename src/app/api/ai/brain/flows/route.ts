import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { processMessage } from "@/lib/ai/brain/orchestrator";
import { executeAgent, buildAgentPrompt } from "@/lib/ai/brain/executor";
import { findAgent } from "@/lib/ai/brain/registry";
import type { MessageCtx } from "@/lib/ai/brain/types";

interface FlowStep {
  department: string;
  agentId: string;
  condition?: string;
}

interface Flow {
  id: number;
  name: string;
  description: string;
  steps: string;
  department_ids: string;
  created_by: string;
  is_active: number;
  run_count: number;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const db = await getDB();

    if (id) {
      const flows = await query<Flow>(db, `SELECT id, name, description, steps, department_ids, created_by, is_active, run_count, last_run_at, created_at, updated_at FROM custom_flows WHERE id = ?`, [parseInt(id)]);
      if (flows.length === 0) return NextResponse.json({ error: "Flow not found" }, { status: 404 });
      const flow = flows[0];
      return NextResponse.json({ flow: { ...flow, steps: JSON.parse(flow.steps || "[]") } });
    }

    const flows = await query<Flow>(db, `SELECT id, name, description, steps, department_ids, created_by, is_active, run_count, last_run_at, created_at, updated_at FROM custom_flows ORDER BY updated_at DESC`);
    return NextResponse.json({
      flows: flows.map(f => ({ ...f, steps: JSON.parse(f.steps || "[]") })),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to list flows" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      action: string;
      id?: number;
      name?: string;
      description?: string;
      steps?: FlowStep[];
      created_by?: string;
      // For running a flow
      flow_id?: number;
      phone?: string;
      text?: string;
    };

    const db = await getDB();

    // ── Create flow ──
    if (body.action === "create") {
      if (!body.name || !body.steps || body.steps.length === 0) {
        return NextResponse.json({ error: "name and steps required" }, { status: 400 });
      }
      const deptIds = [...new Set(body.steps.map(s => s.department))].join(",");
      await execute(
        db,
        `INSERT INTO custom_flows (name, description, steps, department_ids, created_by) VALUES (?, ?, ?, ?, ?)`,
        [body.name, body.description || "", JSON.stringify(body.steps), deptIds, body.created_by || "admin"],
      );
      return NextResponse.json({ success: true });
    }

    // ── Update flow ──
    if (body.action === "update") {
      if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
      const updates: string[] = [];
      const params: unknown[] = [];
      if (body.name) { updates.push("name = ?"); params.push(body.name); }
      if (body.description !== undefined) { updates.push("description = ?"); params.push(body.description); }
      if (body.steps) {
        updates.push("steps = ?");
        params.push(JSON.stringify(body.steps));
        updates.push("department_ids = ?");
        params.push([...new Set(body.steps.map(s => s.department))].join(","));
      }
      updates.push("updated_at = datetime('now')");
      params.push(body.id);
      await execute(db, `UPDATE custom_flows SET ${updates.join(", ")} WHERE id = ?`, params);
      return NextResponse.json({ success: true });
    }

    // ── Delete flow ──
    if (body.action === "delete") {
      if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
      await execute(db, `DELETE FROM custom_flows WHERE id = ?`, [body.id]);
      await execute(db, `DELETE FROM flow_executions WHERE flow_id = ?`, [body.id]);
      return NextResponse.json({ success: true });
    }

    // ── Run flow ──
    if (body.action === "run") {
      if (!body.flow_id || !body.phone || !body.text) {
        return NextResponse.json({ error: "flow_id, phone, text required" }, { status: 400 });
      }
      const flows = await query<Flow>(db, `SELECT id, name, description, steps, department_ids, created_by, is_active, run_count, last_run_at, created_at, updated_at FROM custom_flows WHERE id = ?`, [body.flow_id]);
      if (flows.length === 0) return NextResponse.json({ error: "Flow not found" }, { status: 404 });
      const flow = flows[0];
      const steps: FlowStep[] = JSON.parse(flow.steps || "[]");

      // Create execution log
      await execute(
        db,
        `INSERT INTO flow_executions (flow_id, phone, total_steps) VALUES (?, ?, ?)`,
        [body.flow_id, body.phone, steps.length],
      );

      const ctx: MessageCtx = {
        phone: body.phone,
        text: body.text,
        name: "Flow Runner",
        role: "customer",
        language: /[আ-হ]/.test(body.text) ? "bn" : "en",
        mood: "neutral",
        totalChats: 0,
        painPoints: [],
        interests: [],
        isWorker: false,
      };

      let chainContext = "";
      const agentsUsed: string[] = [];
      const departmentsUsed: string[] = [];
      const stepsLog: any[] = [];
      let failed = false;

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const agentData = findAgent(step.agentId);
        const stepResult: any = { step: i, agentId: step.agentId, status: "running" };

        try {
          if (!agentData) {
            stepResult.status = "skipped";
            stepResult.error = "Agent not found";
            stepsLog.push(stepResult);
            continue;
          }

          const agent = agentData.agent;
          const contextVars: Record<string, any> = {
            language: ctx.language === "bn" ? "Bengali" : "English",
            customerName: "Flow Runner",
            customerPhone: body.phone,
            mood: ctx.mood,
            previousOutput: chainContext,
          };
          const agentPrompt = buildAgentPrompt(agent, contextVars);
          const output = await executeAgent(agent, agentPrompt, body.text, body.phone || "");

          chainContext += `\n[${agent.name}]\n${output.text}`;
          agentsUsed.push(agent.id);
          if (!departmentsUsed.includes(agentData.department)) {
            departmentsUsed.push(agentData.department);
          }

          stepResult.status = "completed";
          stepResult.output = output.text.slice(0, 200);
          stepResult.model = output.model;
          stepsLog.push(stepResult);

          // Update execution progress
          await execute(
            db,
            `UPDATE flow_executions SET current_step = ?, steps_log = ? WHERE flow_id = ? AND phone = ? AND status = 'running'`,
            [i + 1, JSON.stringify(stepsLog), body.flow_id, body.phone],
          );
        } catch (e: any) {
          stepResult.status = "failed";
          stepResult.error = e.message?.slice(0, 200) || "Unknown error";
          stepsLog.push(stepResult);
          failed = true;
          break;
        }
      }

      // Finalize execution
      const finalStatus = failed ? "failed" : "completed";
      await execute(
        db,
        `UPDATE flow_executions SET status = ?, current_step = ?, steps_log = ?, completed_at = datetime('now') WHERE flow_id = ? AND phone = ? AND status = 'running'`,
        [finalStatus, steps.length, JSON.stringify(stepsLog), body.flow_id, body.phone],
      );

      // Increment run count
      await execute(db, `UPDATE custom_flows SET run_count = run_count + 1, last_run_at = datetime('now') WHERE id = ?`, [body.flow_id]);

      return NextResponse.json({
        success: !failed,
        flow: flow.name,
        agentsUsed,
        departmentsUsed,
        chainContext: chainContext.slice(0, 1000),
        steps: stepsLog,
        status: finalStatus,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Flow operation failed" }, { status: 500 });
  }
}

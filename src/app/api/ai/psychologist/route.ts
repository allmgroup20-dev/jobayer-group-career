import { NextResponse } from "next/server";
import { query, queryFirst, execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "feedback";
    const phone = searchParams.get("phone");
    const db = await ensureDB();

    // List all psychologists
    if (action === "psychologists") {
      const psychologists = await query<{ phone: string; role: string; priority: number; created_at: string }>(
        { DB: db },
        "SELECT phone, role, priority, created_at FROM employee_roles WHERE role = 'psychologist' ORDER BY created_at DESC LIMIT 200"
      );
      return NextResponse.json({ psychologists });
    }

    // List all employees with their roles
    if (action === "employees") {
      const employees = await query<{ phone: string; role: string; priority: number; created_at: string }>(
        { DB: db },
        "SELECT phone, role, priority, created_at FROM employee_roles ORDER BY priority DESC, created_at DESC LIMIT 200"
      );
      return NextResponse.json({ employees });
    }

    // Get unresolved feedback (optionally filtered by psychologist's assigned agents)
    if (action === "feedback") {
      let feedback;
      if (phone) {
        // Get feedback for agents linked to this psychologist
        const linkedAgents = await query<{ agent_id: string }>(
          { DB: db },
          "SELECT agent_id FROM worker_agent_links WHERE phone = ?",
          [phone]
        );
        const agentIds = linkedAgents.map(a => a.agent_id);
        if (agentIds.length === 0) {
          feedback = await query(
            { DB: db },
            "SELECT id, worker_id, session_id, rating, feedback_text, resolved, agent_id, created_at FROM psychologist_feedback WHERE resolved = 0 ORDER BY created_at DESC LIMIT 50"
          );
        } else {
          const placeholders = agentIds.map(() => "?").join(",");
          feedback = await query(
            { DB: db },
            `SELECT id, worker_id, session_id, rating, feedback_text, resolved, agent_id, created_at FROM psychologist_feedback WHERE resolved = 0 AND agent_id IN (${placeholders}) ORDER BY created_at DESC LIMIT 50`,
            agentIds
          );
        }
      } else {
        feedback = await query(
          { DB: db },
          "SELECT id, worker_id, session_id, rating, feedback_text, resolved, agent_id, created_at FROM psychologist_feedback WHERE resolved = 0 ORDER BY created_at DESC LIMIT 50"
        );
      }
      return NextResponse.json({ feedback });
    }

    // Get analytics
    if (action === "analytics") {
      const totalFeedback = await queryFirst<{ count: number }>(
        { DB: db },
        "SELECT COUNT(*) as count FROM psychologist_feedback"
      );
      const unresolvedCount = await queryFirst<{ count: number }>(
        { DB: db },
        "SELECT COUNT(*) as count FROM psychologist_feedback WHERE resolved = 0"
      );
      const byIssue = await query<{ issue_type: string; count: number }>(
        { DB: db },
        "SELECT issue_type, COUNT(*) as count FROM psychologist_feedback GROUP BY issue_type ORDER BY count DESC"
      );
      const byAgent = await query<{ agent_id: string; count: number }>(
        { DB: db },
        "SELECT agent_id, COUNT(*) as count FROM psychologist_feedback GROUP BY agent_id ORDER BY count DESC LIMIT 10"
      );
      return NextResponse.json({
        total: totalFeedback?.count || 0,
        unresolved: unresolvedCount?.count || 0,
        byIssue,
        byAgent,
      });
    }

    // Get knowledge editable by psychologist
    if (action === "knowledge") {
      const agentId = searchParams.get("agent_id");
      if (agentId) {
        const knowledge = await query(
          { DB: db },
          `SELECT wk.id, wk.phone, wk.agent_id, wk.agent_name, wk.knowledge, wk.source, wk.version, wk.updated_by, wk.psychologist_notes, wk.created_at
           FROM worker_agent_knowledge wk
           WHERE wk.agent_id = ?
           ORDER BY wk.created_at DESC LIMIT 100`,
          [agentId]
        );
        return NextResponse.json({ knowledge });
      }
      const allKnowledge = await query(
        { DB: db },
        `SELECT wk.id, wk.phone, wk.agent_id, wk.agent_name, wk.knowledge, wk.source, wk.version, wk.updated_by, wk.psychologist_notes, wk.created_at
         FROM worker_agent_knowledge wk
         ORDER BY wk.agent_id ASC, wk.created_at DESC LIMIT 200`
      );
      return NextResponse.json({ knowledge: allKnowledge });
    }

    // Get skill history with audit log (psychologist updates tracked)
    if (action === "skill_history") {
      const { getSkillHistory } = await import("@/lib/ai/skills");
      const skills = await getSkillHistory();
      return NextResponse.json({ skills });
    }

    // Get skills editable by psychologist
    if (action === "skills") {
      const skills = await query(
        { DB: db },
        "SELECT id, keywords, question, answer, usage_count, category, created_at, updated_at FROM ai_skills ORDER BY category ASC, created_at DESC LIMIT 200"
      );
      return NextResponse.json({ skills });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to process request",
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      action: string;
      phone?: string;
      role?: string;
      feedbackId?: number;
      agentId?: string;
      targetPhone?: string;
      knowledgeId?: number;
      skillId?: number;
      agentName?: string;
      knowledge?: string;
      psychologistNotes?: string;
      suggestedFix?: string;
      updatedBy?: string;
      keywords?: string;
      question?: string;
      answer?: string;
      category?: string;
      issueType?: string;
      context?: string;
      aiDraft?: string;
    };
    const db = await ensureDB();

    // Set employee role (psychologist/employee)
    if (body.action === "set_role") {
      if (!body.phone || !body.role) {
        return NextResponse.json({ error: "phone and role required" }, { status: 400 });
      }
      if (!["psychologist", "employee"].includes(body.role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      const priority = body.role === "psychologist" ? 1 : 0;
      await execute(
        { DB: db },
        `INSERT INTO employee_roles (phone, role, priority, created_at) VALUES (?, ?, ?, datetime('now'))
         ON CONFLICT(phone) DO UPDATE SET role = ?, priority = ?`,
        [body.phone, body.role, priority, body.role, priority]
      );
      return NextResponse.json({ success: true, role: body.role, priority });
    }

    // Remove employee role (delete from table)
    if (body.action === "remove_role") {
      if (!body.phone) {
        return NextResponse.json({ error: "phone required" }, { status: 400 });
      }
      await execute(
        { DB: db },
        "DELETE FROM employee_roles WHERE phone = ?",
        [body.phone]
      );
      return NextResponse.json({ success: true });
    }

    // Mark feedback as resolved
    if (body.action === "resolve_feedback") {
      if (!body.feedbackId) {
        return NextResponse.json({ error: "feedbackId required" }, { status: 400 });
      }
      await execute(
        { DB: db },
        "UPDATE psychologist_feedback SET resolved = 1 WHERE id = ?",
        [body.feedbackId]
      );
      return NextResponse.json({ success: true });
    }

    // Add suggested fix to feedback
    if (body.action === "update_feedback") {
      if (!body.feedbackId) {
        return NextResponse.json({ error: "feedbackId required" }, { status: 400 });
      }
      await execute(
        { DB: db },
        "UPDATE psychologist_feedback SET suggested_fix = ?, resolved = 1 WHERE id = ?",
        [body.suggestedFix || "", body.feedbackId]
      );
      return NextResponse.json({ success: true });
    }

    // Edit knowledge entry
    if (body.action === "update_knowledge") {
      if (!body.knowledgeId) {
        return NextResponse.json({ error: "knowledgeId required" }, { status: 400 });
      }
      const setClauses: string[] = [];
      const params: any[] = [];
      if (body.knowledge !== undefined) {
        setClauses.push("knowledge = ?");
        params.push(body.knowledge);
      }
      if (body.psychologistNotes !== undefined) {
        setClauses.push("psychologist_notes = ?");
        params.push(body.psychologistNotes);
      }
      if (body.agentName !== undefined) {
        setClauses.push("agent_name = ?");
        params.push(body.agentName);
      }
      if (body.updatedBy !== undefined) {
        setClauses.push("updated_by = ?");
        params.push(body.updatedBy);
      }
      if (setClauses.length > 0) {
        setClauses.push("version = version + 1");
        params.push(body.knowledgeId);
        await execute(
          { DB: db },
          `UPDATE worker_agent_knowledge SET ${setClauses.join(", ")} WHERE id = ?`,
          params
        );
      }
      return NextResponse.json({ success: true });
    }

    // Add new knowledge
    if (body.action === "add_knowledge") {
      if (!body.phone || !body.agentId || !body.knowledge) {
        return NextResponse.json({ error: "phone, agentId, knowledge required" }, { status: 400 });
      }
      await execute(
        { DB: db },
        `INSERT INTO worker_agent_knowledge (phone, agent_id, agent_name, knowledge, source, version, updated_by, created_at)
         VALUES (?, ?, ?, ?, 'psychologist', 1, ?, datetime('now'))`,
        [body.phone, body.agentId, body.agentName || "", body.knowledge, body.updatedBy || ""]
      );
      return NextResponse.json({ success: true });
    }

    // Delete knowledge
    if (body.action === "delete_knowledge") {
      if (!body.knowledgeId) {
        return NextResponse.json({ error: "knowledgeId required" }, { status: 400 });
      }
      await execute(
        { DB: db },
        "DELETE FROM worker_agent_knowledge WHERE id = ?",
        [body.knowledgeId]
      );
      return NextResponse.json({ success: true });
    }

    // Toggle manual override on skill
    if (body.action === "toggle_override") {
      if (!body.skillId) {
        return NextResponse.json({ error: "skillId required" }, { status: 400 });
      }
      const current = await queryFirst<{ manual_override: number; question: string; keywords: string }>(
        { DB: db },
        "SELECT manual_override, question, keywords FROM ai_skills WHERE id = ?",
        [body.skillId]
      );
      const newVal = current?.manual_override ? 0 : 1;
      await execute(
        { DB: db },
        "UPDATE ai_skills SET manual_override = ?, updated_at = datetime('now') WHERE id = ?",
        [newVal, body.skillId]
      );
      // When turning ON, immediately create a psychologist feedback request
      if (newVal === 1 && current) {
        await execute(
          { DB: db },
          `INSERT INTO psychologist_feedback (agent_id, target_phone, issue_type, context, ai_draft, resolved, created_at)
           VALUES (?, ?, 'manual_override', ?, ?, 0, datetime('now'))`,
          ["brain", body.phone || "",
           `Skill #${body.skillId}: "${current.question || current.keywords}" — এই প্রশ্নের জন্য সর্বোত্তম উত্তর নির্ধারণ করুন।`,
           ""]
        );
      }
      return NextResponse.json({ success: true, manual_override: newVal });
    }

    // Edit skill
    if (body.action === "update_skill") {
      if (!body.skillId) {
        return NextResponse.json({ error: "skillId required" }, { status: 400 });
      }
      const old = await queryFirst<{ answer: string; keywords: string }>(
        { DB: db },
        "SELECT answer, keywords FROM ai_skills WHERE id = ?",
        [body.skillId]
      );
      const setClauses: string[] = [];
      const params: any[] = [];
      const updater = body.updatedBy || body.phone || "";
      if (body.keywords !== undefined) { setClauses.push("keywords = ?"); params.push(body.keywords); }
      if (body.question !== undefined) { setClauses.push("question = ?"); params.push(body.question); }
      if (body.answer !== undefined) { setClauses.push("answer = ?"); params.push(body.answer); }
      if (body.category !== undefined) { setClauses.push("category = ?"); params.push(body.category); }
      if (updater) { setClauses.push("updated_by = ?"); params.push(updater); }
      setClauses.push("updated_at = datetime('now')");
      if (setClauses.length > 0) {
        params.push(body.skillId);
        await execute(
          { DB: db },
          `UPDATE ai_skills SET ${setClauses.join(", ")} WHERE id = ?`,
          params
        );
        // Audit log for changed fields
        if (old) {
          if (body.answer !== undefined && old.answer !== body.answer) {
            await execute(
              { DB: db },
              `INSERT INTO skill_audit_log (skill_id, action, field_name, old_value, new_value, updated_by, created_at)
               VALUES (?, 'updated', 'answer', ?, ?, ?, datetime('now'))`,
              [body.skillId, old.answer, body.answer, updater]
            );
          }
          if (body.keywords !== undefined && old.keywords !== body.keywords) {
            await execute(
              { DB: db },
              `INSERT INTO skill_audit_log (skill_id, action, field_name, old_value, new_value, updated_by, created_at)
               VALUES (?, 'updated', 'keywords', ?, ?, ?, datetime('now'))`,
              [body.skillId, old.keywords, body.keywords, updater]
            );
          }
        }
      }
      return NextResponse.json({ success: true });
    }

    // Add new skill
    if (body.action === "add_skill") {
      if (!body.keywords || !body.question || !body.answer) {
        return NextResponse.json({ error: "keywords, question, answer required" }, { status: 400 });
      }
      const updater = body.updatedBy || body.phone || "";
      const result = await execute(
        { DB: db },
        `INSERT INTO ai_skills (keywords, question, answer, category, updated_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [body.keywords, body.question, body.answer, body.category || "psychologist", updater]
      );
      const newId = (result as any)?.meta?.last_row_id || 0;
      if (newId > 0) {
        await execute(
          { DB: db },
          `INSERT INTO skill_audit_log (skill_id, action, field_name, old_value, new_value, updated_by, created_at)
           VALUES (?, 'created', NULL, NULL, ?, ?, datetime('now'))`,
          [newId, body.answer, updater]
        );
      }
      return NextResponse.json({ success: true });
    }

    // Delete skill
    if (body.action === "delete_skill") {
      if (!body.skillId) {
        return NextResponse.json({ error: "skillId required" }, { status: 400 });
      }
      await execute(
        { DB: db },
        "DELETE FROM ai_skills WHERE id = ?",
        [body.skillId]
      );
      return NextResponse.json({ success: true });
    }

    // Log feedback manually (or from runtime)
    if (body.action === "log_feedback") {
      if (!body.agentId || !body.issueType) {
        return NextResponse.json({ error: "agentId and issueType required" }, { status: 400 });
      }
      await execute(
        { DB: db },
        `INSERT INTO psychologist_feedback (agent_id, target_phone, issue_type, context, ai_draft, resolved, created_at)
         VALUES (?, ?, ?, ?, ?, 0, datetime('now'))`,
        [body.agentId, body.targetPhone || "", body.issueType, body.context || "", body.aiDraft || ""]
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Action failed",
    }, { status: 500 });
  }
}

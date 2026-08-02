import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getAllDepartments } from "@/lib/ai/brain/registry/index";
import { getDynamicEmployees, createDynamicEmployee, deleteDynamicEmployee, getEmployeeChainInfo } from "@/lib/ai/brain/negativity";

export async function GET(request: NextRequest) {
  try {
    const db = await getDB();
    const departments = getAllDepartments().map((d) => ({
      id: d.id,
      name: d.name,
      nameBn: d.nameBn,
      icon: d.icon,
      description: d.description,
      teams: d.teams.map((t) => ({
        id: t.id,
        name: t.name,
        nameBn: t.nameBn,
        agents: t.agents.map((a) => ({
          id: a.id,
          name: a.name,
          nameBn: a.nameBn,
          description: a.description,
          tier: a.tier,
          priority: a.priority,
          primaryModel: a.primaryModel,
        })),
      })),
    }));

    const dynamicEmployees = await getDynamicEmployees(db);

    let totalAgents = 0;
    for (const d of departments) {
      for (const t of d.teams) {
        totalAgents += t.agents.length;
      }
    }

    return NextResponse.json({
      departments,
      dynamicEmployees,
      stats: {
        totalDepartments: departments.length,
        totalAgents,
        totalDynamicEmployees: dynamicEmployees.length,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load employees" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      action: string;
      parentEmployeeId?: string;
      employeeId?: string;
      name?: string;
      nameBn?: string;
      description?: string;
      expertise?: string;
      promptTemplate?: string;
      primaryModel?: string;
    };

    const db = await getDB();

    switch (body.action) {
      case "create": {
        if (!body.parentEmployeeId || !body.employeeId || !body.name) {
          return NextResponse.json({ error: "parentEmployeeId, employeeId, name required" }, { status: 400 });
        }
        await createDynamicEmployee(db, {
          parentEmployeeId: body.parentEmployeeId,
          employeeId: body.employeeId,
          name: body.name,
          nameBn: body.nameBn,
          description: body.description,
          expertise: body.expertise,
          promptTemplate: body.promptTemplate,
          primaryModel: body.primaryModel,
        });
        return NextResponse.json({ success: true, employeeId: body.employeeId });
      }

      case "delete": {
        if (!body.employeeId) return NextResponse.json({ error: "employeeId required" }, { status: 400 });
        await deleteDynamicEmployee(db, body.employeeId);
        return NextResponse.json({ success: true });
      }

      case "children": {
        if (!body.employeeId) return NextResponse.json({ error: "employeeId required" }, { status: 400 });
        const children = await getEmployeeChainInfo(db, body.employeeId);
        return NextResponse.json({ children });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to process employee action" }, { status: 500 });
  }
}

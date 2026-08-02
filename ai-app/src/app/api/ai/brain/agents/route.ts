import { NextResponse } from "next/server";
import { getAllDepartments, getAgentsByDepartment } from "@/lib/ai/brain/registry";

export async function GET() {
  const departments = getAllDepartments().map((dept) => ({
    id: dept.id,
    name: dept.name,
    nameBn: dept.nameBn,
    icon: dept.icon,
    description: dept.description,
    teamCount: dept.teams.length,
    agentCount: getAgentsByDepartment(dept.id).length,
    teams: dept.teams.map((team) => ({
      id: team.id,
      name: team.name,
      nameBn: team.nameBn,
      description: team.description,
      agentCount: team.agents.length,
      agents: team.agents.map((agent) => ({
        id: agent.id,
        name: agent.name,
        nameBn: agent.nameBn,
        description: agent.description,
        descriptionBn: agent.descriptionBn,
        expertise: agent.expertise,
        tier: agent.tier,
        priority: agent.priority,
        when: agent.when,
      })),
    })),
  }));

  const totals = departments.reduce(
    (acc, d) => ({
      agents: acc.agents + d.agentCount,
      teams: acc.teams + d.teamCount,
    }),
    { agents: 0, teams: 0 },
  );

  return NextResponse.json({
    departments,
    totalAgents: totals.agents,
    totalTeams: totals.teams,
    totalDepartments: departments.length,
  });
}

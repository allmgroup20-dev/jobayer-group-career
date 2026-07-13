import { query, queryFirst } from "../db/queries";

interface WorkerInfo {
  workerId: string;
  name: string;
  phone: string;
  level: number;
  joinDate: string;
  totalTeam: number;
}

interface TreeMember {
  workerId: string;
  name: string;
  phone: string;
  level: number;
  joinDate: string;
  totalTeam: number;
  children: TreeMember[];
}

export async function getWorkerInfo(env: { DB: D1Database }, workerId: string): Promise<WorkerInfo | null> {
  return queryFirst<WorkerInfo>(
    env,
    `SELECT worker_id as workerId, name, phone, level, join_date as joinDate, 
            total_team_members as totalTeam FROM workers WHERE worker_id = ?`,
    [workerId]
  );
}

export async function getDirectChildren(env: { DB: D1Database }, parentId: string): Promise<WorkerInfo[]> {
  return query<WorkerInfo>(
    env,
    `SELECT w.worker_id as workerId, w.name, w.phone, w.level, 
            w.join_date as joinDate, w.total_team_members as totalTeam 
     FROM workers w 
     INNER JOIN mlm_tree t ON w.worker_id = t.worker_id 
     WHERE t.parent_id = ? AND w.membership_status = 'active'`,
    [parentId]
  );
}

export async function buildTree(env: { DB: D1Database }, rootId: string, depth = 3): Promise<TreeMember | null> {
  const root = await getWorkerInfo(env, rootId);
  if (!root) return null;

  const tree: TreeMember = { ...root, children: [] };

  if (depth > 0) {
    tree.children = await buildChildren(env, rootId, depth - 1);
  }

  return tree;
}

async function buildChildren(env: { DB: D1Database }, parentId: string, depth: number): Promise<TreeMember[]> {
  const children = await getDirectChildren(env, parentId);
  const result: TreeMember[] = [];

  for (const child of children) {
    const member: TreeMember = { ...child, children: [] };
    if (depth > 0) {
      member.children = await buildChildren(env, child.workerId, depth - 1);
    }
    result.push(member);
  }

  return result;
}

export async function getSponsorUpline(env: { DB: D1Database }, workerId: string, maxLevels = 10): Promise<{ workerId: string; level: number }[]> {
  const upline: { workerId: string; level: number }[] = [];
  let currentId = workerId;

  for (let level = 1; level <= maxLevels; level++) {
    const parent = await queryFirst<{ parentId: string }>(
      env,
      `SELECT t.parent_id as parentId FROM mlm_tree t WHERE t.worker_id = ?`,
      [currentId]
    );

    if (!parent?.parentId) break;

    const worker = await getWorkerInfo(env, parent.parentId);
    if (worker) {
      upline.push({ workerId: worker.workerId, level });
      currentId = worker.workerId;
    } else {
      break;
    }
  }

  return upline;
}

export async function getTeamSize(env: { DB: D1Database }, workerId: string): Promise<number> {
  const allMembers: string[] = [workerId];
  let index = 0;

  while (index < allMembers.length) {
    const children = await query<{ workerId: string }>(
      env,
      `SELECT w.worker_id as workerId FROM workers w 
       INNER JOIN mlm_tree t ON w.worker_id = t.worker_id 
       WHERE t.parent_id = ? AND w.membership_status = 'active'`,
      [allMembers[index]]
    );
    for (const child of children) {
      allMembers.push(child.workerId);
    }
    index++;
  }

  return allMembers.length - 1;
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findUserByUsername(username) {
  return prisma.user.findUnique({ where: { username } });
}

async function findUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, username: true }
  });
}

async function createUser(username, passwordHash) {
  return prisma.user.create({ data: { username, passwordHash } });
}

async function updateUserPassword(username, passwordHash) {
  return prisma.user.update({ where: { username }, data: { passwordHash } });
}

async function getAllTasks(status) {
  return prisma.task.findMany({
    where: status ? { status } : undefined,
    orderBy: { id: 'desc' }
  });
}

async function getTaskById(id) {
  return prisma.task.findUnique({ where: { id } });
}

async function getTaskSummary() {
  const rows = await prisma.task.groupBy({
    by: ['status'],
    _count: { status: true }
  });

  const summary = { total: 0, success: 0, failed: 0, pending: 0 };
  for (const row of rows) {
    summary[row.status] = row._count.status;
    summary.total += row._count.status;
  }
  return summary;
}

async function createTask(title, status, detail) {
  return prisma.task.create({
    data: { title, status: status || 'pending', detail: detail || null }
  });
}

async function seedIfEmpty() {
  const count = await prisma.task.count();
  if (count > 0) return;

  await prisma.task.createMany({
    data: [
      { title: 'Sync inventory feed', status: 'success' },
      { title: 'Send weekly report', status: 'success' },
      { title: 'Import customer batch #42', status: 'failed', detail: 'Timeout connecting to source' },
      { title: 'Rebuild search index', status: 'pending' }
    ]
  });
}

module.exports = {
  findUserByUsername,
  findUserById,
  createUser,
  updateUserPassword,
  getAllTasks,
  getTaskById,
  getTaskSummary,
  createTask,
  seedIfEmpty
};

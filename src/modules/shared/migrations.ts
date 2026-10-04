import type { Expense, Group } from './models'

const knownLegacyIds: Record<string, string> = {
  'maya@example.com': 'maya',
  'leo@example.com': 'leo',
  'nina@example.com': 'nina',
  'sam@example.com': 'sam',
  'ava@example.com': 'ava',
}

const legacyMemberId = (email: string) => {
  let hash = 2166136261
  for (let index = 0; index < email.length; index += 1) hash = Math.imul(hash ^ email.charCodeAt(index), 16777619)
  return `legacy-${(hash >>> 0).toString(36)}`
}

export const normalizeGroups = (groups: Group[]) => groups.map(group => ({
  ...group,
  members: group.members.map((member, index) => ({
    ...member,
    id: member.email && member.id === member.email
      ? knownLegacyIds[member.email] ?? legacyMemberId(member.email)
      : member.id || (member.email ? knownLegacyIds[member.email] ?? legacyMemberId(member.email) : `${group.id}-member-${index}`),
  })),
}))

export const normalizeExpenses = (expenses: Expense[], groups: Group[]) => expenses.map(expense => {
  const group = groups.find(item => item.id === expense.groupId)
  if (!group) return expense
  const allocations = { ...expense.allocations }
  group.members.forEach(member => {
    if (member.email && member.email !== member.id && Object.prototype.hasOwnProperty.call(allocations, member.email)) {
      if (!Object.prototype.hasOwnProperty.call(allocations, member.id)) allocations[member.id] = allocations[member.email]
      delete allocations[member.email]
    }
  })
  return { ...expense, allocations }
})

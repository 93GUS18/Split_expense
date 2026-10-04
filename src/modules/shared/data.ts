import type { Expense, Group, Member } from './models'

export const palette = ['#e7ad63', '#77a99b', '#cb8171', '#8593bc', '#c5a85d', '#a68ca4']
export const maya: Member = { id: 'maya', name: 'Maya Chen', initials: 'MC', color: '#c97a63' }
export const seedGroups: Group[] = [
  { id: 'italy', name: 'Italy, at last', type: 'Big trip', color: '#d7a15d', image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=85', members: [maya, { id: 'leo', name: 'Leo Park', initials: 'LP', color: '#759e91' }, { id: 'nina', name: 'Nina Flores', initials: 'NF', color: '#a68ca4' }, { id: 'sam', name: 'Sam Reed', initials: 'SR', color: '#6887aa' }] },
  { id: 'apartment', name: 'Apartment 4B', type: 'Home', color: '#769d91', members: [maya, { id: 'leo', name: 'Leo Park', initials: 'LP', color: '#759e91' }, { id: 'nina', name: 'Nina Flores', initials: 'NF', color: '#a68ca4' }] },
  { id: 'weekend', name: 'Little lake weekend', type: 'Getaway', color: '#7b8baf', image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=85', members: [maya, { id: 'sam', name: 'Sam Reed', initials: 'SR', color: '#6887aa' }, { id: 'ava', name: 'Ava Patel', initials: 'AP', color: '#d29c57' }] },
]
export const seedExpenses: Expense[] = [
  { id: 'e1', groupId: 'italy', title: 'Dinner at Trattoria', amount: 186.4, date: 'Today', payer: 'Maya Chen', category: 'Food & drink', note: 'The place by the little square', splitType: 'Equal', allocations: {} },
  { id: 'e2', groupId: 'apartment', title: 'Monthly groceries', amount: 74.82, date: 'Yesterday', payer: 'Leo Park', category: 'Groceries', note: '', splitType: 'Equal', allocations: {} },
  { id: 'e3', groupId: 'italy', title: 'Train to Florence', amount: 92, date: 'May 18', payer: 'Nina Flores', category: 'Transport', note: '', splitType: 'Equal', allocations: {} },
]
export const currencies = ['USD', 'CAD', 'EUR', 'GBP', 'AUD', 'INR']

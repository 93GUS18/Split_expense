import { Users } from 'lucide-react'
import type { Group, Member } from '../shared/models'
import './people.css'

type PersonEntry = { member: Member; groups: string[] }

export function PeopleList({ groups }: { groups: Group[] }) {
  const people = new Map<string, PersonEntry>()
  groups.forEach(group => group.members.forEach(member => {
    const entry = people.get(member.id) ?? { member, groups: [] }
    entry.groups.push(group.name)
    people.set(member.id, entry)
  }))
  const entries = [...people.values()].sort((left, right) => left.member.name.localeCompare(right.member.name))
  if (!entries.length) return <section className="page-content people-page"><p className="eyebrow">YOUR PEOPLE</p><h1 className="page-title">People<span>.</span></h1><div className="empty-state"><Users size={21} /><span>No people in active groups.</span></div></section>
  return <section className="page-content people-page"><p className="eyebrow">YOUR PEOPLE</p><h1 className="page-title">People<span>.</span></h1><div className="people-list">{entries.map(({ member, groups: memberGroups }) => <div className="people-row" key={member.id}><i style={{ backgroundColor: member.color }}>{member.initials.slice(0, 1)}</i><div><b>{member.name}</b><span>{memberGroups.length} {memberGroups.length === 1 ? 'active group' : 'active groups'}</span></div></div>)}</div></section>
}

import { ChevronDown, Users } from 'lucide-react'
import type { Group } from '../shared/models'

export function GroupList({ groups, onSelect }: { groups: Group[]; onSelect: (group: Group) => void }) {
  if (!groups.length) return <div className="empty-state"><Users size={21} /><span>No groups match your search.</span></div>
  return <div className="group-list">{groups.map((group, index) => <button className="group-row" key={group.id} onClick={() => onSelect(group)}>
    <span className="group-thumb" style={{ backgroundColor: group.color, backgroundImage: group.image ? `url(${group.image})` : undefined }}><span className="thumb-sheen" /></span>
    <span className="group-copy"><span className="group-name">{group.name}</span><span className="group-meta">{group.type} <i /> {group.members.length} people</span></span>
    <span className="avatar-stack">{group.members.slice(0, 3).map(person => <i key={person.id} style={{ backgroundColor: person.color }}>{person.initials.slice(0, 1)}</i>)}{group.members.length > 3 && <i className="avatar-more">+{group.members.length - 3}</i>}</span><ChevronDown className="row-chevron" size={15} />
    {index === 0 && <span className="group-accent" />}
  </button>)}</div>
}

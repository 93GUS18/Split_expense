import { useState } from 'react'
import { ArrowRight, Camera, ImagePlus, Plus, Trash2, X } from 'lucide-react'
import './groupForm.css'
import type { Group, Member } from '../shared/models'
import { palette } from '../shared/data'
import { freshId } from '../shared/utils'

type Props = { group: Group | null; currentMember: Member; onClose: () => void; onSave: (group: Group) => void; onDelete: (groupId: string) => void }

export function GroupModal({ group, currentMember, onClose, onSave, onDelete }: Props) {
  const [name, setName] = useState(group?.name ?? '')
  const [type, setType] = useState(group?.type ?? 'Trip')
  const [startDate, setStartDate] = useState(group?.startDate ?? '')
  const [endDate, setEndDate] = useState(group?.endDate ?? '')
  const [nameInput, setNameInput] = useState('')
  const [members, setMembers] = useState(group?.members ?? [currentMember])
  const [image, setImage] = useState(group?.image ?? '')
  const [color, setColor] = useState(group?.color ?? palette[1])
  const addNames = () => {
    const names = nameInput.split(/[\n,;]+/).map(value => value.trim().replace(/\s+/g, ' ')).filter(Boolean)
    setMembers(current => {
      const seen = new Set(current.map(person => person.name.toLowerCase()))
      const uniqueNames = names.filter(personName => {
        const key = personName.toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      return [...current, ...uniqueNames.map((personName, index) => ({
        id: freshId(),
        name: personName,
        initials: personName.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase(),
        color: palette[(current.length + index) % palette.length],
      }))]
    })
    setNameInput('')
  }
  const readImage = (file?: File) => { if (!file) return; const reader = new FileReader(); reader.onload = () => setImage(String(reader.result)); reader.readAsDataURL(file) }
  return <div className="modal-backdrop" onMouseDown={onClose}><section className="modal-sheet" onMouseDown={event => event.stopPropagation()}><div className="sheet-handle" /><div className="modal-heading"><div><p className="eyebrow">{group ? 'MAKE IT YOURS' : 'BETTER TOGETHER'}</p><h2>{group ? 'Edit your group' : 'A new group'}</h2></div><button className="close-button" onClick={onClose} aria-label="Close"><X size={20} /></button></div>
    <form onSubmit={event => { event.preventDefault(); if (!name.trim() || (startDate && endDate && endDate < startDate)) return; onSave({ id: group?.id ?? freshId(), name: name.trim(), type, image: image || undefined, color, startDate: startDate || undefined, endDate: endDate || undefined, settled: group?.settled, members }) }}>
      <label className="cover-upload" style={{ backgroundColor: color, backgroundImage: image ? `linear-gradient(#0002,#0002),url(${image})` : undefined }}><input type="file" accept="image/*" onChange={event => readImage(event.target.files?.[0])} /><span><ImagePlus size={19} /> {image ? 'Change cover photo' : 'Add a cover photo'}</span><Camera size={19} /></label>
      <div className="color-row">{palette.map(swatch => <button type="button" key={swatch} className={`color-swatch ${color === swatch ? 'chosen' : ''}`} style={{ backgroundColor: swatch }} onClick={() => setColor(swatch)} aria-label={`Choose color ${swatch}`} />)}</div>
      <label className="field-label">Group name<input required autoFocus value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Weekend in the mountains" /></label>
      <label className="field-label">What's the occasion?<select value={type} onChange={event => setType(event.target.value)}>{['Trip', 'Big trip', 'Getaway', 'Home', 'Couple', 'Event', 'Other'].map(option => <option key={option}>{option}</option>)}</select></label>
      <div className="two-fields trip-dates"><label className="field-label">Starts <span className="soft-label">Optional</span><input type="date" value={startDate} onChange={event => setStartDate(event.target.value)} /></label><label className="field-label">Ends <span className="soft-label">Optional</span><input type="date" min={startDate || undefined} value={endDate} onChange={event => setEndDate(event.target.value)} /></label></div>
      {startDate && endDate && endDate < startDate && <p className="validation-note">End date must be on or after the start date.</p>}
      <label className="field-label">People <span className="soft-label">{members.length} in this group</span><div className="invite-input"><input value={nameInput} onChange={event => setNameInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addNames() } }} placeholder="Add names, separated by commas" type="text" /><button type="button" onClick={addNames} aria-label="Add people"><Plus size={19} /></button></div></label>
      <div className="member-chips">{members.map(person => <span className="member-chip" key={person.id}><i style={{ backgroundColor: person.color }}>{person.initials.slice(0, 1)}</i>{person.name.split(' ')[0]}{person.id !== currentMember.id && <button type="button" onClick={() => setMembers(current => current.filter(item => item.id !== person.id))} aria-label={`Remove ${person.name}`}><X size={13} /></button>}</span>)}</div>
      <button className="primary-button" type="submit">{group ? 'Save changes' : 'Create group'} <ArrowRight size={17} /></button>
      {group && <button className="delete-group-form" type="button" onClick={() => onDelete(group.id)}><Trash2 size={16} /> Delete this group</button>}
    </form>
  </section></div>
}

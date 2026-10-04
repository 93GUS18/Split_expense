import type { DriveData } from '../shared/models'

const driveScope = 'https://www.googleapis.com/auth/drive.file'
const folderName = 'Tandem Expenses'
const dataFileName = 'tandem-data.json'

const driveRequest = async (token: string, url: string, init: RequestInit = {}) => {
  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(url, { ...init, headers })
  if (!response.ok) {
    if (response.status === 401) throw new Error('Google Drive access expired. Reconnect and retry.')
    if (response.status === 403) throw new Error('Google Drive access was denied. Check Drive API setup and approve file access.')
    throw new Error(`Google Drive request failed (${response.status}). Please retry.`)
  }
  return response
}

const findFile = async (token: string, query: string) => {
  const params = new URLSearchParams({ spaces: 'drive', pageSize: '100', fields: 'files(id,name,mimeType)', q: query })
  const response = await driveRequest(token, `https://www.googleapis.com/drive/v3/files?${params}`)
  const result = await response.json() as { files?: Array<{ id: string; name: string; mimeType: string }> }
  return result.files ?? []
}

export const getDriveScope = () => driveScope

export const getOrCreateDriveFolder = async (token: string) => {
  const folders = await findFile(token, `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and 'root' in parents and trashed = false`)
  if (folders[0]) return folders[0].id
  const response = await driveRequest(token, 'https://www.googleapis.com/drive/v3/files?fields=id', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: folderName, mimeType: 'application/vnd.google-apps.folder' }),
  })
  const folder = await response.json() as { id: string }
  return folder.id
}

export const loadDriveData = async (token: string, folderId: string) => {
  const files = await findFile(token, `'${folderId}' in parents and name = '${dataFileName}' and trashed = false`)
  if (!files[0]) return { fileId: null, data: null }
  const response = await driveRequest(token, `https://www.googleapis.com/drive/v3/files/${files[0].id}?alt=media`)
  return { fileId: files[0].id, data: await response.json() as Partial<DriveData> }
}

export const saveDriveData = async (token: string, folderId: string, fileId: string | null, data: DriveData) => {
  const content = JSON.stringify(data)
  if (fileId) {
    await driveRequest(token, `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: content,
    })
    return fileId
  }
  const boundary = `tandem_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const metadata = JSON.stringify({ name: dataFileName, mimeType: 'application/json', parents: [folderId] })
  const body = [`--${boundary}`, 'Content-Type: application/json; charset=UTF-8', '', metadata, `--${boundary}`, 'Content-Type: application/json', '', content, `--${boundary}--`, ''].join('\r\n')
  const response = await driveRequest(token, 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
    method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${boundary}` }, body,
  })
  const file = await response.json() as { id: string }
  return file.id
}

export type DataProvider = {
  id: string
  name?: string
  description?: string
  createdAt?: Date
  updatedAt?: Date
  tags?: string[]
  useCases?: string[]
  live: boolean
  download: boolean
  isThirdParty: boolean
  free: boolean
  dataGithubName?: string
  dataGithubLink?: string
  dataCloudLink?: string
  dataCloudName?: string
  category?: string
  dataSpace?: string
  location?: string
  foundingYear?: string
  addToXnodeMessage?: string
  relevantDocs?: string
  logoURL?: string
  specification?: string
  details?: string
  website?: string
  downloadCSVLink?: string
  type?: string
  liveLink?: string
  company?: string
  popularity?: number
  sql?: string
}

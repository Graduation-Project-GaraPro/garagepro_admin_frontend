export type Province = { 
  idProvince: string; 
  name: string 
}

export type Commune = { 
  idProvince: string; 
  idCommune: string; 
  name: string 
}

export class LocationService {
  private dbUrl = '/data/db.json'

  private communesCache: Record<string, Commune[]> = {}
  private provinces: Province[] = []

  async getProvinces(): Promise<Province[]> {
    if (this.provinces.length) return this.provinces

    try {
      const response = await fetch(this.dbUrl)
      if (!response.ok) throw new Error('Failed to load DB')
      const data = await response.json()

       console.log("data",data)
      this.provinces = data.province || []
      return this.provinces
    } catch (err) {
      console.error('Failed to fetch provinces:', err)
      return []
    }
  }

  async getCommunes(provinceCode: string): Promise<Commune[]> {
    if (this.communesCache[provinceCode]) return this.communesCache[provinceCode]

    try {
      const response = await fetch(this.dbUrl)
      if (!response.ok) throw new Error('Failed to load DB')
      const data = await response.json()
    console.log(data)
      const filtered: Commune[] = (data.commune || []).filter((c: Commune) => c.idProvince === provinceCode)
      this.communesCache[provinceCode] = filtered
      return filtered
    } catch (err) {
      console.error('Failed to fetch communes:', err)
      return []
    }
  }
}
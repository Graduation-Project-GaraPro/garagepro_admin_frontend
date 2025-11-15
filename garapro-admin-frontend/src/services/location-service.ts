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

  private async loadDb() {
    const response = await fetch(this.dbUrl)
    if (!response.ok) throw new Error('LOAD_DB_FAILED')
    return response.json()
  }

  async getProvinces(): Promise<Province[]> {
    if (this.provinces.length) return this.provinces

    try {
      const data = await this.loadDb()
      this.provinces = data.province || []

      if (!this.provinces.length) {
        // Không có province nào trong DB → coi là lỗi cấu hình
        throw new Error('NO_PROVINCE_IN_DB')
      }

      return this.provinces
    } catch (err) {
      console.error('Failed to fetch provinces:', err)
      // QUAN TRỌNG: đừng return [] nữa, để caller tự xử lý
      throw err
    }
  }

  async getCommunes(provinceCode: string): Promise<Commune[]> {
    if (!provinceCode) return []

    if (this.communesCache[provinceCode]) return this.communesCache[provinceCode]

    try {
      const data = await this.loadDb()

      const provinces: Province[] = data.province || []
      const communes: Commune[] = data.commune || []

      const provinceExists = provinces.some(p => p.idProvince === provinceCode)
      if (!provinceExists) {
        const err = new Error('PROVINCE_NOT_FOUND_IN_DB')
        console.error(err)
        throw err
      }

      const filtered = communes.filter(c => c.idProvince === provinceCode)
      this.communesCache[provinceCode] = filtered
      return filtered
    } catch (err) {
      console.error('Failed to fetch communes:', err)
      // QUAN TRỌNG: rethrow
      throw err
    }
  }
}
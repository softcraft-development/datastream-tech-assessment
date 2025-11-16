export type Row = string[]
export type RawData = Row[]
export type Columns = Record<string, number>

export interface Results {
  average?: number
  columns: Columns
  count: number
  sum: number
  errors: string[]
  warnings: string[]
}

export class SchemaError extends Error { }

export const characteristicColumn = "CharacteristicName"
export const resultColumn = "ResultValue"
export const requiredColumns = [characteristicColumn, resultColumn]

export const waterTemperatureCharacteristic = "Temperature, water"

export function loadColumns(results: Results, header: Row) {
  header.reduce((state: Columns, field, index) => {
    state[field] = index
    return state
  }, results.columns)

  const missing = requiredColumns.reduce((state, column) => {
    if (Object.hasOwn(results.columns, column)) return state

    results.errors.push(`Missing required column: ${column}.`)
    return true
  }, false)

  if (missing) throw new SchemaError("Some columns are missing")
}

export function begin(): Results {
  return {
    average: undefined,
    columns: {},
    count: 0,
    errors: [],
    sum: 0,
    warnings: [],
  }
}

export function addWaterTemperature(state: Results, row: Row, rowIndex: number) {
  const characteristicName = row[state.columns[characteristicColumn]]
  if (characteristicName !== waterTemperatureCharacteristic) return state

  const resultValueRaw = row[state.columns[resultColumn]]
  const resultValue = Number.parseFloat(resultValueRaw)
  if (Number.isNaN(resultValue)) {
    state.warnings.push(`Row ${rowIndex + 1} has a non-numeric ${resultColumn}: ${resultValueRaw} `)
    return state
  }

  state.count += 1
  state.sum += resultValue
}

export function averageWaterTemperature(rawData: RawData): Results {
  const results = begin()

  try {
    rawData.reduce((state, row, rowIndex) => {
      if (rowIndex === 0) {
        loadColumns(state, row)
        return state
      }

      addWaterTemperature(state, row, rowIndex)

      return state
    }, results)
  }
  catch (error) {
    if (error instanceof SchemaError) {
      return results
    }
    throw error
  }

  if (results.count > 0) {
    results.average = results.sum / results.count
  }
  else {
    results.warnings.push("No water temperature data found.")
  }
  return results
}
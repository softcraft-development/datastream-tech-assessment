// Even though these aren't super useful outside of this context,
// I almost always export everything from a module,
// mostly so that I can write tests around them.
// The names are meant to be context-specific (and thus generic);
// they can always be renamed by the importer as necessary.
export type Row = string[]
export type RawData = Row[]
export type Schema = Record<string, number>

export interface Results {
  // Note that `average` may not be present if the data isn't valid enough.
  average?: number
  schema: Schema
  // Note that `count` and `sum` aren't really used outside of `addWaterTemperature`.
  // We need mutable state as we process the file,
  // including `count` and `sum` but also `errors` and `warnings`.
  // The latter 2 are what's relevant in the results.
  // But in the name of KISS, we'll reuse the same object for both building and reporting the results.
  // It doesn't have to be this way; refactor when it makes sense.
  count: number
  sum: number
  errors: string[]
  warnings: string[]
}

// A custom error lets us treat it specially; see below.
export class SchemaError extends Error { }

// We'll hard-code the columns necessary for the requirements for now.
// But we could certainly expand this to be more flexible,
// without too much difficulty.
export const characteristicColumn = "CharacteristicName"
export const resultColumn = "ResultValue"
export const requiredColumns = [characteristicColumn, resultColumn]

export const waterTemperatureCharacteristic = "Temperature, water"

// Note that this mutates `results`.
// It doesn't necessarily need to be this way,
// but it is most _efficient_ this way.
// As long as the caller understand this, it's fine.
export function addSchema(results: Results, header: Row) {
  header.reduce((state: Schema, field, index) => {
    state[field] = index
    return state
  }, results.schema)

  const missing = requiredColumns.reduce((state, column) => {
    if (Object.hasOwn(results.schema, column)) return state

    // Note: we are mixing display-ish issues at this level
    // by adding error/warning messages here.
    // That's strictly due to KISS for this project.
    // We can certainly make our errors & warnings more abstract;
    // this would be useful when we have a requirement for i18n.
    results.errors.push(`Missing required column: ${column}.`)
    return true
  }, false)

  // We'll `throw` an error here so that we can break out of the `reduce` call in `addWaterTemperature`.
  // We could instead put `missing` on `Results` if we wanted to,
  // but this works fine for now.
  if (missing) throw new SchemaError("Some columns are missing")
}

export function begin(): Results {
  // Because we're including mutable arrays,
  // we need to make sure we're creating new instances of `Results` everywhere.
  // But for that, we could have made this a `Readonly<Results>` and kept a single instance.
  return {
    average: undefined,
    schema: {},
    count: 0,
    errors: [],
    sum: 0,
    warnings: [],
  }
}

// Note that this also mutates the `results`, for efficiency.
// Rewriting this to be immutable is not difficult.
export function addWaterTemperature(results: Results, row: Row, rowIndex: number) {
  const characteristicName = row[results.schema[characteristicColumn]]
  if (characteristicName !== waterTemperatureCharacteristic) return results

  const resultValueRaw = row[results.schema[resultColumn]]
  // Note that `averageWaterTemperature` is more than just about calculating the average;
  // it's about validating the the data.
  // We don't have to necessarily couple that together,
  // but it does work fine, and keeps it efficient.
  // Refactor as necessary.
  const resultValue = Number.parseFloat(resultValueRaw)
  if (Number.isNaN(resultValue)) {
    results.warnings.push(`Row ${rowIndex + 1} has a non-numeric ${resultColumn}: ${resultValueRaw} `)
    return results
  }

  // There's any number of additional data validations that we could do here.
  // Ex: temperature values that are out of a reasonable range?
  // All of that is dependent on the needs of the product and the data we encounter.
  // For now, KISS.
  results.count += 1
  results.sum += resultValue
}

export function averageWaterTemperature(rawData: RawData): Results {
  const results = begin()

  try {
    // This lets us process the (potentially large) data set in one pass,
    // while handling bad & missing headers & rows gracefully,
    // and communicating relevant problems back to the user.
    rawData.reduce((state, row, rowIndex) => {
      if (rowIndex === 0) {
        addSchema(state, row)
        return state
      }

      addWaterTemperature(state, row, rowIndex)

      return state
    }, results)
  }
  catch (error) {
    // We know that `addSchema` is already adding _specific_ errors to the `Results`,
    // and potentially more than one.
    // So we don't need to add a new error here.
    // This error is what lets us break out of processing the whole (large?) data set
    // when we will _never_ get valid answers due to untrue assumptions on the header row.
    if (error instanceof SchemaError) {
      return results
    }
    // Any other error means something unexpected has happened (and probably our bug).
    // Fail the whole function and let the caller choose how to deal with it.
    throw error
  }

  if (results.count > 0) {
    // Note that we may be able to calculate a valid average
    // even if errors/warnings exist.
    // One example: bad input data that has been rejected.
    results.average = results.sum / results.count
  }
  else {
    results.warnings.push("No water temperature data found.")
  }
  return results
}
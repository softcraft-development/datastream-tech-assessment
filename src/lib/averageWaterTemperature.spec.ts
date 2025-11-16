import { memo } from "radash"
import { beforeEach, describe, expect, it } from "vitest"
import { averageWaterTemperature, characteristicColumn, resultColumn, waterTemperatureCharacteristic, type RawData, type Results } from "./averageWaterTemperature"

let rawData: () => RawData
let result: () => Results

beforeEach(() => {
  result = memo(() => averageWaterTemperature(rawData()))
})

// DRY up your tests too.
function itHasNoAverage() {
  it("has no average", () => {
    expect(result().average).toBeUndefined()
  })
}

function itReportsErrors() {
  it("reports errors", () => {
    expect(result().errors).not.toEqual([])
  })
}

function itReportsNoErrors() {
  it("reports no errors", () => {
    expect(result().errors).toEqual([])
  })
}

function itReportsWarnings() {
  it("reports warnings", () => {
    expect(result().warnings).not.toEqual([])
  })
}

function itReportsNoWarnings() {
  it("reports no warnings", () => {
    expect(result().warnings).toEqual([])
  })
}

describe("with no data", () => {
  beforeEach(() => {
    rawData = memo(() => [])
  })

  itReportsWarnings()
  itHasNoAverage()
})


describe("when the first row is missing the characteristic column", () => {
  beforeEach(() => {
    rawData = memo(() => [[resultColumn]])
  })

  itHasNoAverage()
  itReportsErrors()
})

describe("when the first row is missing the result column", () => {
  beforeEach(() => {
    rawData = memo(() => [[characteristicColumn]])
  })

  itHasNoAverage()
  itReportsErrors()
})

describe("with a valid header", () => {
  let data: () => RawData
  beforeEach(() => {
    rawData = memo(() => [
      [characteristicColumn, resultColumn],
      ...data()
    ])
  })

  describe("and no data", () => {
    beforeEach(() => {
      data = memo(() => [])
    })

    itHasNoAverage()
    itReportsWarnings()
    itReportsNoErrors()
  })

  describe("and data without a temperature characteristic", () => {
    beforeEach(() => {
      data = memo(() => [["Not the temperature characteristic", "Any value; irrelevant"]])
    })

    itHasNoAverage()
    itReportsWarnings()
    itReportsNoErrors()
  })

  describe("and temperature characteristics", () => {
    beforeEach(() => {
      data = memo(() => [
        [waterTemperatureCharacteristic, "3"],
        [waterTemperatureCharacteristic, "5"]
      ])
    })

    it("has the average", () => {
      expect(result().average).toEqual((3 + 5) / 2)
    })
    itReportsNoErrors()
    itReportsNoWarnings()

    describe("where some of the data is non-numeric", () => {
      beforeEach(() => {
        data = memo(() => [
          [waterTemperatureCharacteristic, "7"],
          [waterTemperatureCharacteristic, "Eleven"]
        ])
      })

      it("has the average of the valid data", () => {
        expect(result().average).toEqual(7)
      })
      itReportsNoErrors()
      itReportsWarnings()
    })
  })
})

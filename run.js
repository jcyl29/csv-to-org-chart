const fs = require('fs')
const csv = require('csv-parser')
const _ = require('lodash')

/*

Given a csv input of employee,manager pairs, construct an org chart tree and output it as a csv.
See output.csv for the example format of the solution that matches the input files given.

- Reports should be sorted alphabetically in the output CSV

- --> Each report should occupy a single row in the CSV with their name printed one column deeper than their manager

- [X] If there are no top level managers in the input CSV, the application should throw an error

- If the input CSV contains a circular chain of command, the application should detect it and throw an error
  - If there is a loop, print out the circular chain of command in the error.
    Ex: "Circular chain of command: Person A - Person B - Person C - Person A"

Ex: input.csv
employee,manager
jack,
eric,jack
andrew,dini
dini,jack

output:
jack,
,dini
,,andrew
,eric

*/

let resultCSV = ''

const renderDRs = (drList, nesting) => {
  const commaString = [...Array(nesting)].map(() => ',').join('')
  return drList.map(({ employee }) => `${commaString}${employee}`).join('\n')
}

const sortbyName = (d1, d2) => {
  const nameA = d1.employee.toUpperCase()
  const nameB = d2.employee.toUpperCase()

  let comparison = 0
  if (nameA > nameB) {
    comparison = 1
  } else if (nameA < nameB) {
    comparison = -1
  }
  return comparison
}

const getDirectReports = (manager, data) => {
  return data
    .filter((row) => row.manager === manager)
    .sort((a, b) => sortbyName(a, b))
}

const getEmployee = (email, data) => {
  return data.filter((row) => row.employee === email)[0]
}

const buildOrgChart = (data) => {
  // console.log(data, 'data')
  // Put your implementation here:
  if (
    data.every((row) => {
      return !!row.manager
    })
  ) {
    throw new Error('no top level manager found')
  }

  const topLevelManager = data.filter((row) => row.manager === '')[0]

  const test = getEmployee('joan@lattice.com', data)

  console.log(
    'topLevelManager.employee',
    topLevelManager.employee,
    'test',
    test
  )

  const commaHierachyGenerator = (personData) => {
    while (personData.employee !== topLevelManager.employee) {
      return ',' + commaHierachyGenerator(getEmployee(personData.manager, data))
    }
    return ''
  }

  const result = commaHierachyGenerator(test) + test.employee
  console.log('commaHierachyGenerator result', result)

  console.log(resultCSV)

  const obj = {}

  const foo = (email) => {
    // console.log('email', email, 'result', data.filter( row=> row.manager === email))
    const listOfDirectReports = data.reduce((acc, row) => {
      if (row.manager === email) {
        acc.push(row.employee)
      }
      return acc
    }, [])
    obj[email] = listOfDirectReports
  }

  data.forEach((row) => {
    foo(row.employee)
  })

  // console.log("obj", obj);

  // data.forEach(row=>{
  //   resultCSV += row.employee +`\n`;
  // })
  //
  // // console.log(resultCSV);

  // resultCSV = "jack"
}

// Harness for reading an input CSV file into an array
const run = async (inputFilePath) => {
  const rows = []
  const streamEnd = new Promise((resolve, reject) => {
    fs.createReadStream(inputFilePath)
      .pipe(csv())
      .on('data', function (data) {
        try {
          rows.push(data)
        } catch (err) {
          console.log(err)
          reject()
        }
      })
      .on('end', function () {
        buildOrgChart(rows)
        resolve()
      })
  })
  return streamEnd
}

// Test
const isEqual = (expected, actual) => {
  try {
    const splitExpected = expected
      .split('\n')
      .filter((entry) => entry.includes('@lattice.com'))
    const splitActual = actual
      .split('\n')
      .filter((entry) => entry.includes('@lattice.com'))

    let isEqual = true
    splitExpected.forEach((row, index) => {
      if (row !== splitActual[index]) {
        isEqual = false
      }
    })

    return isEqual
  } catch (err) {
    return false
  }
}

;(async () => {
  // Run test
  await run('ordered_input.csv')
  const expectedAnswer = (await fs.readFileSync('./output.csv')).toString()

  console.log('===RESULT===')
  console.log(isEqual(expectedAnswer, resultCSV))
})()

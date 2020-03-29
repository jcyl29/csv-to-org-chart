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

const sortbyName = (nameA, nameB) => {
  const nameAUpper = nameA.toUpperCase()
  const nameBUpper = nameB.toUpperCase()

  let comparison = 0
  if (nameAUpper > nameBUpper) {
    comparison = 1
  } else if (nameAUpper < nameBUpper) {
    comparison = -1
  }
  return comparison
}

const buildOrgChart = (data) => {
  // Put your implementation here:
  if (
    data.every((row) => {
      return !!row.manager
    })
  ) {
    throw new Error('no top level manager found')
  }

  const topLevelManager = data.filter((row) => row.manager === '')[0]

  const getDirectReports = (manager) => {
    return data
      .filter((row) => row.manager === manager)
      .sort((a, b) => sortbyName(a.employee, b.employee))
  }

  // CIRCULAR CHAIN OF COMMAND PSEUDOCODE
  // for a given person
  //  if the employees subordinates, and if those subordinates have subordinates, if any of these nested
  //    subordinates have the given person as their manager
  //    record the the chain of command, and throw error
  //  else
  //    continue the loop

  // PATTERN
  // declare some variables to store some state outside of the recursive function
  // write recursive function that will mutate those outside variables
  // there should be some logic between the variables in the recursive function
  // and the outside variables that will dictate the base case of the recursion
  // Or in other words, it will determine when to break out of recursion

  data.map((row) => {
    const testEmployee = row.employee
    // if a direct report's subordinate ends up being test employee (the manager)
    // then a circular reference has been created
    // then this test employee's direct reports will be looped again, causing an
    // infinite loop.  Keep track how many times this looping happens,
    // and throw error after more than one loop has iterated
    let loopedOnce = 0
    const path = []

    const checkCircularReference = (employee) => {
      path.push(employee)
      while (getDirectReports(employee).length > 0) {
        if (employee === testEmployee) {
          loopedOnce = loopedOnce + 1
        }

        if (loopedOnce > 1) {
          const pathString = path.join(' -> ')
          throw new Error(`Circular chain of command: ${pathString}`)
        }

        const drs = getDirectReports(employee)
        drs.forEach(({ employee }) =>
          checkCircularReference(employee, employee)
        )
        return
      }
    }

    checkCircularReference(testEmployee)
  })

  const resultList = []

  // CSV GENERATOR PSEUDOCODE
  // for a given employee
  //    get his direct reports
  //    if direct report has no subordinates
  //         print out row
  //    else
  //         get the subordinates of the direct report and repeat process

  // PATTERN
  // declare some variables to store some state outside of the recursive function
  // write recursive function that will mutate those outside variables
  // there should be some logic between the variables in the recursive function
  // and the outside variables that will dictate the base case of the recursion
  // Or in other words, it will determine when to break out of recursion

  const printList = (employee, nesting = 0) => {
    const currentNesting = nesting
    const commaPrefixString = ''
      ? nesting === 0
      : [...Array(nesting)].map(() => ',').join('')

    while (getDirectReports(employee).length > 0) {
      console.log(
        `printList, inside while loop, employee=${employee}, nesting=${nesting}`
      )

      const drs = getDirectReports(employee)

      resultList.push(`${commaPrefixString}${employee}`)
      drs.forEach(({ employee }) => printList(employee, currentNesting + 1))
      return
    }

    console.log(
      `printList, out of while loop, employee=${employee} nesting=${nesting}`
    )
    resultList.push(`${commaPrefixString}${employee}`)
  }

  printList(topLevelManager.employee)
  resultCSV = resultList.join('\n')
  console.log(resultCSV)
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
      .filter((entry) => entry.includes('@company.com'))
    const splitActual = actual
      .split('\n')
      .filter((entry) => entry.includes('@company.com'))

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

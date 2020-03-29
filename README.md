# CSV to org chart

Given a csv input of employee,manager pairs, construct an org chart tree and output it as a csv.
See output.csv for the example format of the solution that matches the input files given.

- Reports should be sorted alphabetically in the output CSV

- --> Each report should occupy a single row in the CSV with their name printed one column deeper than their manager

- [X] If there are no top level managers in the input CSV, the application should throw an error

- If the input CSV contains a circular chain of command, the application should detect it and throw an error
  - If there is a loop, print out the circular chain of command in the error.
    Ex: "Circular chain of command: Person A - Person B - Person C - Person A"
    
# Run locally
- `yarn install`
- `node run.js` 
- the script will have a test to see that the generated CSV will match the output.csv already on the repo  

# Branches
- master, no solution
- csv, has solution to create the csv
- circular_reference, modifies input.csv to force an error.  App should throw error and no CSV generated
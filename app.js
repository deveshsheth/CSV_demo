const fs = require('fs');
const {parse} = require('csv-parse');
const { Validator } = require('csv-validator');

const filePath = './reports.csv';
const validationSchema = {
    header: ['NAME', 'AGE', 'DOB', 'PAN'],
    cast: true,
    skipEmptyLines: true,
    trim: true,
    relax: true,
    checkType: true,
    columns: {
        NAME: {
            required: true,
            minLength: 2,
            maxLength: 20,
            pattern: /^[A-Za-z\s]+$/,
        },
        AGE: {
            required: true,
            integer: true,
            min: 18,
            max: 120,
        },
        DOB: {
            required: true,
            pattern: "^(0[1-9]|1[012])[-/.](0[1-9]|[12][0-9]|3[01])[-/.](19|20)\\d\\d$", // dd/mm/yyyy
        },
        PAN: {
            required: true,
            pattern: "[A-Z]{5}[0-9]{4}[A-Z]{1}",
        }
    },
};

async function validateCsvRow(row) {
  const validator = new Validator(validationSchema);
  const validationResults = await validator.validate(row);
  if (validationResults.errors.length > 0) {
    console.error('Validation errors:', validationResults.errors);
    return false;
  }
  return true;
}


  async function readAndValidateCsv(filePath) {
    const validRows = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(parse({ delimiter: ",", from_line: 2 }))
        .on('data', async (row) => {
          const isValid = await validateCsvRow(row);
          if (isValid) {
            validRows.push(row);
          }
        })
        .on('end', () => {
          resolve(validRows);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  

readAndValidateCsv(filePath)
  .then((validRows) => {
    console.log('Valid rows:', validRows);
  })
  .catch((error) => {
    console.error('Error reading and validating CSV file:', error);
  });



const fs = require('fs');
const csv = require('csv-parser');

function getColumnFromCSV(csvFile, columnIndex, delimiter = ',') {
  return new Promise((resolve, reject) => {
    const column = [];

    fs.createReadStream(csvFile)
      .pipe(csv({ delimiter }))
      .on('data', (row) => {
        const rowData = Object.values(row);
        if (rowData.length > columnIndex) {
          column.push(rowData[columnIndex]);
        }
      })
      .on('end', () => {
        resolve(column);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}
//D:\Movie Genres\movie-genres
const csvFile = "dataset_movies.csv";
const columnIndex = 2; // Index of the desired column (0-based)
// Matrix 15x15 
const data = [];

(async () => {
  try {
    for (let i = 0; i < 15; i++) {
      const columnI = await getColumnFromCSV(csvFile, i);

      const row = [];
      for (let j = 0; j < 15; j++) {
        const columnJ = await getColumnFromCSV(csvFile, j);

        let ctr = 0;
        for (let k = 0; k < columnI.length; k++) {
          if (columnI[k] === columnJ[k]) {
            ctr++;
          }
        }
        row.push(ctr);
      }

      data.push(row);
    }

    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
})();

const express = require('express');
const fs = require('fs');

const app = express();

// Takes nums in query string, returns a mean
app.get('/mean', function(request, response, next) {
  verifyInput(request.query, response);

  let nums = getNumberArrayFromQuery(request.query);
  let numResult = getSumFromArray(nums) / nums.length;
  let responseString = `The mean of ${nums.join(', ')} is ${numResult}`;
  if (request.query.save.toLowerCase() !== 'false') {
    writeResult(responseString.concat('\n'));
  }
  return response.json(responseString);
});

// Takes nums in query string, returns a median
app.get('/median', function(request, response, next) {
  verifyInput(request.query, response);

  let nums = getNumberArrayFromQuery(request.query);
  if (nums.length % 2 === 1) {
    var numResult = nums.sort()[Math.floor(nums.length / 2)];
  } else {
    let middleIndex = Math.floor(nums.length / 2);
    let medianNumbers = nums.sort().slice(middleIndex - 1, middleIndex + 1);
    var numResult = medianNumbers.reduce((acc, next) => acc + next / 2, 0);
  }
  let responseString = `The median of ${nums.join(', ')} is ${numResult}`;
  if (request.query.save.toLowerCase() !== 'false') {
    writeResult(responseString.concat('\n'));
  }
  return response.json(responseString);
});

// Takes nums in query string, returns a mode
app.get('/mode', function(request, response, next) {
  verifyInput(request.query, response);
  let nums = getNumberArrayFromQuery(request.query);
  let numResult = findMode(request.query.nums);
  let responseString = `The mode of ${nums.join(', ')} is ${numResult}`;
  if (request.query.save.toLowerCase() !== 'false') {
    writeResult(responseString.concat('\n'));
  }
  return response.json(responseString);
});

app.get('/results', function(request, response, next) {
  fs.readFile('./results.txt', 'utf8', (error, data) => {
    if (error) {
      if (error.errno === -2) {
        return response.status(404).send('There are no results yet');
      } else {
        console.error(error);
        process.exit(1);
      }
    }
    if (data.length === 0) {
      return response.status(404).send('There are no results yet');
    }
    return response.send(data);
  });
});

function verifyInput(query, response) {
  if (query.nums.length === 0) {
    return response.status(404).send('nums are required');
  }
  let rawArray = query.nums.split(',');
  let nums = getNumberArrayFromQuery(query).map(item => Number(item));
  if (nums.some(item => isNaN(item))) {
    let offenders = rawArray.filter((item, index) => isNaN(nums[index]));
    return response.status(400).send(`${offenders} is/are not number(s)`);
  }
}

function getNumberArrayFromQuery(query) {
  return query.nums.split(',');
}

function getSumFromArray(arr) {
  return arr.reduce((acc, next, index) => acc + Number(next), 0);
}

function findMode(arr) {
  let counter = {};
  let mostFrequent;
  let highestCount = 0;
  for (num of arr) {
    counter[num] = ++counter[num] || 1;
    if (counter[num] > highestCount) {
      highestCount = counter[num];
      mostFrequent = num;
    }
  }
  return mostFrequent;
}

function writeResult(responseString) {
  fs.appendFile('./results.txt', responseString, error => {
    if (error) {
      console.error(error);
      process.exit(1);
    }
  });
}

app.listen(3000, () => console.log('I should have routes by now....'));

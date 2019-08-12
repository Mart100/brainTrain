$(() => {

  db = firebase.firestore()

  let urlParams = new URLSearchParams(location.search)

  let username = urlParams.get('name')

  db.collection("brainTrain-users").doc(username).collection('scores').get().then((coll) => {
    let userScores = {}
    coll.forEach((doc) => { userScores[doc.id] = doc.data() })
    showStatistics(userScores)
  })
  
})



function showStatistics(userScores) {
  console.log(userScores)


  // create improevement graph
  createGraph(userScores)

 

  // calculate average per length
  let scoresPerLength = getScoresPerLength(userScores)
  let averagePerLength = {}
  for(let length in scoresPerLength) {
    let scoreCount = scoresPerLength[length].length
    let total = 0
    for(let score of scoresPerLength[length]) total += score.percentage

    let average = total / scoreCount
    averagePerLength[length] = average
  }

  // add averages to table
  for(let length in averagePerLength) {
    let average = averagePerLength[length]

    $('#average table').append(`
<tr class="cell" id="cell-${length}">
  <td>${length}</td>
  <td class="score">
    <div class="scoreBar">
      <div class="scoreNum">${average}%</div>
      <div class="score" style="width: ${average}%;"></div>
    </div>
  </td>
</tr>
    `)

  }

  // add all scores to history
  for(let dateMS in userScores) {
    let score = userScores[dateMS]

    let date = new Date()
    date.setTime(dateMS)

    let dateSegments = date.toString().split(' ')
    let dateString = dateSegments[4]+' '+dateSegments[1]+' '+dateSegments[2]+' '+dateSegments[3]

    $('#history .scores').prepend(`
<div id="score-${dateMS}" class="score">
  <div class="date">DATE: ${dateString}</div>
  <div class="scoreBar">
    <div class="scoreNum">${score.percentage}%</div>
    <div class="score"></div>
  </div>
  <div class="length">LENGTH: ${score.length}</div>
  <hr>
</div>
    `)

    $(`#score-${dateMS} .scoreBar .score`).css('width', `${score.percentage}%`)

  }

}

function getScoresPerLength(userScores) {
  let scoresPerLength = {}
  for(let dateMS in userScores) {
    let score = userScores[dateMS]
    if(scoresPerLength[score.length] == undefined) scoresPerLength[score.length] = []
    scoresPerLength[score.length].push({date: Number(dateMS), percentage: score.percentage})
  }
  return scoresPerLength
}

function createGraph(userScores) {

  let datasets = []

  let sortedDates = Object.keys(userScores).sort((a, b) => Number(a)-Number(b))

  let allDates = []
  for(let date of sortedDates) {
    let newDate = new Date()
    newDate.setTime(date)
    allDates.push(newDate)
  }
  console.log(allDates)

  let startDate = Number(sortedDates[0])
  let endDate = Date.now()

  let totalDateLength = endDate-startDate

  let scoresPerLength = getScoresPerLength(userScores)

  for(let length in scoresPerLength) {

    let scores = scoresPerLength[length]

    scores.sort((a, b) => a.date-b.date)

    let data = []

    for(let score of scores) {

      let x = new Date() //((score.date - startDate) / totalDateLength) * 1000
      x.setTime(score.date)

      let y = score.percentage

      data.push({t: x, y: y})
    }
    
    console.log(data, 'data')
    console.log(scores, 'scores')

    let randomColor = colorToRGB(getRandomColor())
    datasets.push({
      label: `${length}`,
      backgroundColor: randomColor,
      borderColor: randomColor,
      fill: false,
      data: data
    })
  }

    let chart = new Chart($('#chart'), {
    type: 'line',
    data: {
      labels: allDates,
      datasets: datasets
    },
    options: {
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            parser: 'MM/DD/YYYY HH:mm',
            // round: 'day'
            tooltipFormat: 'll HH:mm'
          },
          scaleLabel: {
            display: true,
            labelString: 'Date'
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'value'
          }
        }]
      }
    }
  })

  console.log(datasets)
  console.log(chart)
}

function getRandomColor() {
  let color = []
  color[0] = Math.random()*255
  color[1] = Math.random()*255
  color[2] = Math.random()*255
  return color
}

function colorToRGB(color) {
  return `rgb(${color[0]}, ${color[1]}, ${color[2]})`
}
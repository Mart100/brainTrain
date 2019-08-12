let numberLength = 5
let database = {}
let username = ''
let backgroundColor = 'rgb(230, 230, 230)'
let db
let score = {
  correct: 0,
  wrong: 0,
  tries: 0
}

$(() => {
  start()
  
  db = firebase.firestore()

  $('#username_input').on('change', () => {
    $('#statistics_button').html(`See Statistics of ${$('#username_input').val()}`)
  })

  $('#statistics_button').on('click', () => {
    db.collection("brainTrain-users").doc($('#username_input').val()).collection('scores').get().then((coll) => {
      let userScores = {}
      coll.forEach((doc) => { userScores[doc.id] = doc.data() })
      showStatistics(userScores)
    })
    $('#body').html(' ')
  })

})

function showStatistics(userScores) {
  console.log(userScores)

    // create average
  $('#body').append(`
<div id="average">
  <div class="header">AVERAGE PER LENGTH</div>
  <table>
    <tr>
      <th>Length</th>
      <th>Score</th>
    </tr>
  </table>
</div>
`)

  // get scores per length
  let scoresPerLength = {}
  for(let dateMS in userScores) {
    let score = userScores[dateMS]
    if(scoresPerLength[score.length] == undefined) scoresPerLength[score.length] = []
    scoresPerLength[score.length].push(score.percentage)
  }

  // calculate average per length
  let averagePerLength = {}
  for(let length in scoresPerLength) {
    let scoreCount = scoresPerLength[length].length
    let total = 0
    for(let score of scoresPerLength[length]) total += score

    let average = total / scoreCount
    averagePerLength[length] = average
  }
  console.log(averagePerLength)

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

  // create history
  $('#body').append(`
<div id="history">
  <div class="header">SCORES HISTORY</div>
  <div class="scores"></div>
</div>
`)

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


function start() {

  // reset score
  score.correct = 0
  score.wrong = 0
  score.tries = 0

  // other
  $('body').css('background-color', backgroundColor)

  // on start click
  $('#menu').show()
  $('#input').hide()
  $('#text').hide()

  $('#startButton').on('click', () => {
    $('#menu').hide()
    $('#score').show()
    $('#text').show()
    numberLength = $('#length_input').val()
    username = $('#username_input').val()

    next()
  })
}

function calculatePercentage() {
  let percentage = (score.correct/score.tries)*100
  percentage = Math.round(percentage)
  $('#percentage').html(percentage)
  return percentage
}

async function next() {
  let random = randomString(numberLength)

  $('body').css('background-color', backgroundColor)
  $('#text').html(random)
  $('#input').hide()

  let time = numberLength*200
  if(time < 1000) time = 1000
  await sleep(time)

  $('#text').html('')
  $('#input').val('')
  $('#input').show()
  $('#input').focus()

  $('#input').off().on('keypress', async (event) => {
    if(event.key == 'Enter') {
      let inputValue = $('#input').val()

      if(inputValue == random) {
        $('body').css('background-color', 'green')
        score.correct++
      }

      if(inputValue != random) {
        $('body').css('background-color', 'red')
        score.wrong++
      }

      score.tries++
      updateScore()

      $('#input').off()

      await sleep(1000)

      if(score.tries >= 5) {
        if(database[username] == undefined) database[username] = {}
        let time = Date.now()
        let percentage = calculatePercentage()

        database[username][time] = {
          'percentage': percentage,
          'length': numberLength
        }

        // Add a new document in collection "cities"
        if(username != '') {
          db.collection("brainTrain-users").doc(username).collection('scores').doc(time.toString()).set({
            'percentage': percentage,
            'length': numberLength
          })
          .then(() => {
            console.log("Document successfully written!")
          })
        }

        start()
        return
      }



      next()
    }
  })

}

function updateScore() {
  $('#correct').html(score.correct)
  $('#wrong').html(score.wrong)
  $('#tries').html(score.tries)
  let percentage = calculatePercentage()
  $('#percentage').html(percentage)
}

function randomString(l) {
  let string = ''
  for(let i=0;i<l;i++) {
    string += Math.floor(Math.random()*10)
  }
  return string
}

function sleep(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}
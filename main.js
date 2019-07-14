let length = 5
let database = {}
let username = ''
let db
let score = {
  correct: 0,
  wrong: 0,
  tries: 0
}

$(() => {
  start()
  
  db = firebase.firestore()

})



function start() {
  //getDatabase()

  // reset score
  score.correct = 0
  score.wrong = 0
  score.tries = 0

  // other
  $('body').css('background-color', 'white')
  $('#username_input').val('')
  $('#length_input').val(5)

  // on start click
  $('#menu').show()
  $('#input').hide()
  $('#text').hide()

  $('#startButton').on('click', () => {
    $('#menu').hide()
    $('#score').show()
    $('#text').show()
    length = $('#length_input').val()
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
  let random = randomString(length)

  $('body').css('background-color', 'white')
  $('#text').html(random)
  $('#input').hide()

  let time = length*200
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
          'length': length
        }

        // Add a new document in collection "cities"
        if(username != '') {
          db.collection("brainTrain-users").doc(username).collection('scores').doc(time.toString()).set({
            'percentage': percentage,
            'length': length
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
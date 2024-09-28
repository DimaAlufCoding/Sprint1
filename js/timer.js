'use strict'


function startTimer() {
    gStartTime = Date.now()


    gTimerIntrval = setInterval(() => {
        const delta = Date.now() - gStartTime
        const formattedTime = formatTime(delta)

        var elTimer = document.querySelector('.timer')
        if (elTimer) {
            elTimer.innerText = formattedTime
        }
        gGame.secsPassed = formattedTime

    }, 1000)
}

function formatTime(ms) {

    var seconds = Math.floor((ms % 60000) / 1000)
    return `${padTime(seconds)}`
}

function padTime(val) {
    return String(val).padStart(2, '0')
}




function resetTimer() {
    clearInterval(gTimerIntrval)
    var elTimer = document.querySelector('.timer')
    if (elTimer) {
        elTimer.innerText = '00'
    }
}
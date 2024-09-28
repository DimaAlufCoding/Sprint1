'use strict'



function countLives(rowIdx, colIdx) {
    if (gBoard[rowIdx][colIdx].isMine) {
        gLiveCounter--
        liveIndication(gLiveCounter)
    }
}

function liveIndication(gLiveCounter) {
    var livesLeft = document.querySelector('h2 span')
    livesLeft.innerHTML = gLiveCounter
}
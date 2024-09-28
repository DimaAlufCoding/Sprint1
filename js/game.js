'use strict'


var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}
var gLevel3 = {
    SIZE: 12,
    MINES: 12

}
var gLevel2 = {
    SIZE: 8,
    MINES: 8
}

var gLevel1 = {
    SIZE: 4,
    MINES: 4
}
var gTimerIntrval
var gStartTime
var gBoard, gIsFirstClick = true, gLiveCounter, gIsHint = false, gHintLeft = 3, gSafeLeft = 3, gIsSafe = false


const HAPPY_SMILEY = '😃', WIN_SMILEY = '😈', SAD_SMILEY = '😔',
    BOOMB = '💣', FLAG = '🌙'


var gCurrentLevel = gLevel1

function onInit() {
    startNewGame(gCurrentLevel)

}

function startNewGame(level) {
    gGame.isOn = true
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gLiveCounter = 3
    gIsFirstClick = true
    gIsHint = false
    gHintLeft = 3
    gSafeLeft = 3
    resetTimer()
    loadBestScores()

    if (!level) {
        level = gCurrentLevel
    }
    updateHintDisplay(gHintLeft)
    const hintButton = document.querySelector('.hintButton button')
    hintButton.disabled = false

    var happyMood = document.querySelector('.smiley')
    happyMood.innerHTML = HAPPY_SMILEY

    liveIndication(gLiveCounter)

    gBoard = buildBoard(level)
    renderBoard(gBoard)
    document.querySelector('.modal.game-over').style.display = 'none'
}
function gameOver() {
    gGame.isOn = false
    gIsFirstClick = true


}

function buildBoard(level) {
    const board = []
    var length = level.SIZE
    for (var i = 0; i < length; i++) {
        board[i] = []
        for (var j = 0; j < length; j++) {
            board[i][j] = {
                isMine: false,
                mineAroundCount: 0,
                isShown: false,
                isMarked: false
            }
        }
    }

    return board
}


function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            const elCell = `cell cell-${i}-${j}`
            var cellContent = ''
            if (cell.isShown) {
                if (cell.isMine) {
                    cellContent = BOOMB
                } else if (cell.mineAroundCount > 0) {
                    cellContent = cell.mineAroundCount
                } else {
                    cellContent = '👻'
                }
            } else if (cell.isMarked) {
                cellContent = FLAG
            }
            strHTML += `<td class="${elCell}" oncontextmenu="onCellMarked(event, ${i},${j}); return false;" onclick="onCellClicked(event, ${i},${j})">${cellContent}</td>`
        }
        strHTML += '</tr>'
    }
    const elContainer = document.querySelector('.board')
    elContainer.innerHTML = strHTML
}


function onCellClicked(ev, rowIdx, colIdx) {
    var targetCell = gBoard[rowIdx][colIdx]




    if (gIsHint && !targetCell.isShown) {
        giveHint(ev, rowIdx, colIdx)
        gIsHint = false
        return
    }

    if (targetCell.isMarked) return
    if (targetCell.isMine && targetCell.isShown) return
    if (!gGame.isOn) return


    if (gIsFirstClick) {
        setMines(rowIdx, colIdx, gCurrentLevel)
        setMinesNegsCount(gBoard)
        var elTimer = document.querySelector('.timer')
        if (elTimer) {
            elTimer.innerText = '00'
        }
        startTimer()
        renderBoard(gBoard)
        gIsFirstClick = false
    }


    if (targetCell.isMine) {
        targetCell.isShown = true
        gGame.shownCount++

        countLives(rowIdx, colIdx)
        if (gLiveCounter === 0) {
            var sadMood = document.querySelector('.smiley')
            sadMood.innerHTML = SAD_SMILEY
            gameOver()
            return


        }
    } else {
        const numberOfMines = countMinesAround(gBoard, rowIdx, colIdx)

        targetCell.mineAroundCount = numberOfMines
        if (numberOfMines === 0) {
            expandShown(gBoard, rowIdx, colIdx)

        }
        else {
            targetCell.isShown = true
            gGame.shownCount++
        }

    }

    if (checkVictory(gBoard)) {
        renderBoard(gBoard)
        var goodMood = document.querySelector('.smiley')
        goodMood.innerHTML = WIN_SMILEY
        gameOver()
        return

    }

    renderBoard(gBoard)

}


function onCellMarked(ev, rowIdx, colIdx) {
    var targetCell = gBoard[rowIdx][colIdx]
    targetCell.isMarked = !targetCell.isMarked

    ++gGame.markedCount
    ev.target.innerHTML = targetCell.isMarked ? FLAG : ''

    return false
}

function checkVictory(gBoard) {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            if (!cell.isMine && !cell.isShown) return false
            if (cell.isMine && !cell.isMarked && gLiveCounter <= 0) return false
            if (!cell.isMine && cell.isMarked) return false

        }
    }

    var recordKey
    switch (gCurrentLevel.SIZE) {
        case gLevel1.SIZE:
            recordKey = 'recordBeginner'
            break
        case gLevel2.SIZE:
            recordKey = 'recordMedium'
            break
        case gLevel3.SIZE:
            recordKey = 'recordExpert'
            break
        default:
            console.error("Unknown level")
            return false
    }


    const currentRecord = localStorage.getItem(recordKey)


    if (!currentRecord || gGame.secsPassed < currentRecord) {
        localStorage.setItem(recordKey, gGame.secsPassed);

       
        if (recordKey === 'recordBeginner') {
            document.querySelector('.bestScoreBeginner').innerHTML = gGame.secsPassed;
        } else if (recordKey === 'recordMedium') {
            document.querySelector('.bestScoreMedium').innerHTML = gGame.secsPassed;
        } else if (recordKey === 'recordExpert') {
            document.querySelector('.bestScoreExpert').innerHTML = gGame.secsPassed;
        }
    }


    resetTimer()

    return true
}
function loadBestScores() {
 
    const bestBeginner = localStorage.getItem('recordBeginner') || '00';
    const bestMedium = localStorage.getItem('recordMedium') || '00';
    const bestExpert = localStorage.getItem('recordExpert') || '00';

    // Update the HTML elements to display the best scores
    document.querySelector('.bestScoreBeginner').innerHTML = bestBeginner;
    document.querySelector('.bestScoreMedium').innerHTML = bestMedium;
    document.querySelector('.bestScoreExpert').innerHTML = bestExpert;
}

function expandShown(gBoard, rowIdx, colIdx) {
    console.log(gBoard, rowIdx, colIdx)

    var n = gBoard[0].length

    if (rowIdx >= n || colIdx >= n || rowIdx < 0 || colIdx < 0) {
        return
    }

    var cell = gBoard[rowIdx][colIdx]

    if (cell.isShown || cell.isMine) {
        return
    }

    cell.mineAroundCount = countMinesAround(gBoard, rowIdx, colIdx)
    cell.isShown = true
    gGame.shownCount++

    if (cell.mineAroundCount > 0) {
        return
    }

    const directions = [
        [-1, 0],  // Up
        [1, 0],   // Down
        [0, -1],  // Left
        [0, 1],   // Right

    ]

    directions.forEach(([xDirection, yDirection]) => {
        expandShown(gBoard, rowIdx + xDirection, colIdx + yDirection)
    })

    renderBoard(gBoard)
}

function onChangeDifficulty(level) {
    switch (level) {
        case 'beginner':
            gCurrentLevel = gLevel1
            break
        case 'medium':
            gCurrentLevel = gLevel2
            break
        case 'expert':
            gCurrentLevel = gLevel3
            break
    }

    startNewGame(gCurrentLevel)
}


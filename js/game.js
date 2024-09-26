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
var gBoard, gIsFirstClick = true, gMineCount = 4, gLiveCounter, gIsHint = false, gHintLeft = 3


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
    resetTimer()

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

function giveHint(ev, rowIdx, colIdx) {
    const size = gBoard.length;

    var cellsToHide = []
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i >= 0 && i < size && j >= 0 && j < size) {
                if (!gBoard[i][j].isShown) {
                    gBoard[i][j].isShown = true
                    cellsToHide.push({ i: i, j: j })
                }
            }
        }
    }

    renderBoard(gBoard)
    setTimeout(() => {
        for (var i = 0; i < cellsToHide.length; i++) {
            var pos = cellsToHide[i]
            gBoard[pos.i][pos.j].isShown = false
        }
        renderBoard(gBoard)
    }, 1000)
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
        var goodMood = document.querySelector('.smiley')
        goodMood.innerHTML = WIN_SMILEY
        gameOver()
        return

    }

    renderBoard(gBoard)

}

function resetTimer() {
    clearInterval(gTimerIntrval)
    var elTimer = document.querySelector('.timer')
    if (elTimer) {
        elTimer.innerText = '00'
    }
}

function gameOver() {
    gGame.isOn = false
    gIsFirstClick = true


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


    const currentRecord = sessionStorage.getItem(recordKey)


    if (!currentRecord || gGame.secsPassed < currentRecord) {
        sessionStorage.setItem(recordKey, gGame.secsPassed)
        const bestScore = document.querySelector('.bestScore span')
        bestScore.innerHTML = gGame.secsPassed ?? '';
    }

    resetTimer()

    return true
}


function isNumeric(value) {
    return !isNaN(value) && !isNaN(parseFloat(value))
}

function activateHint() {
    if (gHintLeft === 0) return
    gHintLeft--
    gIsHint = true
    updateHintDisplay()

    if (gHintLeft === 0) {
        const hintButton = document.querySelector('.hintButton button')
        hintButton.disabled = true
    }

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



function setMines(firstRowIdx, firstColIdx, level) {
    var minesSet = 0
    const size = gBoard.length

    while (minesSet < level.MINES) {
        var rowIdx = Math.floor(Math.random() * size)
        var colIdx = Math.floor(Math.random() * size)
        if (rowIdx === firstRowIdx && colIdx === firstColIdx) continue
        if (gBoard[rowIdx][colIdx].isMine) continue
        gBoard[rowIdx][colIdx].isMine = true
        minesSet++
    }
}


function setMinesNegsCount(board) {
    const size = board.length
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            if (!board[i][j].isMine) {
                board[i][j].minesAroundCount = countMinesAround(board, i, j)

            }
        }
    }
}


function countMinesAround(board, rowIdx, colIdx) {
    const size = board.length
    var minesAroundCount = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i >= 0 && i < size && j >= 0 && j < size && !(i === rowIdx && j === colIdx)) {
                if (board[i][j].isMine) {
                    ++minesAroundCount
                }
            }
        }
    }
    return minesAroundCount
}


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


function updateHintDisplay() {
    const hintDisplay = document.querySelector('.hint-counter');
    hintDisplay.innerText = gHintLeft;
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







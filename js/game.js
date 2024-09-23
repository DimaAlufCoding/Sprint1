'use strict'


var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gLevel = {
    SIZE: 6,
    MINES: 3
}
var gBoard , gIsFirstClick = true, gMineCount = 4, gLiveCounter


const HAPPY_SMILEY = '😃' , WIN_SMILEY = '😈', SAD_SMILEY = '😔', 
BOOMB = '💣',FLAG = '🇧🇾'


function onInit() {
    startNewGame()
    
}

function startNewGame(){
    gGame.isOn = true
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gLiveCounter = 3
    gIsFirstClick = true

    var happyMood = document.querySelector('.smiley')
    happyMood.innerHTML = HAPPY_SMILEY

    liveIndication(gLiveCounter)

    gBoard = buildBoard()
    renderBoard(gBoard)
    document.querySelector('.modal.game-over').style.display = 'none'
}


function buildBoard() {
    const board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
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
            if (cell.isMine) {
                var cellContent = cell.isMine
                cellContent = ''
            } else {
                cellContent = cell.mineAroundCount > 0 ? cell.mineAroundCount : ''
            }
            strHTML += `<td class="${elCell}" oncontextmenu="onCellMarked(event, ${i},${j}); return false;" onclick="onCellClicked(event, ${i},${j})">${cellContent}</td>`
        }
        strHTML += '</tr>'
    }
    const elContainer = document.querySelector('.board')
    elContainer.innerHTML = strHTML
}

function onCellClicked(ev, rowIdx, colIdx) {
    if(!gGame.isOn) return
    var targetCell = gBoard[rowIdx][colIdx]
    console.log(ev)

    if (gIsFirstClick) {
        setMines(rowIdx, colIdx)
        setMinesNegsCount(gBoard)
        renderBoard(gBoard)
        gIsFirstClick = false
    }


    if (targetCell.isMine) {
        targetCell.isShown = true
        gGame.shownCount++
        ev.target.innerHTML = BOOMB

        countLives(rowIdx, colIdx)
        if (gLiveCounter === 0) {
            var sadMood = document.querySelector('.smiley')
            sadMood.innerHTML = SAD_SMILEY
            alert('You Lose')
        }
    } else {
        const numberOfMines = countMinesAround(gBoard, rowIdx, colIdx)
        targetCell.isShown = true
        gGame.shownCount++
        targetCell.mineAroundCount = numberOfMines
        const elCell = document.querySelector(`.cell-${rowIdx}-${colIdx}`)
        elCell.innerHTML = numberOfMines > 0 ? numberOfMines : ''
        if (numberOfMines === 0) {
            expandShown(gBoard, rowIdx, colIdx)
        }

    }

    if (checkVictory(gBoard)) {
        // alert('You Won')
        var goodMood = document.querySelector('.smiley')
        goodMood.innerHTML = WIN_SMILEY
        gameOver()

    }
    console.log(ev)
    console.log(gBoard)
}

function gameOver() {
    gGame.isOn = false
    gIsFirstClick = true
    document.querySelector('.modal.game-over').style.display = 'block';

}
function onCellMarked(ev, rowIdx, colIdx) {
    var targetCell = gBoard[rowIdx][colIdx]
    targetCell.isMarked = !targetCell.isMarked
    console.log(ev)
    var counter = ++gGame.markedCount
    ev.target.innerHTML = targetCell.isMarked ? FLAG : ''
    console.log(counter)
    return false
}



function checkVictory(gBoard) {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            if (!cell.isShown && !cell.isMine) {
                return false
            }
        }
    }
    return true

}


function expandShown(gBoard, rowIdx, colIdx) {

    const size = gBoard.length
    var targetCell = gBoard[rowIdx][colIdx]
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i >= 0 && i < size && j >= 0 && j < size ) {
                var tempCell = gBoard[i][j]
                if (!tempCell.isMine) {
                    var letMinesAroundCount = countMinesAround(gBoard, i, j)
                    tempCell.isShown = true
                    console.log(i, j, letMinesAroundCount)
                    targetCell.mineAroundCount = letMinesAroundCount
                    const elCell = document.querySelector(`.cell-${i}-${j}`)
                    elCell.innerHTML = letMinesAroundCount > 0 ? letMinesAroundCount : '🧩'
                }
            }
        }
    }
}



function setMines(firstRowIdx, firstColIdx) {
    var minesSet = 0
    const size = gBoard.length

    while (minesSet < gLevel.MINES) {
        var rowIdx = Math.floor(Math.random() * size)
        var colIdx = Math.floor(Math.random() * size)
        if ((rowIdx !== firstRowIdx && colIdx !== firstColIdx)) {
            gBoard[rowIdx][colIdx].isMine = true
            minesSet++
        }
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
                    minesAroundCount++
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










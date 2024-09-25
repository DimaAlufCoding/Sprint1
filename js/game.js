'use strict'


var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gLevel2 = {
    SIZE: 4,
    MINES: 2
}

var gLevel = {
    SIZE: 8,
    MINES: 2
}
var gBoard, gIsFirstClick = true, gMineCount = 4, gLiveCounter, gIsHint = false, gHintLeft = 3


const HAPPY_SMILEY = '😃', WIN_SMILEY = '😈', SAD_SMILEY = '😔',
    BOOMB = '💣', FLAG = '🌙'


function onInit() {
    startNewGame()

}

function startNewGame() {
    gGame.isOn = true
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gLiveCounter = 3
    gIsFirstClick = true
    gIsHint = false
    gHintLeft = 3

    updateHintDisplay(gHintLeft)
    const hintButton = document.querySelector('.hintButton button')
    hintButton.disabled = false

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

    let cellsToHide = [];
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i >= 0 && i < size && j >= 0 && j < size) {
                if (!gBoard[i][j].isShown) {
                    gBoard[i][j].isShown = true;
                    cellsToHide.push({ i: i, j: j });
                }
            }
        }
    }

    renderBoard(gBoard);
    setTimeout(() => {
        for (var i = 0; i < cellsToHide.length; i++) {
            var pos = cellsToHide[i];
            gBoard[pos.i][pos.j].isShown = false;
        }
        renderBoard(gBoard);
    }, 1000);
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
        setMines(rowIdx, colIdx)
        setMinesNegsCount(gBoard)

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
            alert('You Lose')
        }
    } else {
        const numberOfMines = countMinesAround(gBoard, rowIdx, colIdx)
        targetCell.isShown = true
        gGame.shownCount++
        targetCell.mineAroundCount = numberOfMines
        if (numberOfMines === 0) {
            expandShown(gBoard, rowIdx, colIdx)
            
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

function gameOver() {
    gGame.isOn = false
    gIsFirstClick = true
    document.querySelector('.modal.game-over').style.display = 'block';

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
            var cell = gBoard[i][j];
            if (!cell.isMine && !cell.isShown) {

                return false;
            }
            if (cell.isMine && !cell.isMarked && gLiveCounter <= 0) {

                return false;
            }
        }
    }

    return true;
}


function activateHint() {
    if (gHintLeft === 0) return
    gHintLeft--
    gIsHint = true
    updateHintDisplay();

    if (gHintLeft === 0) {
        const hintButton = document.querySelector('.hintButton button');
        hintButton.disabled = true;
    }

}

function expandShown(gBoard, rowIdx, colIdx) {
    const size = gBoard.length
    console.log('hello')
    if (rowIdx < 0 || rowIdx >= size || colIdx < 0 || colIdx >= size) return
    console.log('hello2')
    var currentCell = gBoard[rowIdx][colIdx]

    if (gBoard[rowIdx][colIdx].isShown && gBoard[rowIdx][colIdx].isMine) return
    console.log('hello3')
    currentCell.isShown = true

    currentCell.mineAroundCount = countMinesAround(gBoard, rowIdx, colIdx)
    

    if (currentCell.mineAroundCount > 0) return
    renderBoard(gBoard)
    expandShown(gBoard, rowIdx - 1, colIdx)
    expandShown(gBoard, rowIdx + 1, colIdx)
    expandShown(gBoard, rowIdx, colIdx - 1)
    expandShown(gBoard, rowIdx, colIdx + 1)
    // expandShown(gBoard, rowIdx - 1, colIdx - 1)
    // expandShown(gBoard, rowIdx - 1, colIdx + 1)
    // expandShown(gBoard, rowIdx + 1, colIdx - 1)
    // expandShown(gBoard, rowIdx + 1, colIdx + 1)

}


function setMines(firstRowIdx, firstColIdx) {
    var minesSet = 0
    const size = gBoard.length

    while (minesSet < gLevel.MINES) {
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










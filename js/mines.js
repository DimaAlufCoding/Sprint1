'use strict'



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

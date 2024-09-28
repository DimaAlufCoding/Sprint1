'use strict'

function activateSafeClick() {
    if (gSafeLeft === 0) return
    gSafeLeft--

    gIsSafe = true

    updateSafeDisplay()
    uncoverRanCell()

    if (gHintLeft === 0) {
        const safeButton = document.querySelector('.safe-click')
        safeButton.disabled = true
    }

}

function uncoverRanCell() {
    const size = gBoard.length
    var safeCell = null
    var cellToHide = null



    while (!safeCell) {
        var rowIdx = Math.floor(Math.random() * size)
        var colIdx = Math.floor(Math.random() * size)

        if (!gBoard[rowIdx][colIdx].isShown && !gBoard[rowIdx][colIdx].isMine) {
            gBoard[rowIdx][colIdx].isShown = true
            cellToHide = { i: rowIdx, j: colIdx }
            safeCell = gBoard[rowIdx][colIdx]
        }

    }

    renderBoard(gBoard)
    setTimeout(() => {
        gBoard[cellToHide.i][cellToHide.j].isShown = false
        renderBoard(gBoard)
    }, 3000)

}

function updateSafeDisplay() {
    const safeDisplay = document.querySelector('.safe-counter');
    safeDisplay.innerText = gSafeLeft;
}


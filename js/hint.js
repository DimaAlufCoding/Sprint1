'use strict'



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

function giveHint(ev, rowIdx, colIdx) {
    const size = gBoard.length

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


function updateHintDisplay() {
    const hintDisplay = document.querySelector('.hint-counter');
    hintDisplay.innerText = gHintLeft;
}
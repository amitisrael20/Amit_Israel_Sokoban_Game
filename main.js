'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const TARGET = 'TARGET'
const GAMER = 'GAMER'
const BOX = 'BOX'
const GOLD = 'GOLD'
const CLOCK = 'CLOCK'
const GLUE = 'GLUE'

const CLOCK_IMG = '⏰'
const GOLD_IMG = '🧈'
const GAMER_IMG = '<img src="img/player-img.png" />\n'
const BOX_IMG = '<img src="img/box.png" />\n'
const GLUE_IMG = '<img src="img/glue.png" />\n'

var gGamerPos
var gTempPos
var gBoard
var gSecondsLeft = 0

var gIsGameOn
var isGamerGlued
var isOnClock
var isOnGold

var gPreI
var gPreJ
var gScore = 100
var gBoxOnTarget

var gIntervalClock
var gIntervalGlue
var gIntervalGold


function initGame() {
    gIsGameOn = true
    isGamerGlued = false
    isOnClock = false
    isOnGold = false

    gGamerPos = { i: 2, j: 9 }
    gPreI = gGamerPos.i
    gPreJ = gGamerPos.j
    gBoard = createBoard()
    renderBoard(gBoard)

    gBoxOnTarget = 3
    gIntervalGold = setInterval(addGold, 8000)
    gIntervalGlue = setInterval(addGlue, 8000)
    gIntervalClock = setInterval(addClock, 7000)

}

function createBoard() {
    var board = buildBoard(10, 12)

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j] = { type: FLOOR, gameElement: null }
            if (i === 0 || i === board.length - 1) {
                board[i][j].type = WALL
            } else if (j === 0 || j === board[i].length - 1) {
                board[i][j].type = WALL
            }
        }
    }
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER

    board[2][3].type = WALL
    board[2][4].type = WALL
    board[3][3].type = WALL
    board[4][3].type = WALL
    board[6][9].type = WALL
    board[7][9].type = WALL
    board[7][8].type = WALL
    board[7][2].type = WALL
    board[5][5].type = WALL

    board[1][1].type = TARGET
    board[2][10].type = TARGET
    board[3][10].type = TARGET

    board[4][7].gameElement = BOX
    board[4][8].gameElement = BOX
    board[7][5].gameElement = BOX

    console.log(board)
    return board

}

function renderBoard(board) {
    var elBoard = document.querySelector('.board')
    var strHTML = ''

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'

        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]
            var cellClass = getClassName({ i, j })

            if (currCell.type === FLOOR) cellClass += ' floor'
            else if (currCell.type === WALL) cellClass += ' wall'
            else if (currCell.type === TARGET) cellClass += ' target'

            strHTML += `\t<td class="cell ${cellClass}" onclick="moveTo(${i},${j})">`
            if (currCell.gameElement === GAMER) strHTML += GAMER_IMG
            else if (currCell.gameElement === BOX)  strHTML += BOX_IMG
            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }
    elBoard.innerHTML = strHTML

}

function moveTo(i, j) {
    var isLeft
    var isRight
    var isTop
    var isButtom
    var flag
    var elCell

    if (!gIsGameOn || isGamerGlued) return
    if (gScore === 0) gameOver()
    if (isOnClock) gSecondsLeft--

    var targetCell = gBoard[i][j]
    var iAbsDiff = Math.abs(i - gGamerPos.i)
    var jAbsDiff = Math.abs(j - gGamerPos.j)
    
    if ((iAbsDiff === 1 && jAbsDiff === 0) ||
        (jAbsDiff === 1 && iAbsDiff === 0) ||
        (iAbsDiff === gBoard.length - 1) ||
        (jAbsDiff === gBoard[0].length - 1)) {

        if (targetCell.type === WALL) return

        else if (targetCell.gameElement === GLUE) {
            isGamerGlued = true
            elCell = document.querySelector(`.cell-${i}-${j}`)
            elCell.classList.add('glue')
            setTimeout(() => {
                isGamerGlued = false
                elCell.classList.remove('glue')
                renderCell(gGamerPos, GAMER_IMG)
            }, 5000)

        }else if (targetCell.gameElement === CLOCK) {
            gSecondsLeft += 10
            isOnClock = true
            elCell = document.querySelector(`.cell-${i}-${j}`)
            elCell.classList.add('clock')
            setTimeout(() => {
                elCell.classList.remove('clock')
            }, 1500)

        }else if (targetCell.gameElement === GOLD) {
            isOnGold = true
            gScore += 100
            var elScore = document.querySelector('h1 span')
            elScore.innerText = `${gScore} `
            elCell = document.querySelector(`.cell-${i}-${j}`)
            elCell.classList.add('gold')
            isOnGold = false
            setTimeout(() => {
                elCell.classList.remove('gold')
            }, 1500)

        }else if (targetCell.gameElement === BOX) {
            if (gPreI - i === -1) {
                var tempI = i + 1
                flag = isThereNegsBoxes(gBoard, tempI, j)
                if (flag) return
                else isButtom = true

            }else if (gPreI - i === 1) {
                var tempI = i - 1
                flag = isThereNegsBoxes(gBoard, tempI, j)
                if (flag) return
                else isTop = true

            }else if (gPreJ - j === -1) {
                var tempj = j + 1
                flag = isThereNegsBoxes(gBoard, i, tempj)
                if (flag) return
                else isRight = true

            }else if (gPreJ - j === 1) {
                var tempj = j - 1
                flag = isThereNegsBoxes(gBoard, i, tempj)
                if (flag) return
                else isLeft = true

            }
        }
        if (!isOnClock) gScore--

        // MOVING from current position

        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        renderCell(gGamerPos, '')

        // MOVING to selected position
        gGamerPos = { i, j }
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER
        renderCell(gGamerPos, GAMER_IMG)

        if (isOnClock) {
            gGamerPos = { i, j }
            gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER
            renderCell(gGamerPos, GAMER_IMG)
            if (gSecondsLeft === 0) isOnClock = false
        }

        if (isButtom) {
            var x = gGamerPos.i
            var y = gGamerPos.j
            gGamerPos.i += 1
            if (gBoard[gGamerPos.i][gGamerPos.j].type === TARGET) {
                if (gBoard[x][y].type !== TARGET)
                    gBoxOnTarget--

            }
            gBoard[gGamerPos.i][gGamerPos.j].gameElement = BOX
            renderCell(gGamerPos, BOX_IMG)
            gGamerPos.i -= 1
            isButtom = false
        }
        if (isTop) {
            var x = gGamerPos.i
            var y = gGamerPos.j
            gGamerPos.i -= 1
            if (gBoard[gGamerPos.i][gGamerPos.j].type === TARGET) {
                if (gBoard[x][y].type !== TARGET)
                    gBoxOnTarget--

            }
            gBoard[gGamerPos.i][gGamerPos.j].gameElement = BOX
            renderCell(gGamerPos, BOX_IMG)
            gGamerPos.i += 1
            isTop = false
        }
        
        if (isLeft) {
            var x = gGamerPos.i
            var y = gGamerPos.j
            gGamerPos.j -= 1
            if (gBoard[gGamerPos.i][gGamerPos.j].type === TARGET) {
                if (gBoard[x][y].type !== TARGET)
                    gBoxOnTarget--
            }
            gBoard[gGamerPos.i][gGamerPos.j].gameElement = BOX
            renderCell(gGamerPos, BOX_IMG)
            gGamerPos.j += 1
            isLeft = false
        }
        if (isRight) {
            var x = gGamerPos.i
            var y = gGamerPos.j
            gGamerPos.j += 1
            if (gBoard[gGamerPos.i][gGamerPos.j].type === TARGET) {
                if (gBoard[x][y].type !== TARGET)
                    gBoxOnTarget--

            }
            gBoard[gGamerPos.i][gGamerPos.j].gameElement = BOX
            renderCell(gGamerPos, BOX_IMG)
            gGamerPos.j -= 1
            isRight = false
        }

        if (!isOnClock) {
            var elScore = document.querySelector('span')
            elScore.innerText = `${gScore}`
        }

        gPreI = gGamerPos.i
        gPreJ = gGamerPos.j
        checkGameOver()
    }
    else return

}

function handleKey(event) {

    var i = gGamerPos.i
    var j = gGamerPos.j

    switch (event.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1)
            break;
        case 'ArrowRight':
            moveTo(i, j + 1)
            break;
        case 'ArrowUp':
            moveTo(i - 1, j)
            break;
        case 'ArrowDown':
            moveTo(i + 1, j)
            break;
    }
}

function checkGameOver() {
    if (gBoxOnTarget === 0) gameOver()
}

function gameOver() {
    gIsGameOn = false
    var elMsg = document.querySelector('.user-msg')
    var elModal = document.querySelector('.modal')
    if (gScore === 0) elMsg.innerText = 'Sorry, you are out of moves!'
    else elMsg.innerText = 'You Won!'

    elModal.style.display = 'block'


    clearInterval(gIntervalGold)
    clearInterval(gIntervalGlue)
    clearInterval(gIntervalClock)
}

function resetGame() {

    gScore = 100
    var elbtn = document.querySelector('.modal')
    elbtn.style.display = 'none'

    var elCount = document.querySelector('h1 span')
    elCount.innerText = `${gScore}`
    initGame()
}

function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}

function renderCell(location, value) {
    var cellSelector = '.' + getClassName(location)
    var elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
}

function isEmptyCell(cell) {
    return cell.gameElement === null
}

function isThereNegsBoxes(board, i, j) {

    if (board[i][j].gameElement === BOX || board[i][j].type === WALL) return true
    else return false

}

function findEmptyPos(board) {
    var emptyPos = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j].type === WALL) continue
            if (board[i][j].type === TARGET) continue
            if (isEmptyCell(board[i][j])) {
                emptyPos.push({ i, j })
            }
        }
    }
    var idx = getRandomInt(0, emptyPos.length)
    return emptyPos[idx]
}

function addElement(element, elementImg) {
    var emptyPos = findEmptyPos(gBoard)
    if (!emptyPos) return
    gBoard[emptyPos.i][emptyPos.j].gameElement = element
    renderCell(emptyPos, elementImg)
    
    return emptyPos
}

function addGlue() {
    var emptyPos = addElement(GLUE, GLUE_IMG)
    setTimeout(() => {
        removeElement(emptyPos)
    }, 5000)

}

function addClock() {
    var emptyPos = addElement(CLOCK, CLOCK_IMG)
    setTimeout(() => {
        removeElement(emptyPos)
    }, 5000)

}

function addGold() {
    var emptyPos = addElement(GOLD, GOLD_IMG)
    setTimeout(() => {
        removeElement(emptyPos)
    }, 5000)
}

function removeElement(elementPos) {
    var cell = gBoard[elementPos.i][elementPos.j]
    if (cell.gameElement === GAMER ||
        cell.gameElement === BOX ) return

    gBoard[elementPos.i][elementPos.j].gameElement = null
    renderCell(elementPos, '')
}



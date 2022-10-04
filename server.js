var currentPlayer = "Player 1";
var currentPlayerTurnState = 1;
var currentBoard = [];
var firstTurn = true;
var currentPointClicked = {};
var front = [0,0];
var tail = [0,0];
var allLines = [];

app.ports.request.subscribe((message) => {
    message = JSON.parse(message);
    // Parse the message to determine a response, then respond:
    console.log(message);
    switch(message.msg){
        case "INITIALIZE":
            app.ports.response.send(initializeGame());
            break;
        case "NODE_CLICKED":
            app.ports.response.send(nodeClickedParser(message.body));
            break;
        case "ERROR":
            app.ports.response.send(errorParser(message.body));
            break;
        default:
            app.ports.response.send(errorParser(message.body));
    }
    
    
});

function initializeGame(){
    //Creating board with size 4 grid, but can be changed here
    boardCreation(4);
    return {
        "msg": "INITIALIZE",
        "body": {
            "newLine": null,
            "heading": currentPlayer,
            "message": "Awaiting " + currentPlayer + " Move"
        }
    }
}

function nodeClickedParser(point){
    if(currentPlayerTurnState === 1){
        if(isValidStartNode(point)){
            currentPlayerTurnState = 2;
            currentPointClicked = point;
            return validStartResponse();
        }
        return invalidStartResponse();
    }
    else{
        if(isValidEndNode(point)){
            changeCurrentPlayer();
            currentPlayerTurnState = 1;
            if(isGameOver()){
                return gameOverResponse(currentPointClicked, point);
            }
            return validEndResponse(currentPointClicked, point);
        }
        currentPlayerTurnState = 1;
        return invalidEndResponse();
    }
}

function boardCreation(size){
    var b;
    while (currentBoard.push(b = []) < size) 
    while (b.push(0) < size);

    for(let i = 0; i < size; i++){
        currentBoard[size - 1].push(0);
    }
}

function isValidStartNode(point){
    if(firstTurn){
        return true;
    }
    else if((front[0] === point.y && front[1] === point.x) || tail[0] === point.y && tail[1] === point.x){
        return true;
    }
    return false;
}

function isValidEndNode(point){    

    //checks if clicked on an already taken node
    if(currentBoard[point.y][point.x] === 1){
        return false;
    }

    //checks if making diag line
    if(currentPointClicked.y != point.y && currentPointClicked.x != point.x){
        if(Math.abs(currentPointClicked.y - point.y) === Math.abs(currentPointClicked.x - point.x)){
            if(currentPointClicked.y > point.y){
                var tempY = currentPointClicked.y;
                var tempX = currentPointClicked.x;
                var tempLine = [];
                var tempPoints = [];
                //make function
                tempPoints.push([tempY, tempX])
                //checks to see if goes through an already taken node
                while(tempY > point.y){
                    tempY--;
                    
                    if(tempX > point.x){
                        tempX--;
                    }
                    else{
                        tempX++;
                    }
                    if(currentBoard[tempY][tempX] === 1 && ((front[0] != tempY && front[1] != tempX) || (tail[0] != tempY && tail[1] != tempX))){
                        console.log(tempY, tempX);
                        return false;
                    }
                    tempPoints.push([tempY, tempX]);
                }

                tempY = currentPointClicked.y;
                tempX = currentPointClicked.x;

                //checks if goes through a line
                while(tempY > point.y){
                    var tempX2;
                    if(tempX < point.x){
                        tempX2 = tempX + 1;
                    }
                    else{
                        tempX2 = tempX - 1;
                    }
                    if(currentBoard[tempY - 1][tempX] === 1 && currentBoard[tempY][tempX2] === 1){
                        var checkY = [(tempY - 1),tempX];
                        var checkX = [tempY, tempX2];
                        console.log(checkX);
                        console.log(checkY);
                        for(let j = 0; j < allLines.length; j++){                           
                            for(let z = 0; z < allLines[j].length; z++ ){
                                if(allLines[j][z][0] === checkY[0] && allLines[j][z][1] === checkY[1]){
                                    for(let z = 0; z < allLines[j].length; z++ ){
                                        if(allLines[j][z][0] === checkX[0] && allLines[j][z][1] === checkX[1]){
                                            return false;
                                        }
                                    }
                                }

                            }
                        }
                    }
                    if(tempX > point.x){
                        tempX--;
                    }
                    else{
                        tempX++;
                    }
                    tempY--;
                }
                //updating the board
                while(tempPoints.length > 0){
                    var tempP = tempPoints.pop();
                    tempLine.push([tempP[0], tempP[1]]);
                    currentBoard[tempP[0]][tempP[1]] = 1;
                }
                allLines.push(tempLine);
            }
            else{
                var tempY = point.y;
                var tempX = point.x;
                var tempLine = []
                var tempPoints = [];
                //make function
                //checks to see if goes through an already taken node
                tempPoints.push([tempY, tempX])
                while(tempY > currentPointClicked.y){
                    tempY--;
                    if(tempX > currentPointClicked.x){
                        tempX--;
                    }
                    else{
                        tempX++;
                    }
                    console.log(tempY, tempX);
                    if(currentBoard[tempY][tempX] === 1 && (front[0] != tempY && front[1] != tempX)){
                        if((tail[0] != tempY && tail[1] != tempX)){
                            console.log(tempY, tempX);
                            console.log((tail[0] != tempY && tail[1] != tempX));
                            return false;
                        }
                        
                    }
                    tempPoints.push([tempY, tempX]);
                }

                tempY = point.y;
                tempX = point.x;
                while(tempY > currentPointClicked.y){
                    var tempX2;
                    if(tempX < currentPointClicked.x){
                        tempX2 = tempX + 1;
                    }
                    else{
                        tempX2 = tempX - 1;
                    }
                    if(currentBoard[tempY - 1][tempX] === 1 && currentBoard[tempY][tempX2] === 1){
                        var checkY = [(tempY - 1),tempX];
                        var checkX = [tempY, tempX2];
                        for(let j = 0; j < allLines.length; j++){                           
                            for(let z = 0; z < allLines[j].length; z++ ){
                                if(allLines[j][z][0] === checkY[0] && allLines[j][z][1] === checkY[1]){
                                    for(let z = 0; z < allLines[j].length; z++ ){
                                        if(allLines[j][z][0] === checkX[0] && allLines[j][z][1] === checkX[1]){
                                            return false;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if(tempX > currentPointClicked.x){
                        tempX--;
                    }
                    else{
                        tempX++;
                    }
                    tempY--;
                }

                while(tempPoints.length > 0){
                    var tempP = tempPoints.pop();
                    tempLine.push([tempP[0], tempP[1]]);
                    currentBoard[tempP[0]][tempP[1]] = 1;
                }
                allLines.push(tempLine);
            }
           
        }
        else{
            return false;
        }
    }
    //checks if making vertical or horizontal line
    else if(currentPointClicked.y != point.y){
        var startPoint = Math.max(currentPointClicked.y, point.y); 

        //checks vertical
        for(let i = startPoint - 1; i > Math.min(currentPointClicked.y, point.y); i--){
            if(currentBoard[i][point.x] === 1){
                return false;
            }
        }

        //updates board
        for(let i = startPoint; i > Math.min(currentPointClicked.y, point.y) - 1; i--){
            currentBoard[i][point.x] = 1;
        }

    }
    else if(currentPointClicked.x != point.x){
        var startPoint = Math.max(currentPointClicked.x, point.x); 

        //checks horizontal
        for(let i = startPoint - 1; i > Math.min(currentPointClicked.x, point.x); i--){
            if(currentBoard[point.y][i] === 1){
                return false;
            }
        }

        //updates board
        for(let i = startPoint; i > Math.min(currentPointClicked.x, point.x) - 1; i--){
            currentBoard[point.y][i] = 1;
        }
    }

    //updating tail and front
    if(firstTurn){
        firstTurnUpdate(point);
    }

    else if(front[0] === currentPointClicked.y && front[1] === currentPointClicked.x){
        front[0] = point.y;
        front[1] = point.x;
    }
    else{
        tail[0] = point.y;
        tail[1] = point.x; 
    }
    return true;
}

function firstTurnUpdate(point){
    currentBoard[currentPointClicked.y][currentPointClicked.x] = 1
    front[0] = currentPointClicked.y;
    front[1] = currentPointClicked.x;
    tail[0] = point.y;
    tail[1] = point.x;
    firstTurn = false;
}

function hasMoveVertical(node){
    if(node[0] > 0 && node[0] < currentBoard[0].length - 1){
        if(currentBoard[node[0] - 1][node[1]] === 1 && currentBoard[node[0] + 1][node[1]] === 1){
            return true;
        }
    }
    else if(node[0] === currentBoard[0].length - 1){
        if(currentBoard[node[0] - 1][node[1]] === 1){
            return true;
        }    
    }
    else{
        if(currentBoard[node[0] + 1][node[1]] === 1){
            return true;
        }
    }
    return false;
}

function hasMoveHorizontal(node){
    if(node[1] > 0 && node[1] < currentBoard[0].length - 1){
        if(currentBoard[node[0]][node[1] - 1] === 1 && currentBoard[node[0]][node[1] + 1] === 1){
            return true;
        }
    }
    else if(node[1] === currentBoard[0].length - 1){
        if(currentBoard[node[0]][node[1] - 1] === 1){
            return true;
        }    
    }
    else{
        if(currentBoard[node[0]][node[1] + 1] === 1){
            return true;
        }
    }
    return false;
}

function hasMoveDiag(node){
    if(node[0] > 0 && node[1] > 0){
        if(currentBoard[node[0] - 1][node[1] - 1 ] === 0){
            return false;
        }
    }
    if(node[0] > 0 && node[1] < currentBoard.length - 1){
        if(currentBoard[node[0] - 1][node[1] + 1] === 0){
            return false;
        }
    }
    if(node[0] < currentBoard.length - 1 && node[1] > 0){
        if(currentBoard[node[0] + 1][node[1] - 1] === 0){
            return false;
        }
    }
    if(node[0] < currentBoard.length - 1 && node[1] < currentBoard.length - 1){
        if(currentBoard[node[0] + 1][node[1] + 1] === 0){
            return false;
        }
    }
    return true;
}

function isGameOver(){
    if(hasMove(front)){
        if(hasMove(tail)){
            return true;
        }
    }
    return false;

}

function hasMove(node){
    if(hasMoveVertical(node)){
        if(hasMoveHorizontal(node)){
            if(hasMoveDiag(node)){
                return true;
            }
        }
    }
    return false;
}

function changeCurrentPlayer(){
    if(currentPlayer === "Player 1"){
        currentPlayer = "Player 2";
    }
    else{
        currentPlayer = "Player 1";
    }
}

function gameOverResponse(point1, point2){
    return {
        "msg": "GAME_OVER",
        "body": {
            "newLine": {
                "start": {
                    "x": point1.x,
                    "y": point1.y
                },
                "end": {
                    "x": point2.x,
                    "y": point2.y
                }
            },
            "heading": "Game Over",
            "message": currentPlayer + " Wins!"
        }
    }
}
function validStartResponse(){
    return {
        "msg": "VALID_START_NODE",
        "body": {
            "newLine": null,
            "heading": currentPlayer,
            "message": "Select a second node to complete the line."
        }
    }
}

function invalidStartResponse(){
    return {   
        "msg": "INVALID_START_NODE",
        "body": {
            "newLine": null,
            "heading": currentPlayer,
            "message": "Not a valid starting position."
        }
    }
}

function validEndResponse(point1, point2){
    return {
        "msg": "VALID_END_NODE",
        "body": {
            "newLine": {
                "start": {
                    "x": point1.x,
                    "y": point1.y
                },
                "end": {
                    "x": point2.x,
                    "y": point2.y
                }
            },
            "heading": currentPlayer,
            "message": null
        }
    }
}

function invalidEndResponse(){
    return { 
        "msg": "INVALID_END_NODE",
        "body": {
            "newLine": null,
            "heading": currentPlayer,
            "message": "Invalid move!"
        }
    }
}

function errorParser(){
    return {
        "msg": "ERROR",
        "body": "Invalid type for `id`: Expected INT but got a STRING"
    }
}
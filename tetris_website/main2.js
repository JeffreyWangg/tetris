'use strict';

var intervalTime = 1000;
var intervalID;
var currentPiece;
var eventFire = true;
var held, held_fire;
var count = 0;
var debug_flag = true;
var score = 0; 

var rotationTests = [
    [[-1, 0],[-1, 1],[0, -2],[-1, -2]], //0 -> 1 / 2 -> 1
    [[1, 0],[1, -1],[0, 2],[1, 2]], //1 -> 2 / 1 -> 0
    [[1, 0],[1, 1],[0, -2],[1, -2]], //2 -> 3 / 0 -> 3
    [[-1, 0],[-1, -1],[0, 2],[-1, 2]] // 3 -> 0 / 3 -> 2
];
var rotationI = [
    [[-2, 0],[1, 0],[-2, -1],[1, 2]], // 0 -> 1 / 3 -> 2
    [[-1, 0],[2, 0],[-1, 2],[2, -1]], // 1 -> 2 / 0 -> 3
    [[2, 0],[-1, 0],[2, 1],[-1, -2]], // 2 -> 3 / 1 -> 0
    [[1, 0],[-2, 0],[1, -2],[-2, 1]]  // 3 -> 0 / 2 -> 1
];
  //coords/index functions
  function IX(x, y){
    return 10 * y + x; //returns div position
}

function IC(index){
    return [index % 10, (index - (index % 10)) / 10];
} //returns [x, y]
function checkPoint(x, y){
    var squares = document.querySelectorAll(".grid div");
    if(x > 9 || x < 0 || y > 20 || y < 0 || (squares[IX(x, y)].classList.contains("piece") || squares[IX(x, y)].classList.contains("floor"))){
        return false;
    }
    return true;
}
function check2DPointArray(array){
    for(let i = 0; i < array.length - 1; i++){
        if(!(checkPoint(array[i][0]) && checkPoint(array[i][1]))){
            return false;
        }
    }
    return true;
}

//block position => for each block check if there is a block in it
// if bad then break to do next test
// return true when thing good
// return false if all tests fail
function easierRotationCheck(array, group, rotationTest){
    var arrayCopy = [...array];
    for(var j = 0; j < 4; j++){ //rotate through tests
        arrayCopy = [...array];
        for(var k = 0; k < 4; k++){//for point k
            var pos_x = arrayCopy[k][0];
            var pos_y = arrayCopy[k][1];

            if(!checkPoint(pos_x + rotationTest[group][j][0], pos_y - rotationTest[group][j][1])){
                break;
            } else {
                arrayCopy[k] = [pos_x + rotationTest[group][j][0], pos_y - rotationTest[group][j][1]];
            }
            if(k == 3){
                return arrayCopy;
            }
        }
    }
    return false;
}

function returnImpBlocks(array){
    var impBlocks = [];
    var tempArray = [];
    var check = [];

    for(var i = 0, len = array.length; i < len; ++i){
        for(var j = 0; j < len; ++j){
            if(IC(array[i])[0] == IC(array[j])[0] 
            && array[i] != array[j] 
            && check.indexOf(array[i]) == -1){
                //x is the same, block isnt itself, block is not in check
                tempArray.push(array[i]);
                check.push(array[i]);
            }
        }
        if(check.indexOf(array[i]) == -1){
            impBlocks.push(array[i]);
            check.push(array[i]);
        }
    }

    for(var i = 0, len = tempArray.length; i < len; ++i){
        var largestBlock = tempArray[i];
        for(var j = 0; j < len; ++j){
            if(IC(tempArray[j])[0] == IC(largestBlock)[0]
            && IC(tempArray[j])[1] > IC(largestBlock)[1]){
                largestBlock = tempArray[j];
            }
        }
        if(impBlocks.indexOf(largestBlock) == -1){
            impBlocks.push(largestBlock);
        }
    }
    
    return impBlocks;
}

var tShape = {
    name: "t-shape",
    currentPos: [IX(3, 1), IX(4, 1), IX(4, 0), IX(5, 1)], 
    defaultPos: [IX(3, 1), IX(4, 1), IX(4, 0), IX(5, 1)], 
    origin: function(){
        return this.currentPos[1];
    },
    state: 0,
};
var leftL = {
    name: "left-l",
    currentPos: [IX(3, 0), IX(3, 1), IX(4, 1), IX(5, 1)], 
    defaultPos: [IX(3, 0), IX(3, 1), IX(4, 1), IX(5, 1)], 
    origin: function(){
        return this.currentPos[2];
    },
    state: 0
};
var rightL = {
    name: "right-l",
    currentPos: [IX(3, 1), IX(4, 1), IX(5, 1), IX(5, 0)], 
    defaultPos: [IX(3, 1), IX(4, 1), IX(5, 1), IX(5, 0)], 
    origin: function(){
        return this.currentPos[1];
    },
    state: 0
};
var line = {
    name: "line",
    currentPos: [IX(3, 0), IX(4, 0), IX(5, 0), IX(6, 0)], 
    defaultPos: [IX(3, 0), IX(4, 0), IX(5, 0), IX(6, 0)], 
    origin: function(){
        return [(IC(this.currentPos[2])[0] + IC(this.currentPos[1])[0])/2, (IC(this.currentPos[2])[1] + IC(this.currentPos[1])[1])/2];
    },
    state: 0
};
var sShape = {
    name: "s-shape",
    currentPos: [IX(3, 1), IX(4, 1), IX(4,0), IX(5, 0)], 
    defaultPos: [IX(3, 1), IX(4, 1), IX(4,0), IX(5, 0)], 
    origin: function(){
        return this.currentPos[1];
    },
    state: 0
};
var zShape = {
    name: "z-shape",
    currentPos: [IX(3, 0), IX(4, 0), IX(4, 1), IX(5, 1)],
    defaultPos: [IX(3, 0), IX(4, 0), IX(4, 1), IX(5, 1)],
    origin: function(){
        return this.currentPos[2];
    },
    state: 0,
};
var square = {
    name: "square",
    currentPos: [IX(4, 0), IX(5, 0), IX(4, 1), IX(5, 1)],
    defaultPos: [IX(4, 0), IX(5, 0), IX(4, 1), IX(5, 1)],
    origin: function(){
        return null;
    },
    state: 0
};
var shadowPiece = {
    currentPos: [],
}

var default_array = [square, rightL, leftL, line, sShape, tShape, zShape];
var change_array = [...default_array];
function selectBlock(){
    if(change_array.length == 0){
        change_array = [...default_array];
    }
    var value = Math.floor((Math.random() * change_array.length));
    currentPiece = change_array[value];
    change_array.splice(value, 1);
}

function incrementScore(rows){
    switch(rows){
        case 0:
            break;
        case 1:
            score += 100;
            break;
        case 2:
            score += 200;
            break;
        case 3:
            score += 300;
            break;
        case 4:
            score += 1000;
            break;
    }
    document.getElementById("score").innerHTML = "Score: " + score;
}

function clearLine(row){ 
    var squares = document.querySelectorAll(".grid div");
    for(let i = row; i >= 0; i--){
        for(let j = 0; j < 10; j++){ // removes rows
            var index = IX(j, i);
            if(squares[index].classList.contains("piece")){
                if(IX(j, i + 1) < 200 && i != row){
                    squares[IX(j, i) + 10].className = squares[index].className;
                }
                squares[index].removeAttribute("class");
            }
        }
    }
}

function lineChecker(){ // runs every time block stops
    var squares = document.querySelectorAll(".grid div");
    var topLine = 20;
    var total = 0;
    var rowCount = 0;

    for(var y = 19; y >= 0; y--){
        total = 0;
        for(var x = 0; x < 10; x++){
            var index = y * 10 + x;
            if(squares[index].classList.contains("piece")){ //get total in row
                total++; // added values in y row
            }            //needs to return total in row + row number
        }
        if(total == 10){
            clearLine(y); // quickly cycles through all 20 rows and clears combined rows
            rowCount++;
            if(topLine > y){
                topLine = y;
            }
            y+=1;
        }
    }
    incrementScore(rowCount);
}

function addDiv(){
    for(let i = 0; i < 210; i++){
        if(i <200){
        var insertLocation = document.querySelector(".grid");
        let div = document.createElement("div");
        insertLocation.appendChild(div);
        } else {
            var insertLocation = document.querySelector(".grid");
            let div = document.createElement("div");
            div.classList.add("floor");
    
            insertLocation.appendChild(div);
        }
    }
}

function defaultSetting(){
    console.log(currentPiece);
    held_fire = true;
    var squares = document.querySelectorAll(".grid div");
    currentPiece.currentPos.splice(0, 4, ...currentPiece.defaultPos);
    currentPiece.defaultPos.forEach(index => squares[index].classList.add(`${currentPiece.name}`, "piece"));
    currentPiece.state = 0;
    console.log(currentPiece.currentPos)
    shadow();
}


function control(e) {
    var squares = document.querySelectorAll(".grid div");

    if (e.which === 39) {    //right
        if(checkDir("right")){ 
            var prevSpace = currentPiece.currentPos.splice(0, 4);
            prevSpace.forEach(index => squares[index].removeAttribute("class"));
            for(var i = 0; i < 4; i++){
                currentPiece.currentPos.push(IX(IC(prevSpace[i])[0] + 1, IC(prevSpace[i])[1]));
            }
            currentPiece.currentPos.forEach(index => squares[index].classList.add(`${currentPiece.name}`, "piece"));
        }
    } else if (e.which === 37) {    // left
        if(checkDir("left")){
            var prevSpace = currentPiece.currentPos.splice(0, 4);
            prevSpace.forEach(index => squares[index].removeAttribute("class"));
            for(var i = 0; i < 4; i++){
                currentPiece.currentPos.push(IX(IC(prevSpace[i])[0] - 1, IC(prevSpace[i])[1]));
            }
            currentPiece.currentPos.forEach(index => squares[index].classList.add(`${currentPiece.name}`, "piece"));
        }
    } else if (e.which === 40) {    // down
        if(checkDir("bottom")){
            if(!eventFire){
                eventFire = true;
            }
            var prevSpace = currentPiece.currentPos.splice(0, 4);
            prevSpace.forEach(index => squares[index].removeAttribute("class"));

            prevSpace.forEach(element => currentPiece.currentPos.push(element + 10));
            currentPiece.currentPos.forEach(index => squares[index].classList.add(`${currentPiece.name}`, "piece"));
            clearInterval(intervalID);
            intervalID = setInterval(repeat, intervalTime);
        } else if (eventFire){
            if(!squares[4].classList.contains("piece")){ //if the top row is empty
                lineChecker();
                clearInterval(intervalID);
                intervalID = setInterval(repeat, intervalTime);
                selectBlock();
                defaultSetting();
                eventFire = false;
            } else {
                clearInterval(intervalID); //kill the game
            }
        }
    } else if(e.which === 32) { // space
        var impBlocks = returnImpBlocks(currentPiece.currentPos);
        var lowestDif = 20;
        for(var i = 0, len = impBlocks.length; i < len; ++i){
            for(var y = IC(impBlocks[i])[1] + 1; y <= 20; ++y){
                if(
                (squares[IX(IC(impBlocks[i])[0], y)].classList.contains("piece") || squares[IX(IC(impBlocks[i])[0], y)].classList.contains("floor"))
                || y == 20){
                    if(y - IC(impBlocks[i])[1] < lowestDif){
                        lowestDif = y - IC(impBlocks[i])[1];
                    }
                }
            }
        }
        var prevSpace = currentPiece.currentPos.splice(0, 4);
        prevSpace.forEach(index => squares[index].removeAttribute("class"));
        for(var i = 0; i < 4; i++){
            currentPiece.currentPos.push(prevSpace[i] + (lowestDif - 1) * 10);
        }
        currentPiece.currentPos.forEach(index => squares[index].classList.remove("shadow"));
        currentPiece.currentPos.forEach(index => squares[index].classList.add(`${currentPiece.name}`, "piece"));
        if(!squares[4].classList.contains("piece")){
            lineChecker();
            clearInterval(intervalID);
            intervalID = setInterval(repeat, intervalTime);
            selectBlock();
            defaultSetting();
        } else {
            clearInterval(intervalID); //kill the game (kinda)
        }
    } else if(e.which === 38){ // up, rotating 90 degrees clockwise
        var new_x, new_y, k;
        var current_origin = [];
        var prev_state = currentPiece.state;
        var new_state;
        var newPos = [];
        if(prev_state == 3){
            new_state = 0;
        } else {
            new_state = prev_state + 1;
        }

        if(currentPiece != line && currentPiece != square){
            for(var i = 0, len = currentPiece.currentPos.length; i < len; ++i){ //rotate all points around origin (defined in object)
                squares[currentPiece.currentPos[i]].removeAttribute("class");
                current_origin = [IC(currentPiece.origin())[0], IC(currentPiece.origin())[1]];
                new_x = -(IC(currentPiece.currentPos[i])[1] - current_origin[1]) + current_origin[0]; //points relative to origin
                new_y = (IC(currentPiece.currentPos[i])[0] - current_origin[0]) + current_origin[1];

                newPos[i] = [new_x, new_y]; 
            }
            if (newPos.filter(function(el){
                if(!checkPoint(el[0], el[1])){
                        return el;
                    } else {
                        return false
                    }
                    }).length > 0){
                    if((prev_state == 0 && new_state == 1)){
                        newPos = easierRotationCheck(newPos, 0, rotationTests);
                    } else if((prev_state == 1 && new_state == 2)){
                        newPos = easierRotationCheck(newPos, 1, rotationTests);
                    } else if((prev_state == 2 && new_state == 3)){
                        newPos = easierRotationCheck(newPos, 2, rotationTests);
                    } else if((prev_state == 3 && new_state == 0)){
                        newPos = easierRotationCheck(newPos, 3, rotationTests);
                    }
                    if(newPos){
                        for(var j = 0; j < 4; ++j){
                            currentPiece.currentPos[j] = IX(newPos[j][0], newPos[j][1]);
                        }
                        currentPiece.state = new_state;
                    }
            } else {
                for(var j = 0; j < 4; ++j){
                    currentPiece.currentPos[j] = IX(newPos[j][0], newPos[j][1]);
                }
                currentPiece.state = new_state;
            }
        } else if(currentPiece == line){
            for(var i = 0, len = currentPiece.currentPos.length; i < len; ++i){ //rotate all points around origin (defined in object)
                squares[currentPiece.currentPos[i]].removeAttribute("class");
                
                if(prev_state == 0){
                    current_origin = [(IC(currentPiece.currentPos[1])[0] + IC(currentPiece.currentPos[2])[0])/2, (IC(currentPiece.currentPos[1])[1] + IC(currentPiece.currentPos[1])[1] + 1) / 2];
                    new_x = -(IC(currentPiece.currentPos[i])[1] - current_origin[1]) + current_origin[0]; //points relative to origin
                    new_y = (IC(currentPiece.currentPos[i])[0] - current_origin[0]) + current_origin[1];
                } else if(prev_state == 1){
                    current_origin = [(IC(currentPiece.currentPos[1])[0] + IC(currentPiece.currentPos[1])[0] - 1)/2, (IC(currentPiece.currentPos[1])[1] + IC(currentPiece.currentPos[2])[1])/2];
                    new_x = -(IC(currentPiece.currentPos[i])[1] - current_origin[1]) + current_origin[0]; //points relative to origin
                    new_y = (IC(currentPiece.currentPos[i])[0] - current_origin[0]) + current_origin[1];
                } else if(prev_state == 2){
                    current_origin = [(IC(currentPiece.currentPos[1])[0] + IC(currentPiece.currentPos[2])[0])/2, (IC(currentPiece.currentPos[1])[1] + IC(currentPiece.currentPos[1])[1] - 1) / 2];
                    new_x = -(IC(currentPiece.currentPos[i])[1] - current_origin[1]) + current_origin[0]; //points relative to origin
                    new_y = (IC(currentPiece.currentPos[i])[0] - current_origin[0]) + current_origin[1];
                } else if(prev_state == 3){
                    current_origin = [(IC(currentPiece.currentPos[1])[0] + IC(currentPiece.currentPos[1])[0] + 1)/2, (IC(currentPiece.currentPos[1])[1] + IC(currentPiece.currentPos[2])[1])/2];
                    new_x = -(IC(currentPiece.currentPos[i])[1] - current_origin[1]) + current_origin[0]; //points relative to origin
                    new_y = (IC(currentPiece.currentPos[i])[0] - current_origin[0]) + current_origin[1];
                }   

                newPos[i] = [new_x, new_y];
            }

            if (newPos.filter(function(el){
                if(!checkPoint(el[0], el[1])){
                        return el;
                    } else {
                        return false
                    }
                    }).length > 0){
                    if((prev_state == 0 && new_state == 1)){
                        newPos = easierRotationCheck(newPos, 0, rotationI);
                    } else if((prev_state == 1 && new_state == 2)){
                        newPos = easierRotationCheck(newPos, 1, rotationI);
                    } else if((prev_state == 2 && new_state == 3)){
                        newPos = easierRotationCheck(newPos, 2, rotationI);
                    } else if((prev_state == 3 && new_state == 0)){
                        newPos = easierRotationCheck(newPos, 3, rotationI);
                    }
                    if(newPos){
                        for(var j = 0; j < 4; ++j){
                            currentPiece.currentPos[j] = IX(newPos[j][0], newPos[j][1]);
                        }
                        currentPiece.state = new_state;
                    }
            } else {
                for(var j = 0; j < 4; ++j){
                    currentPiece.currentPos[j] = IX(newPos[j][0], newPos[j][1]);
                }
                currentPiece.state = new_state;
            }
        }

        for(var i = 0, len = currentPiece.currentPos.length; i < len; ++i){
            squares[currentPiece.currentPos[i]].classList.add(`${currentPiece.name}`,"piece")
        }
    } else if(e.which === 90){ // z, rotating 90 degrees counterclockwise
        var new_x, new_y, k;
        var prev_state = currentPiece.state;
        var new_state;
        var newPos = [];
        var current_origin = [];
        if(prev_state == 0){
            new_state = 3;
        } else {
            new_state = prev_state - 1;
        }
        currentPiece.state = new_state;
        if(currentPiece != line && currentPiece != square){
            for(var i = 0, len = currentPiece.currentPos.length; i < len; ++i){ //rotate all points around origin (defined in object)
                squares[currentPiece.currentPos[i]].removeAttribute("class");
                current_origin = [IC(currentPiece.origin())[0], IC(currentPiece.origin())[1]];
                new_x = (IC(currentPiece.currentPos[i])[1] - current_origin[1]) + current_origin[0]; //points relative to origin
                new_y = -(IC(currentPiece.currentPos[i])[0] - current_origin[0]) + current_origin[1];

                newPos[i] = [new_x, new_y]; 
            }
            if (newPos.filter(function(el){
                if(!checkPoint(el[0], el[1])){
                    return el;
                } else {
                    return false
                }
                }).length > 0){
                if((prev_state == 2 && new_state == 1)){
                    newPos = easierRotationCheck(newPos, 0, rotationTests);
                } else if((prev_state == 1 && new_state == 0)){
                    newPos = easierRotationCheck(newPos, 1, rotationTests);
                } else if((prev_state == 0 && new_state == 3)){
                    newPos = easierRotationCheck(newPos, 2, rotationTests);
                } else if((prev_state == 3 && new_state == 2)){
                    newPos = easierRotationCheck(newPos, 3, rotationTests);
                }
                if(newPos){
                    for(var j = 0; j < 4; ++j){
                        currentPiece.currentPos[j] = IX(newPos[j][0], newPos[j][1]);
                    }
                    currentPiece.state = new_state;
                }
        } else {
            for(var j = 0; j < 4; ++j){
                currentPiece.currentPos[j] = IX(newPos[j][0], newPos[j][1]);
            }
            currentPiece.state = new_state;
        }
        }  else if(currentPiece == line){
            for(var i = 0, len = currentPiece.currentPos.length; i < len; ++i){ //rotate all points around origin (defined in object)
            squares[currentPiece.currentPos[i]].removeAttribute("class");
            
            if(prev_state == 0){
                current_origin = [(IC(currentPiece.currentPos[1])[0] + IC(currentPiece.currentPos[2])[0])/2, (IC(currentPiece.currentPos[1])[1] + IC(currentPiece.currentPos[1])[1] + 1) / 2];
                new_x = (IC(currentPiece.currentPos[i])[1] - current_origin[1]) + current_origin[0]; //points relative to origin
                new_y = -(IC(currentPiece.currentPos[i])[0] - current_origin[0]) + current_origin[1];
            } else if(prev_state == 1){
                current_origin = [(IC(currentPiece.currentPos[1])[0] + IC(currentPiece.currentPos[1])[0] - 1)/2, (IC(currentPiece.currentPos[1])[1] + IC(currentPiece.currentPos[2])[1])/2];
                new_x = (IC(currentPiece.currentPos[i])[1] - current_origin[1]) + current_origin[0]; //points relative to origin
                new_y = -(IC(currentPiece.currentPos[i])[0] - current_origin[0]) + current_origin[1];
            } else if(prev_state == 2){
                current_origin = [(IC(currentPiece.currentPos[1])[0] + IC(currentPiece.currentPos[2])[0])/2, (IC(currentPiece.currentPos[1])[1] + IC(currentPiece.currentPos[1])[1] - 1) / 2];
                new_x = (IC(currentPiece.currentPos[i])[1] - current_origin[1]) + current_origin[0]; //points relative to origin
                new_y = -(IC(currentPiece.currentPos[i])[0] - current_origin[0]) + current_origin[1];
            } else if(prev_state == 3){
                current_origin = [(IC(currentPiece.currentPos[1])[0] + IC(currentPiece.currentPos[1])[0] + 1)/2, (IC(currentPiece.currentPos[1])[1] + IC(currentPiece.currentPos[2])[1])/2];
                new_x = (IC(currentPiece.currentPos[i])[1] - current_origin[1]) + current_origin[0]; //points relative to origin
                new_y = -(IC(currentPiece.currentPos[i])[0] - current_origin[0]) + current_origin[1];
            }   

            newPos[i] = [new_x, new_y]; 
        }
        if (newPos.filter(function(el){
            if(!checkPoint(el[0], el[1])){
                return el;
            } else {
                return false
            }
            }).length > 0){
            if((prev_state == 3 && new_state == 2)){
                newPos = easierRotationCheck(newPos, 0, rotationI);
            } else if((prev_state == 0 && new_state == 3)){
                newPos = easierRotationCheck(newPos, 1, rotationI);
            } else if((prev_state == 1 && new_state == 0)){
                newPos = easierRotationCheck(newPos, 2, rotationI);
            } else if((prev_state == 2 && new_state == 1)){
                newPos = easierRotationCheck(newPos, 3, rotationI);
            }
            if(newPos){
                for(var j = 0; j < 4; ++j){
                    currentPiece.currentPos[j] = IX(newPos[j][0], newPos[j][1]);
                }
                currentPiece.state = new_state;
            }
    } else {
        for(var j = 0; j < 4; ++j){
            currentPiece.currentPos[j] = IX(newPos[j][0], newPos[j][1]);
        }
        currentPiece.state = new_state;
    }
    }

        for(var i = 0, len = currentPiece.currentPos.length; i < len; ++i){
            squares[currentPiece.currentPos[i]].classList.add(`${currentPiece.name}`, "piece")
        }
    } else if(e.which === 67){
        if(held_fire == true){
            for(var i = 0; i < 4; ++i){
                squares[currentPiece.currentPos[i]].removeAttribute("class");
            }
            if(held == undefined){ //nothing held
                held = currentPiece;
                switch(currentPiece){
                    case tShape:
                        document.getElementById("p1").innerHTML = "Held: t shape";
                        break;
                    case rightL:
                        document.getElementById("p1").innerHTML = "Held: right L";
                        break;
                    case leftL:
                        document.getElementById("p1").innerHTML = "Held: left L";
                        break;
                    case line:
                        document.getElementById("p1").innerHTML = "Held: line";
                        break;
                    case square:
                        document.getElementById("p1").innerHTML = "Held: square";
                        break;
                    case sShape:
                        document.getElementById("p1").innerHTML = "Held: sShape";
                        break;
                    case zShape:
                        document.getElementById("p1").innerHTML = "Held: zshape";
                        break;
                }
                selectBlock();
            } else {
                // console.log("full")
                var temp = held;
                held = currentPiece;
                switch(currentPiece){
                    case tShape:
                        document.getElementById("p1").innerHTML = "Held: t shape";
                        break;
                    case rightL:
                        document.getElementById("p1").innerHTML = "Held: right L";
                        break;
                    case leftL:
                        document.getElementById("p1").innerHTML = "Held: left L";
                        break;
                    case line:
                        document.getElementById("p1").innerHTML = "Held: line";
                        break;
                    case square:
                        document.getElementById("p1").innerHTML = "Held: square";
                        break;
                    case sShape:
                        document.getElementById("p1").innerHTML = "Held: sShape";
                        break;
                    case zShape:
                        document.getElementById("p1").innerHTML = "Held: zshape";
                        break;
                }
                currentPiece = temp;
            }
            lineChecker();
            clearInterval(intervalID);
            intervalID = setInterval(repeat, intervalTime);
            defaultSetting();
            eventFire = false;
            held_fire = false;
        }
    }
    shadow();
}

function shadow(){
    var squares = document.querySelectorAll(".grid div");
    if(shadowPiece.currentPos.length != 0){
        var prevPos = shadowPiece.currentPos.splice(0, 4);
        prevPos.forEach(function(index){
            if(squares[index].classList.contains("piece")){
                squares[index].classList.remove("shadow");
            } else {
                squares[index].removeAttribute("class");
            }
        });
    }
    var impBlocks = returnImpBlocks(currentPiece.currentPos);

    var lowestDif = 20;
    for(var i = 0, len = impBlocks.length; i < len; ++i){
        for(var y = IC(impBlocks[i])[1] + 1; y <= 20; ++y){
            if((squares[IX(IC(impBlocks[i])[0], y)].classList.contains("piece") && !squares[IX(IC(impBlocks[i])[0], y)].classList.contains("floor"))
            || y == 20){
                if(y - IC(impBlocks[i])[1] < lowestDif){
                    lowestDif = y - IC(impBlocks[i])[1];
                }
            }
        }
    }
    
    for(var i = 0; i < 4; i++){
        shadowPiece.currentPos.push(currentPiece.currentPos[i] + (lowestDif - 1) * 10);
    }
    shadowPiece.currentPos.forEach(function(index){
        if(!squares[index].classList.contains("piece")){
            squares[index].classList.add("shadow", `${currentPiece.name}`)
        }
    });
}
//this allows us to rewrite the hitboxes such that rotated blocks will still have hitboxes (theoretically)
function checkDir(dir){
    var squares = document.querySelectorAll(".grid div");
    let bound = TandBOfBlock();
    let right, left;
    let impBlocks = [];
    switch (dir){
    case "right":
        for(let i = bound[0]; i <= bound[1]; i++){ // between set block bound
            right = 0;
            currentPiece.currentPos.forEach(index => 
                {if(IC(index)[1] == i){ //if y of index is equal to current y 
                    if(IC(index)[0] > right || right == undefined){
                        right = IC(index)[0];
                    }
            }})
                impBlocks.push(IX(right, i));
        }
        for(let i = 0; i < impBlocks.length; i++){
            let blockIndex = currentPiece.currentPos.indexOf(impBlocks[i]);
            if(currentPiece.currentPos[blockIndex] % 10 == 9 || 
                squares[currentPiece.currentPos[blockIndex] + 1].classList.contains("piece")){
                return false;
            }
        }
        return true;

    //left imp blocks
    case "left":
        for(let i = bound[0]; i <= bound[1]; i++){ // between set block bound
            left = 10;
            currentPiece.currentPos.forEach(index => 
                {if(IC(index)[1] == i){ //if y of index is equal to current y 
                    if(IC(index)[0] < left || left == undefined){
                        left = IC(index)[0];
                    }
            }})
                impBlocks.push(IX(left, i));
        }
        for(let i = 0; i < impBlocks.length; i++){
            let blockIndex = currentPiece.currentPos.indexOf(impBlocks[i]);
            if(currentPiece.currentPos[blockIndex] % 10 == 0 || 
                squares[currentPiece.currentPos[blockIndex] - 1].classList.contains("piece")){
                return false;
            }
        }
        return true;
    
    case "bottom": //needs right and left bound (as well as harddrop)
        //find which blocks are important by checking which ones don't have a block from the same shape beneath them
        impBlocks = returnImpBlocks(currentPiece.currentPos);
    
        for(let i = 0; i < impBlocks.length; i++){
            //check if blocks in impblocks ever hit a block / wall
            let blockIndex = currentPiece.currentPos.indexOf(impBlocks[i]);
            if(squares[currentPiece.currentPos[blockIndex] + 10].classList.contains("piece") || squares[currentPiece.currentPos[blockIndex] + 10].classList.contains("floor")){
                return false;
            }
        }
        return true;
    }  
}

function TandBOfBlock(){
    let top = IC(currentPiece.currentPos[0])[1];
    let bottom = IC(currentPiece.currentPos[3])[1];

    for(let i = 0; i < 4; i++){
        if(IC(currentPiece.currentPos[i])[1] < top){
            top = IC(currentPiece.currentPos[i])[1];
        }
        else if(IC(currentPiece.currentPos[i])[1] > bottom){
            bottom = IC(currentPiece.currentPos[i])[1];
        }
    }
    return [top, bottom];
}
function repeat(){ 
    var squares = document.querySelectorAll(".grid div");
    if(checkDir("bottom")){
        var squares = document.querySelectorAll(".grid div");
        var prevSpace = currentPiece.currentPos.splice(0, 4);
        prevSpace.forEach(index => squares[index].removeAttribute("class"));
        for(var i = 0; i < 4; i++){
            currentPiece.currentPos.push(prevSpace[i] + 10);
        }
        currentPiece.currentPos.forEach(index => squares[index].classList.remove("shadow"));
        currentPiece.currentPos.forEach(index => squares[index].classList.add(`${currentPiece.name}`, "piece"));
    } else {
        if(!squares[4].classList.contains("piece")){
            lineChecker();
            clearInterval(intervalID);
            intervalID = setInterval(repeat, intervalTime)
            selectBlock();
            defaultSetting();
        } else {
            clearInterval(intervalID); //kill the game
            removeEventListener("keydown", control)
            return;
        }
    }
}

function game(){
    addDiv();
    document.addEventListener("keydown", control);
    document.getElementById("debug").onclick = function(){
        var squares = document.querySelectorAll(".grid div");
        if(debug_flag){
            for(let i = 0; i < 200; i++){
                squares[i].removeChild(squares[i].firstChild);
            }
        } else {
            for(let i = 0; i < 200; i++){
                let content = document.createTextNode(i);
                squares[i].appendChild(content);
                squares[i].style.color = "white";
            }
        }
        debug_flag = !debug_flag
    }
    selectBlock();
    defaultSetting();
    console.log("pemnis)");
    intervalID = setInterval(repeat, intervalTime);
}

game();

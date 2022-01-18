'use strict';

var intervalTime = 1000;   
var topLine = 20;
var intervalID;
var currentPiece;
var eventFire = true;
var held, held_fire;

//add proper game end

//rotate mathematically
//if left side, wall kick by adding onto block until not negative
//if right side, wall kick by subtracting from block until in range
//i piece will be hell

//for harddrop, get the most important piece and then find the difference between it and the baseline
//and add that to the rest of the blocks

//use map/filter instead of for loops?

var tShape = {
    name: "t-shape",
    currentPos: [IX(3, 1), IX(4, 1), IX(4, 0), IX(5, 1)], 
    defaultPos: [IX(3, 1), IX(4, 1), IX(4, 0), IX(5, 1)], 
    origin: function(){
        return this.currentPos[1];
    },
    state: 0
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
//0 = spawn state
//1 = one rotation right
//2 = 2 rotations right
//3 = 1 rotation left
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

//this will be scuffed so fix this
function selectBlock(){
    var value = Math.floor((Math.random() * 7) + 1);
    switch(value){
        case 1:
            currentPiece = square;
        break;
        case 2:
            currentPiece = zShape;
        break;
        case 3:
            currentPiece = sShape;
        break;
        case 4:
            currentPiece = line;
        break;
        case 5:
            currentPiece = tShape;
        break;
        case 6:
            currentPiece = rightL;
        break;
        case 7:
            currentPiece = leftL;
        break;
    }
}
function clearLine(row, total){ 
    var squares = document.querySelectorAll(".grid div");
    // set class to empty (done)
    // move everything above the first line down 
    // for every one, access index amount and then add linecount * 10
    if(total > 0){
        if(total === row * 100 + 45){
            // add logic to count rows
            if(row < topLine || topLine == undefined){ //defines the top line of cleared lines
                topLine = row;
            }
            for(var x = 0; x < 10; x++){ // removes rows
                squares[(row * 10) + x].classList.remove("piece");
            }
        }
    }
}

function lineChecker(){ // runs every time block stops
    var squares = document.querySelectorAll(".grid div");
    var total = 0;
    var rowCount = 0;
    var array = [];

    for(var y = 0; y < 20; y++){
        total = 0;
        for(var x = 0; x < 10; x++){
            var index = y * 10 + x;
            if(squares[index].classList.length === 1){ //get total in row
                total = total + index; // added values in y row
            }
            //needs to return total in row + row number
        }
        if(total === y * 100 + 45){
            rowCount++;
        }
        clearLine(y, total); // quickly cycles through all 20 rows and clears combined rows
    }
    if(rowCount > 0){ //run linemover when rowcount exists
        let downCount = rowCount * 10;

        for(let y = 0; y < 20; y++){
            for(let x = 0; x < 10; x++){
                let index = y * 10 + x;

                //check topline
                if(index < topLine * 10){
                    if(squares[index].classList.length === 1){
                        array.push(index); // pushes current blocks to temp array
                    }

                    squares[index].classList.remove('piece'); //removes all current blocks
                }
            }
        }

        array.forEach(elm =>
            squares[elm + downCount].classList.add('piece')
        );
        //so i need to make it only do this above topLine
        //when topLine 18 i want it to only move down the blocks above 18
        //
        //theoretically this should put back all the removes squares
    }
    
//    console.log(array);
    rowCount = 0;
    topLine = 20;
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
    currentPiece.defaultPos.forEach(index => squares[index].classList.add("piece"));
    currentPiece.state = 0;
    console.log(currentPiece.currentPos)
}


function control(e) {
    var squares = document.querySelectorAll(".grid div");

    if (e.which === 39) {    //right
        if(checkDir("right")){ 
            var prevSpace = currentPiece.currentPos.splice(0, 4);
            prevSpace.forEach(index => squares[index].classList.remove("piece"));
            for(var i = 0; i < 4; i++){
                currentPiece.currentPos.push(IX(IC(prevSpace[i])[0] + 1, IC(prevSpace[i])[1]));
            }
            currentPiece.currentPos.forEach(index => squares[index].classList.add("piece"));
        }
    } else if (e.which === 37) {    // left
        if(checkDir("left")){
            var prevSpace = currentPiece.currentPos.splice(0, 4);
            prevSpace.forEach(index => squares[index].classList.remove("piece"));
            for(var i = 0; i < 4; i++){
                currentPiece.currentPos.push(IX(IC(prevSpace[i])[0] - 1, IC(prevSpace[i])[1]));
            }
            currentPiece.currentPos.forEach(index => squares[index].classList.add("piece"));
        }
    } else if (e.which === 40) {    // down
        if(checkDir("bottom")){
            if(!eventFire){
                eventFire = true;
            }
            var prevSpace = currentPiece.currentPos.splice(0, 4);
            prevSpace.forEach(index => squares[index].classList.remove("piece"));

            prevSpace.forEach(element => currentPiece.currentPos.push(element + 10));
            currentPiece.currentPos.forEach(index => squares[index].classList.add("piece"));
            clearInterval(intervalID);
            intervalID = setInterval(repeat, intervalTime);
        } else if (eventFire){
            if(squares[4].classList.length === 0){ //turn into function pls
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
        var impBlocks = [];
        var tempArray = [];
        var check = [];

        for(var i = 0, len = currentPiece.currentPos.length; i < len; ++i){
            for(var j = 0; j < len; ++j){
                if(IC(currentPiece.currentPos[i])[0] == IC(currentPiece.currentPos[j])[0] 
                && currentPiece.currentPos[i] != currentPiece.currentPos[j] 
                && check.indexOf(currentPiece.currentPos[i]) == -1){
                    //x is the same, block isnt itself, block is not in check
                    tempArray.push(currentPiece.currentPos[i]);
                    check.push(currentPiece.currentPos[i]);
                }
            }
            if(check.indexOf(currentPiece.currentPos[i]) == -1){
                impBlocks.push(currentPiece.currentPos[i]);
                check.push(currentPiece.currentPos[i]);
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

        //for each block in impblocks
        //find difference between it and the block below it
        //select the block with the lowest difference
        //place block to that baseline and align rest using the difference
        var lowestDif = 20;
        for(var i = 0, len = impBlocks.length; i < len; ++i){
            for(var y = IC(impBlocks[i])[1] + 1; y <= 20; ++y){
                if(squares[IX(IC(impBlocks[i])[0], y)].classList.length == 1 || y == 20){
                    if(y - IC(impBlocks[i])[1] < lowestDif){
                        lowestDif = y - IC(impBlocks[i])[1];
                    }
                }
            }
        }
        var prevSpace = currentPiece.currentPos.splice(0, 4);
        prevSpace.forEach(index => squares[index].classList.remove("piece"));
        for(var i = 0; i < 4; i++){
            currentPiece.currentPos.push(prevSpace[i] + (lowestDif - 1) * 10);
        }
        currentPiece.currentPos.forEach(index => squares[index].classList.add("piece"));
        if(squares[4].classList.length === 0){
            lineChecker();
            clearInterval(intervalID);
            intervalID = setInterval(repeat, intervalTime);
            selectBlock();
            defaultSetting();
        } else {
            clearInterval(intervalID); //kill the game (kinda)
        }
    } else if(e.which === 38){ // up, rotating 90 degrees clockwise
        //in srs, when the normal rotation is obstructed
        //tests five different positions before it gives up
        //there is a special place in hell for the I piece
        console.log(currentPiece.state);
        var new_x, new_y, current_origin = currentPiece.origin(), k;
        var prev_state = currentPiece.state;
        var new_state;
        var newPos = [];
        //if prev state is 3, then set newstate to 0 and then when new state is 1 set prev state to 0
        if(prev_state == 3){
            new_state = 0;
        } else {
            new_state = prev_state + 1;
        }
        currentPiece.state = new_state;

        console.log(`new_State: ${new_state}`)
        console.log(`prev_State: ${prev_state}`)
        console.log(currentPiece.state);


        if(currentPiece != line && currentPiece != square){
            for(var i = 0, len = currentPiece.currentPos.length; i < len; ++i){ //rotate all points around origin (defined in object)
                squares[currentPiece.currentPos[i]].classList.remove("piece");
                new_x = -(IC(currentPiece.currentPos[i])[1] - IC(current_origin)[1]) + IC(current_origin)[0]; //points relative to origin
                new_y = (IC(currentPiece.currentPos[i])[0] - IC(current_origin)[0]) + IC(current_origin)[1];

                newPos[i] = [new_x, new_y]; 

                // console.log(`origin: ${current_origin}`)
                // console.log(`originx: ${IC(current_origin)[0]} originy:${IC(current_origin)[1]}`)
                // console.log(`x: ${new_x} y:${new_y}`)
            }
            //call filtered here
            //if bad, then fix bad
            //if good, then make good

            //if need filter
            if (newPos.filter(function(el){
                if(el[0] < 0 || el[0] > 9 || el[1] < 0 || el[1] > 19 ||
                    squares[IX(el[0], el[1])].classList.length == 1){
                        return el;
                    } else {
                        return false
                    }
                    }).length > 0){
                    console.log("a bad happened");
                    //testing rotation
                    //we have the newpos
                    if((prev_state == 0 && new_state == 1)){
                        console.log("first ran")
                        for(var j = 0; j <= 4; ++j){ //rotate through tests
                            if(k == 4 || j == 4){
                                if(j==4){
                                    currentPiece.state -= 1;
                                }
                                console.log("exit rotation loop");
                                break;
                            }
                            for(k = 0; k < len; ++k){//for point k
                                var pos_x = newPos[k][0];
                                var pos_y = newPos[k][1];
                                console.log(`new coords for point ${k} test ${j}: ${pos_x + rotationTests[0][j][0]}, ${pos_y - rotationTests[0][j][1]}`)
                                console.log(`posx: ${pos_x}, posy: ${pos_y}`)

                                if(
                                pos_x + rotationTests[0][j][0] < 0 || pos_x + rotationTests[0][j][0] > 9 ||
                                pos_y - rotationTests[0][j][1] < 0 || pos_y - rotationTests[0][j][1] > 19 ||
                                squares[IX(pos_x + rotationTests[0][j][0], pos_y - rotationTests[0][j][1])].classList.length == 1){
                                    console.log("second case triggered")
                                    k -= 1;
                                    break;
                                } else {
                                    console.log("worky")
                                    currentPiece.currentPos[k] = IX(pos_x + rotationTests[0][j][0], pos_y - rotationTests[0][j][1]);
                                }
                            }
                        }
                    } else if((prev_state == 1 && new_state == 2)){
                        console.log("second ran")
                        for(var j = 0; j <= 4; ++j){ //rotate through tests
                            if(k == 4 || j == 4){
                                if(j==4){
                                    currentPiece.state -= 1;
                                }
                                console.log("exit rotation loop");
                                break;
                            }
                            for(k = 0; k < len; ++k){//for point k
                                var pos_x = newPos[k][0];
                                var pos_y = newPos[k][1];
                                console.log(`new coords for point ${k} test ${j}: ${pos_x + rotationTests[1][j][0]}, ${pos_y - rotationTests[1][j][1]}`)
                                console.log(`posx: ${pos_x}, posy: ${pos_y}`)

                                if(
                                pos_x + rotationTests[1][j][0] < 0 || pos_x + rotationTests[1][j][0] > 9 ||
                                pos_y - rotationTests[1][j][1] < 0 || pos_y - rotationTests[1][j][1] > 19 ||
                                squares[IX(pos_x + rotationTests[1][j][0], pos_y - rotationTests[1][j][1])].classList.length == 1){
                                    console.log("second case triggered")
                                    k -= 1;
                                    break;
                                } else {
                                    console.log("worky")
                                    currentPiece.currentPos[k] = IX(pos_x + rotationTests[1][j][0], pos_y - rotationTests[1][j][1]);
                                }
                            }
                        }
                        
                    } else if((prev_state == 2 && new_state == 3)){
                        console.log("third ran")
                        for(var j = 0; j <= 4; ++j){ //rotate through tests
                            if(k == 4 || j == 4){
                                if(j==4){
                                    currentPiece.state -= 1;
                                }
                                console.log("exit rotation loop");
                                break;
                            }
                            for(k = 0; k < len; ++k){//for point k
                                var pos_x = newPos[k][0];
                                var pos_y = newPos[k][1];
                                console.log(`new coords for point ${k} test ${j}: ${pos_x + rotationTests[2][j][0]}, ${pos_y - rotationTests[2][j][1]}`)
                                console.log(`posx: ${pos_x}, posy: ${pos_y}`)

                                if(
                                pos_x + rotationTests[2][j][0] < 0 || pos_x + rotationTests[2][j][0] > 9 ||
                                pos_y - rotationTests[2][j][1] < 0 || pos_y - rotationTests[2][j][1] > 19 ||
                                squares[IX(pos_x + rotationTests[1][j][0], pos_y - rotationTests[2][j][1])].classList.length == 1){
                                    console.log("second case triggered")
                                    k -= 1;
                                    break;
                                } else {
                                    console.log("worky")
                                    currentPiece.currentPos[k] = IX(pos_x + rotationTests[2][j][0], pos_y - rotationTests[2][j][1]);
                                }
                            }
                        }
                    } else if((prev_state == 3 && new_state == 0)){
                        console.log("fourth ran")
                        for(var j = 0; j <= 4; ++j){ //rotate through tests
                            if(k == 4 || j == 4){
                                if(j==4){
                                    currentPiece.state -= 1;
                                }
                                console.log("exit rotation loop");
                                break;
                            }
                            for(k = 0; k < len; ++k){//for point k
                                var pos_x = newPos[k][0];
                                var pos_y = newPos[k][1];
                                console.log(`new coords for point ${k} test ${j}: ${pos_x + rotationTests[3][j][0]}, ${pos_y - rotationTests[3][j][1]}`)
                                console.log(`posx: ${pos_x}, posy: ${pos_y}`)

                                if(
                                pos_x + rotationTests[3][j][0] < 0 || pos_x + rotationTests[3][j][0] > 9 ||
                                pos_y - rotationTests[3][j][1] < 0 || pos_y - rotationTests[3][j][1] > 19 ||
                                squares[IX(pos_x + rotationTests[3][j][0], pos_y - rotationTests[3][j][1])].classList.length == 1){
                                    console.log("second case triggered")
                                    k -= 1;
                                    break;
                                } else {
                                    console.log("worky")
                                    currentPiece.currentPos[k] = IX(pos_x + rotationTests[3][j][0], pos_y - rotationTests[3][j][1]);
                                }
                            }
                        }
                    }
            } else {
                for(var j = 0; j < 4; ++j){
                    currentPiece.currentPos[j] = IX(newPos[j][0], newPos[j][1]);
                }
            }
        } else if(currentPiece == line){
            for(var i = 0, len = currentPiece.currentPos.length; i < len; ++i){ //rotate all points around origin (defined in object)
                squares[currentPiece.currentPos[i]].classList.remove("piece");
                new_x = -(IC(currentPiece.currentPos[i])[1] - IC(current_origin)[1]) + IC(current_origin)[0]; //points relative to origin
                new_y = (IC(currentPiece.currentPos[i])[0] - IC(current_origin)[0]) + IC(current_origin)[1];

                newPos[i] = [new_x, new_y]; 
            }
            if (newPos.filter(function(el){
                if(el[0] < 0 || el[0] > 9 || el[1] < 0 || el[1] > 19 ||
                    squares[IX(el[0], el[1])].classList.length == 1){
                        return el;
                    } else {
                        return false
                    }
                    }).length > 0){
                    console.log("a bad happened");
                    //testing rotation
                    //we have the newpos
                    if((prev_state == 0 && new_state == 1)){
                        console.log("first ran")
                        for(var j = 0; j <= 4; ++j){ //rotate through tests
                            if(k == 4 || j == 4){
                                if(j==4){
                                    currentPiece.state -= 1;
                                }
                                console.log("exit rotation loop");
                                break;
                            }
                            for(k = 0; k < len; ++k){//for point k
                                var pos_x = newPos[k][0];
                                var pos_y = newPos[k][1];
                                console.log(`new coords for point ${k} test ${j}: ${pos_x + rotationTests[0][j][0]}, ${pos_y - rotationTests[0][j][1]}`)
                                console.log(`posx: ${pos_x}, posy: ${pos_y}`)

                                if(
                                pos_x + rotationTests[0][j][0] < 0 || pos_x + rotationTests[0][j][0] > 9 ||
                                pos_y - rotationTests[0][j][1] < 0 || pos_y - rotationTests[0][j][1] > 19 ||
                                squares[IX(pos_x + rotationTests[0][j][0], pos_y - rotationTests[0][j][1])].classList.length == 1){
                                    console.log("second case triggered")
                                    k -= 1;
                                    break;
                                } else {
                                    console.log("worky")
                                    currentPiece.currentPos[k] = IX(pos_x + rotationTests[0][j][0], pos_y - rotationTests[0][j][1]);
                                }
                            }
                        }
                    } else if((prev_state == 1 && new_state == 2)){
                        console.log("second ran")
                        for(var j = 0; j <= 4; ++j){ //rotate through tests
                            if(k == 4 || j == 4){
                                if(j==4){
                                    currentPiece.state -= 1;
                                }
                                console.log("exit rotation loop");
                                break;
                            }
                            for(k = 0; k < len; ++k){//for point k
                                var pos_x = newPos[k][0];
                                var pos_y = newPos[k][1];
                                console.log(`new coords for point ${k} test ${j}: ${pos_x + rotationTests[1][j][0]}, ${pos_y - rotationTests[1][j][1]}`)
                                console.log(`posx: ${pos_x}, posy: ${pos_y}`)

                                if(
                                pos_x + rotationTests[1][j][0] < 0 || pos_x + rotationTests[1][j][0] > 9 ||
                                pos_y - rotationTests[1][j][1] < 0 || pos_y - rotationTests[1][j][1] > 19 ||
                                squares[IX(pos_x + rotationTests[1][j][0], pos_y - rotationTests[1][j][1])].classList.length == 1){
                                    console.log("second case triggered")
                                    k -= 1;
                                    break;
                                } else {
                                    console.log("worky")
                                    currentPiece.currentPos[k] = IX(pos_x + rotationTests[1][j][0], pos_y - rotationTests[1][j][1]);
                                }
                            }
                        }
                        
                    } else if((prev_state == 2 && new_state == 3)){
                        console.log("third ran")
                        for(var j = 0; j <= 4; ++j){ //rotate through tests
                            if(k == 4 || j == 4){
                                if(j==4){
                                    currentPiece.state -= 1;
                                }
                                console.log("exit rotation loop");
                                break;
                            }
                            for(k = 0; k < len; ++k){//for point k
                                var pos_x = newPos[k][0];
                                var pos_y = newPos[k][1];
                                console.log(`new coords for point ${k} test ${j}: ${pos_x + rotationTests[2][j][0]}, ${pos_y - rotationTests[2][j][1]}`)
                                console.log(`posx: ${pos_x}, posy: ${pos_y}`)

                                if(
                                pos_x + rotationTests[2][j][0] < 0 || pos_x + rotationTests[2][j][0] > 9 ||
                                pos_y - rotationTests[2][j][1] < 0 || pos_y - rotationTests[2][j][1] > 19 ||
                                squares[IX(pos_x + rotationTests[1][j][0], pos_y - rotationTests[2][j][1])].classList.length == 1){
                                    console.log("second case triggered")
                                    k -= 1;
                                    break;
                                } else {
                                    console.log("worky")
                                    currentPiece.currentPos[k] = IX(pos_x + rotationTests[2][j][0], pos_y - rotationTests[2][j][1]);
                                }
                            }
                        }
                    } else if((prev_state == 3 && new_state == 0)){
                        console.log("fourth ran")
                        for(var j = 0; j <= 4; ++j){ //rotate through tests
                            if(k == 4 || j == 4){
                                if(j==4){
                                    currentPiece.state -= 1;
                                }
                                console.log("exit rotation loop");
                                break;
                            }
                            for(k = 0; k < len; ++k){//for point k
                                var pos_x = newPos[k][0];
                                var pos_y = newPos[k][1];
                                console.log(`new coords for point ${k} test ${j}: ${pos_x + rotationTests[3][j][0]}, ${pos_y - rotationTests[3][j][1]}`)
                                console.log(`posx: ${pos_x}, posy: ${pos_y}`)

                                if(
                                pos_x + rotationTests[3][j][0] < 0 || pos_x + rotationTests[3][j][0] > 9 ||
                                pos_y - rotationTests[3][j][1] < 0 || pos_y - rotationTests[3][j][1] > 19 ||
                                squares[IX(pos_x + rotationTests[3][j][0], pos_y - rotationTests[3][j][1])].classList.length == 1){
                                    console.log("second case triggered")
                                    k -= 1;
                                    break;
                                } else {
                                    console.log("worky")
                                    currentPiece.currentPos[k] = IX(pos_x + rotationTests[3][j][0], pos_y - rotationTests[3][j][1]);
                                }
                            }
                        }
                    }
            } else {
                for(var j = 0; j < 4; ++j){
                    currentPiece.currentPos[j] = IX(newPos[j][0], newPos[j][1]);
                }
            }
        }

        for(var i = 0, len = currentPiece.currentPos.length; i < len; ++i){
            squares[currentPiece.currentPos[i]].classList.add("piece")
        }
    } else if(e.which === 90){ // z, rotating 90 degrees counterclockwise
        //in srs, when the normal rotation is obstructed
        //tests five different positions before it gives up
        //there is a special place in hell for the I piece
        var new_x, new_y, current_origin = currentPiece.origin(), k;
        var prev_state = currentPiece.state;
        var new_state;
        var newPos = [];
        //if prev state is 0, then set newstate to 3 and then when new state is 2 set prev state to 3
        if(prev_state == 0){
            new_state = 3;
        } else {
            new_state = prev_state - 1;
        }
        currentPiece.state = new_state;
        console.log(`prevstate: ${prev_state}`)
        console.log(`newstate: ${new_state}`)

        if(currentPiece != line && currentPiece != square){
            for(var i = 0, len = currentPiece.currentPos.length; i < len; ++i){ //rotate all points around origin (defined in object)
                squares[currentPiece.currentPos[i]].classList.remove("piece");
                new_x = (IC(currentPiece.currentPos[i])[1] - IC(current_origin)[1]) + IC(current_origin)[0]; //points relative to origin
                new_y = -(IC(currentPiece.currentPos[i])[0] - IC(current_origin)[0]) + IC(current_origin)[1];

                newPos[i] = [new_x, new_y]; 
            }
            //call filtered here
            //if bad, then fix bad
            //if good, then make good

            //if need filter
            if (newPos.filter(function(el){
                if(el[0] < 0 || el[0] > 9 || el[1] < 0 || el[1] > 19 ||
                    squares[IX(el[0], el[1])].classList.length == 1){
                        return el;
                    } else {
                        return false
                    }
                    }).length > 0){
                    console.log("a bad happened");
                    //testing rotation
                    //we have the newpos
                    if((prev_state == 2 && new_state == 1)){
                        console.log("first ran")
                        for(var j = 0; j <= 4; ++j){ //rotate through tests
                            if(k == 4 || j == 4){
                                console.log("exit rotation loop");
                                break;
                            }
                            for(k = 0; k < len; ++k){//for point k
                                var pos_x = newPos[k][0];
                                var pos_y = newPos[k][1];
                                console.log(`new coords for point ${k} test ${j}: ${pos_x + rotationTests[0][j][0]}, ${pos_y - rotationTests[0][j][1]}`)
                                console.log(`posx: ${pos_x}, posy: ${pos_y}`)

                                if(
                                pos_x + rotationTests[0][j][0] < 0 || pos_x + rotationTests[0][j][0] > 9 ||
                                pos_y - rotationTests[0][j][1] < 0 || pos_y - rotationTests[0][j][1] > 19 ||
                                squares[IX(pos_x + rotationTests[0][j][0], pos_y - rotationTests[0][j][1])].classList.length == 1){
                                    console.log("second case triggered")
                                    k -= 1;
                                    break;
                                } else {
                                    console.log("worky")
                                    currentPiece.currentPos[k] = IX(pos_x + rotationTests[0][j][0], pos_y - rotationTests[0][j][1]);
                                }
                            }
                        }
                    } else if((prev_state == 1 && new_state == 0)){
                        console.log("second ran")
                        for(var j = 0; j <= 4; ++j){ //rotate through tests
                            if(k == 4 || j == 4){
                                console.log("exit rotation loop");
                                break;
                            }
                            for(k = 0; k < len; ++k){//for point k
                                var pos_x = newPos[k][0];
                                var pos_y = newPos[k][1];
                                console.log(`new coords for point ${k} test ${j}: ${pos_x + rotationTests[1][j][0]}, ${pos_y - rotationTests[1][j][1]}`)
                                console.log(`posx: ${pos_x}, posy: ${pos_y}`)

                                if(
                                pos_x + rotationTests[1][j][0] < 0 || pos_x + rotationTests[1][j][0] > 9 ||
                                pos_y - rotationTests[1][j][1] < 0 || pos_y - rotationTests[1][j][1] > 19 ||
                                squares[IX(pos_x + rotationTests[1][j][0], pos_y - rotationTests[1][j][1])].classList.length == 1){
                                    console.log("second case triggered")
                                    k -= 1;
                                    break;
                                } else {
                                    console.log("worky")
                                    currentPiece.currentPos[k] = IX(pos_x + rotationTests[1][j][0], pos_y - rotationTests[1][j][1]);
                                }
                            }
                        }
                        
                    } else if((prev_state == 0 && new_state == 3)){
                        console.log("third ran")
                        for(var j = 0; j <= 4; ++j){ //rotate through tests
                            if(k == 4 || j == 4){
                                console.log("exit rotation loop");
                                break;
                            }
                            for(k = 0; k < len; ++k){//for point k
                                var pos_x = newPos[k][0];
                                var pos_y = newPos[k][1];
                                console.log(`new coords for point ${k} test ${j}: ${pos_x + rotationTests[2][j][0]}, ${pos_y - rotationTests[2][j][1]}`)
                                console.log(`posx: ${pos_x}, posy: ${pos_y}`)

                                if(
                                pos_x + rotationTests[2][j][0] < 0 || pos_x + rotationTests[2][j][0] > 9 ||
                                pos_y - rotationTests[2][j][1] < 0 || pos_y - rotationTests[2][j][1] > 19 ||
                                squares[IX(pos_x + rotationTests[1][j][0], pos_y - rotationTests[2][j][1])].classList.length == 1){
                                    console.log("second case triggered")
                                    k -= 1;
                                    break;
                                } else {
                                    console.log("worky")
                                    currentPiece.currentPos[k] = IX(pos_x + rotationTests[2][j][0], pos_y - rotationTests[2][j][1]);
                                }
                            }
                        }
                    } else if((prev_state == 3 && new_state == 2)){
                        console.log("fourth ran")
                        for(var j = 0; j <= 4; ++j){ //rotate through tests
                            if(k == 4 || j == 4){
                                console.log("exit rotation loop");
                                break;
                            }
                            for(k = 0; k < len; ++k){//for point k
                                var pos_x = newPos[k][0];
                                var pos_y = newPos[k][1];
                                console.log(`new coords for point ${k} test ${j}: ${pos_x + rotationTests[3][j][0]}, ${pos_y - rotationTests[3][j][1]}`)
                                console.log(`posx: ${pos_x}, posy: ${pos_y}`)

                                if(
                                pos_x + rotationTests[3][j][0] < 0 || pos_x + rotationTests[3][j][0] > 9 ||
                                pos_y - rotationTests[3][j][1] < 0 || pos_y - rotationTests[3][j][1] > 19 ||
                                squares[IX(pos_x + rotationTests[3][j][0], pos_y - rotationTests[3][j][1])].classList.length == 1){
                                    console.log("second case triggered")
                                    k -= 1;
                                    break;
                                } else {
                                    console.log("worky")
                                    currentPiece.currentPos[k] = IX(pos_x + rotationTests[3][j][0], pos_y - rotationTests[3][j][1]);
                                }
                            }
                        }
                    }
            } else {
                for(var j = 0; j < 4; ++j){
                    currentPiece.currentPos[j] = IX(newPos[j][0], newPos[j][1]);
                }
            }
        }

        for(var i = 0, len = currentPiece.currentPos.length; i < len; ++i){
            squares[currentPiece.currentPos[i]].classList.add("piece")
        }
    } else if(e.which === 67){
        if(held_fire == true){
            for(var i = 0; i < 4; ++i){
                squares[currentPiece.currentPos[i]].classList.remove("piece")
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
                console.log("full")
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
}

  //coords/index functions
function IX(x, y){
    return 10 * y + x; //returns div position
}

function IC(index){
    return [index % 10, (index - (index % 10)) / 10];
} //returns [x, y]

//this allows us to rewrite the hitboxes such that rotated blocks will still have hitboxes (theoretically)
function checkDir(dir){
    var squares = document.querySelectorAll(".grid div");
    let bound = TandBOfBlock();
    let right, left;
    let impBlocks = [];
    switch (dir){
    //right-side imp blocks
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
            //check if blocks in impblocks ever hit a block / wall
            let blockIndex = currentPiece.currentPos.indexOf(impBlocks[i]);
            if(currentPiece.currentPos[blockIndex] % 10 == 9 || squares[currentPiece.currentPos[blockIndex] + 1].classList.length == 1){
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
            //check if blocks in impblocks ever hit a block / wall
            let blockIndex = currentPiece.currentPos.indexOf(impBlocks[i]);
            if(currentPiece.currentPos[blockIndex] % 10 == 0 || squares[currentPiece.currentPos[blockIndex] - 1].classList.length == 1){
                return false;
            }
        }
        return true;
    
    case "bottom": //needs right and left bound (as well as harddrop)
        //find which blocks are important by checking which ones don't have a block from the same shape beneath them
        var tempArray = [];
        var check = [];

        for(var i = 0, len = currentPiece.currentPos.length; i < len; ++i){
            for(var j = 0; j < len; ++j){
                if(IC(currentPiece.currentPos[i])[0] == IC(currentPiece.currentPos[j])[0] 
                && currentPiece.currentPos[i] != currentPiece.currentPos[j] 
                && check.indexOf(currentPiece.currentPos[i]) == -1){
                    //x is the same, block isnt itself, block is not in check
                    tempArray.push(currentPiece.currentPos[i]);
                    check.push(currentPiece.currentPos[i]);
                }
            }
            if(check.indexOf(currentPiece.currentPos[i]) == -1){
                impBlocks.push(currentPiece.currentPos[i]);
                check.push(currentPiece.currentPos[i]);
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

        for(let i = 0; i < impBlocks.length; i++){
            //check if blocks in impblocks ever hit a block / wall
            let blockIndex = currentPiece.currentPos.indexOf(impBlocks[i]);
            if(!(squares[currentPiece.currentPos[blockIndex] + 10].classList.length == 0)){
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
//might not need randl

// function RandLOfBlock(len, ){ //takes array of blocks?
//     let right;
//     let left;

//     for(let i = 0; i < 4; i++){
//         if(IC(currentPiece.currentPos[i])[0] < left || left == undefined){
//             console.log(`new left is at ${IC(currentPiece.currentPos[i])[0]}`)
//             left = IC(currentPiece.currentPos[i])[0];
//         }
//         else if(IC(currentPiece.currentPos[i])[0] > right || right == undefined){
//             console.log(`new right is at ${IC(currentPiece.currentPos[i])[0]}`)
//             right = IC(currentPiece.currentPos[i])[0];
//         } 
//     }

//     console.log(`${left}, ${right}`)
//     return [left, right];
// }

function repeat(){ 
    var squares = document.querySelectorAll(".grid div");
    if(checkDir("bottom")){
        var squares = document.querySelectorAll(".grid div");
        var prevSpace = currentPiece.currentPos.splice(0, 4);
        prevSpace.forEach(index => squares[index].classList.remove("piece"));
        for(var i = 0; i < 4; i++){
            currentPiece.currentPos.push(prevSpace[i] + 10);
        }
        currentPiece.currentPos.forEach(index => squares[index].classList.add("piece"));
    } else {
        if(squares[4].classList.length === 0){
            lineChecker();
            clearInterval(intervalID);
            intervalID = setInterval(repeat, intervalTime)
            selectBlock();
            defaultSetting();
        } else {
            clearInterval(intervalID); //kill the game
        }
    }
}

function game(){
    addDiv();
    document.addEventListener("keydown", control);
    selectBlock();
    defaultSetting();
    console.log("pemnis)");
    intervalID = setInterval(repeat, intervalTime);
}

game();
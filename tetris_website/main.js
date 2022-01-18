'use strict';

var intervalTime = 1000;   
var topLine = 20;
var intervalID;
var startingPos = 4;
var currentPiece;

//itd be easier if we rewrote this to use objects instead of arrays
//since rn i cant think of a way to add multiple rotating objects
//add object for every block
//default position, add rotation function (should be dynamic)

var tPiece;
var leftL;
var rightL;
var straightLine;
var sShape;
var zShape = {
    name: "z-shape",
    currentPos: [startingPos - 1, startingPos, startingPos + 10, startingPos + 11],
    defaultPos: [startingPos - 1, startingPos, startingPos + 10, startingPos + 11],
    checkBottom: function(){
        var squares = document.querySelectorAll(".grid div");
        return (squares[this.currentPos[0] + 10].classList.length === 0 && squares[this.currentPos[2] + 10].classList.length === 0 && squares[this.currentPos[3] + 10].classList.length === 0);
    },
    downBehavior: function(){
        var squares = document.querySelectorAll(".grid div");
        var prevSpace = currentPiece.currentPos.splice(0, 4);
        prevSpace.forEach(index => squares[index].classList.remove("piece"));

        prevSpace.forEach(element => this.currentPos.push(element + 10));
        currentPiece.currentPos.forEach(index => squares[index].classList.add("piece"));
    },
    downKey: function(){
        var squares = document.querySelectorAll(".grid div");
        if(this.checkBottom()){
            var squares = document.querySelectorAll(".grid div");
            var prevSpace = currentPiece.currentPos.splice(0, 4);
            prevSpace.forEach(index => squares[index].classList.remove("piece"));

            prevSpace.forEach(element => this.currentPos.push(element + 10));
            currentPiece.currentPos.forEach(index => squares[index].classList.add("piece"));
        }
    },
    
};
var squarePiece = {
    name: "square-piece",
    currentPos: [startingPos, startingPos + 1, startingPos + 10, startingPos + 11],
    defaultPos: [startingPos, startingPos + 1, startingPos + 10, startingPos + 11],
    checkBottom: function(){
        var squares = document.querySelectorAll(".grid div");
        return (squares[this.currentPos[2] + 10].classList.length === 0 && squares[this.currentPos[3] + 10].classList.length === 0);
    },
    downBehavior: function(){
        var squares = document.querySelectorAll(".grid div");
        var prevSpace = currentPiece.currentPos.splice(0, 2);
        prevSpace.forEach(index => squares[index].classList.remove("piece"));
        
        currentPiece.currentPos.push(currentPiece.currentPos[0] + 10, currentPiece.currentPos[1] + 10);
        currentPiece.currentPos.forEach(index => squares[index].classList.add("piece"));

        console.log(currentPiece);
        console.log(currentPiece.currentPos);
    },
    downKey: function(){
        var squares = document.querySelectorAll(".grid div");
        //(currentPiece.currentPos[0] + 20 ) < 200 && 
        if(this.checkBottom()){
            var squares = document.querySelectorAll(".grid div");
            let prevSpace = currentPiece.currentPos.splice(0, 2);
            prevSpace.forEach(index => squares[index].classList.remove("piece"));
            
            currentPiece.currentPos.push(currentPiece.currentPos[0] + 10, currentPiece.currentPos[1] + 10);
            currentPiece.currentPos.forEach(index => squares[index].classList.add("piece"));
        } else {
            console.log("a");
            intervalTime = 0;
            return; //doesnt work
        }
    }
    
};

//this will be scuffed so fix this
function selectBlock(){
    var select = document.getElementById('language');
    var value = select.options[select.selectedIndex].value;
    console.log(squarePiece.checkBottom());
    console.log(value);
    switch(value){
        case 'squarePiece':
            currentPiece = squarePiece;
        break;
        case 'zShape':
            currentPiece = zShape;
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
            console.log("clear line"); // add logic to count rows

            if(row < topLine || topLine == undefined){ //defines the top line of cleared lines
                topLine = row;
                console.log(topLine);
            }

            for(var x = 0; x < 10; x++){ // removes rows
                squares[(row * 10) + x].classList.remove("piece");

            }

        }
    } else {
        return 0;
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

//        console.log(`total value of row ${y}: ${total}`);
        clearLine(y, total); // quickly cycles through all 20 rows and clears combined rows

    }

//    console.log("Rowcount: " + rowCount);
//    console.log(topLine);
    // so i want to return rowCount and then potentially add function here?
    // implement rowcount here and then add row moving here?
    //copy all filled square location to an array
    // select 

    
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

        console.log("a");

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

addDiv();


function defaultSetting(){
    console.log(currentPiece);
    var squares = document.querySelectorAll(".grid div");
    currentPiece.currentPos.splice(0, 4, ...currentPiece.defaultPos);
    currentPiece.defaultPos.forEach(index => squares[index].classList.add("piece"));
    console.log(currentPiece.currentPos)
}


function control(e) {
    var squares = document.querySelectorAll(".grid div");

    if (e.which === 39) {    //right
        if(!(currentPiece.currentPos[1] % 10 === 9) && squares[currentPiece.currentPos[1] + 1].classList.length === 0 && squares[currentPiece.currentPos[3] + 1].classList.length === 0){    // right
            let prevSpace = [currentPiece.currentPos.splice(0, 1), currentPiece.currentPos.splice(1, 1)];

            prevSpace.forEach(index => squares[index].classList.remove("piece"));

            currentPiece.currentPos.splice(1, 0, currentPiece.currentPos[0] + 1); // [prev, prev, new, new]
            currentPiece.currentPos.splice(3, 0, currentPiece.currentPos[2] + 1);

            squares[currentPiece.currentPos[1]].classList.add("piece");
            squares[currentPiece.currentPos[3]].classList.add("piece");
        } else {
            return;
        }

    } else if (e.which === 37) {    // left
        if(!(currentPiece.currentPos[0] % 10 === 0) && squares[currentPiece.currentPos[0] - 1].classList.length === 0 && squares[currentPiece.currentPos[2] - 1].classList.length === 0){
            var squares = document.querySelectorAll(".grid div");
            let prevSpace = [currentPiece.currentPos.splice(1, 1), currentPiece.currentPos.splice(2, 1)];

            prevSpace.forEach(index => squares[index].classList.remove("piece"));

            currentPiece.currentPos.splice(0, 0, currentPiece.currentPos[0] - 1); // [prev, prev, new, new]
            currentPiece.currentPos.splice(2, 0, currentPiece.currentPos[2] - 1);

            squares[currentPiece.currentPos[0]].classList.add("piece");
            squares[currentPiece.currentPos[2]].classList.add("piece");
        } else {
            return;
        }

    } else if (e.which === 40) {    // down
        currentPiece.downKey();
        //how to make it move to next interval hmmmmm


        //harddrop:
        //while loop to backwards check every block until you can hard drop
        //i.e 19th row false, 18th row false, 17th row true for currentPiece.currentPos[2]

    } 
  }

function repeat(){ 
var squares = document.querySelectorAll(".grid div");
console.log(currentPiece);

intervalID = setInterval(function(){
    intervalTime = 1000;
   if(currentPiece.checkBottom()){
        currentPiece.downBehavior(); //change to dynamic behavior
    } else {
        if(squares[startingPos].classList.length === 0){
            lineChecker();
            clearInterval(intervalID);
    //        console.log(currentPiece.currentPos[2] + 10);

            console.log("Interval Id: " + intervalID);
    //        console.log(currentPiece.currentPos[0])
            selectBlock();
            defaultSetting();
            repeat();
        } else {
            clearInterval(intervalID); //kill the game
        }
    }
}, intervalTime);
}

function game(){
    document.addEventListener("keydown", control);
    selectBlock();
    defaultSetting();
    repeat();
}

game();
  //coords/index functions
  function IX(x, y){
    return 10 * y + x; //returns div position
}

function IC(index){
    return [index % 10, (index - (index % 10)) / 10];
} //returns [x, y]

export {
    IX, IC
}
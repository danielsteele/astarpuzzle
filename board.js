/*
Program Author
    Daniel Steele

Program Description
    The user is presented with a sliding tile puzzle.
    The user can move the tiles on the puzzle.
    The A* algorithm is used to solve the puzzle.

Contents
    1. Board Prototype
    2. Heap Prototype
    3. Event Listeners
    4. Document Ready Function
    5. Animate Solution Function
    6. A* Algorithm
*/

//---------------------------------- 1. Board Prototype ------------------------------------------//

function Board() {
    this.state = [];
    this.path = [];
}

Board.prototype = {
    goalState: [0,1,2,3,4,5,6,7,8],

    foundGoalState: function() {
        for (let i = 0; i < this.goalState.length; i++) {
            if (this.state[i] !== this.goalState[i]) {
                return false;
            }
        }
        return true;
    },

    canMoveUp: function() {
        return this.state.indexOf(0) > 2;
    },

    canMoveRight: function() {
        const rightEdge = [2,5,8];
        return !rightEdge.includes(this.state.indexOf(0)); 
    },

    canMoveDown: function() {
        return this.state.indexOf(0) < 6;
    },

    canMoveLeft: function() {
        const leftEdge = [0,3,6];
        return !leftEdge.includes(this.state.indexOf(0));
    },

    moveUp: function() {
        //return a new board, with the new path and state
        var newBoard = new Board();
        var newState = this.state.slice(0);
        const zeroIndex = this.state.indexOf(0);
        //store the value of the tile above the blank tile
        const temp = this.state[zeroIndex-3];
        //swap them
        newState[zeroIndex-3] = 0;
        newState[zeroIndex] = temp;

        newBoard.state = newState;
        newBoard.path = this.path.slice(0);
        newBoard.path.push('U');

        return newBoard;
    },

    moveRight: function() {
        //return a new board, with the new path and state
        var newBoard = new Board();
        var newState = this.state.slice(0);
        const zeroIndex = this.state.indexOf(0);
        //store the value of the tile to the right of the blank tile
        const temp = this.state[zeroIndex+1];
        //swap them
        newState[zeroIndex+1] = 0;
        newState[zeroIndex] = temp;

        newBoard.state = newState;
        newBoard.path = this.path.slice(0);
        newBoard.path.push('R');

        return newBoard;
    },

    moveDown: function() {
        //return a new board, with the new path and state
        var newBoard = new Board();
        var newState = this.state.slice(0);
        const zeroIndex = this.state.indexOf(0);
        //store the value of the tile below the blank tile
        const temp = this.state[zeroIndex+3];
        //swap them
        newState[zeroIndex+3] = 0;
        newState[zeroIndex] = temp;

        newBoard.state = newState;
        newBoard.path = this.path.slice(0);
        newBoard.path.push('D');

        return newBoard;
    },

    moveLeft: function() {
        //return a new board, with the new path and state
        var newBoard = new Board();
        var newState = this.state.slice(0);
        const zeroIndex = this.state.indexOf(0);
        //store the value of the tile to the left of the blank tile
        const temp = this.state[zeroIndex-1];
        //swap them
        newState[zeroIndex-1] = 0;
        newState[zeroIndex] = temp;

        newBoard.state = newState;
        newBoard.path = this.path.slice(0);
        newBoard.path.push('L');

        return newBoard;
    },

    getGCost: function() {
        //g-cost represents the cost to get to this state
        return this.path.length;
    },

    getHCost: function() {
        //return the sum of the manhattan distance for all tiles excluding zero
        //the m.distance is 1 for a tile 1 move from its home, 2 for 2 moves etc
        //the h-cost is used to compute the f-cost and guide the search
        //the queue is implemented as a priority queue ordered by the f-cost
        //in this way the algorithm investigates likely choices first
        var manhattanDistance = 0;
        var horizontalDistance;
        var verticalDistance;
        var goalRow;
        var currentRow;
        for (let i = 0; i < this.state.length; i++) {
            //skip the zero tile
            if(this.state[i] === 0) { continue; }
            
            //compute horizontal distance
            horizontalDistance = Math.abs(i%3 - this.state[i]%3);
            
            //compute vertical distance
            i < 3 ? goalRow = 0 : 
            i < 6 ? goalRow = 1 : 
                    goalRow = 2;

            this.state[i] < 3 ? currentRow = 0 :
            this.state[i] < 6 ? currentRow = 1 :
                                currentRow = 2;

            verticalDistance = Math.abs(goalRow - currentRow); 
            
            //add the sum to the manhattanDistance total
            manhattanDistance += (horizontalDistance + verticalDistance);
        }

        return manhattanDistance;
    },

    getFCost: function() {
        //the f-cost is the heuristic estimate + the pathlength to this point
        return this.getGCost() + this.getHCost();
    }
}


//--------------------- 2. Binary Heap Prototype - Eloquent JavaScript----------------------------//

function BinaryHeap(scoreFunction){
  this.content = [];
  this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {
  push: function(element) {
    // Add the new element to the end of the array.
    this.content.push(element);
    // Allow it to bubble up.
    this.bubbleUp(this.content.length - 1);
  },

  pop: function() {
    // Store the first element so we can return it later.
    var result = this.content[0];
    // Get the element at the end of the array.
    var end = this.content.pop();
    // If there are any elements left, put the end element at the
    // start, and let it sink down.
    if (this.content.length > 0) {
      this.content[0] = end;
      this.sinkDown(0);
    }
    return result;
  },

  remove: function(node) {
    var length = this.content.length;
    // To remove a value, we must search through the array to find
    // it.
    for (var i = 0; i < length; i++) {
      if (this.content[i] != node) continue;
      // When it is found, the process seen in 'pop' is repeated
      // to fill up the hole.
      var end = this.content.pop();
      // If the element we popped was the one we needed to remove,
      // we're done.
      if (i == length - 1) break;
      // Otherwise, we replace the removed element with the popped
      // one, and allow it to float up or sink down as appropriate.
      this.content[i] = end;
      this.bubbleUp(i);
      this.sinkDown(i);
      break;
    }
  },

  size: function() {
    return this.content.length;
  },

  bubbleUp: function(n) {
    // Fetch the element that has to be moved.
    var element = this.content[n], score = this.scoreFunction(element);
    // When at 0, an element can not go up any further.
    while (n > 0) {
      // Compute the parent element's index, and fetch it.
      var parentN = Math.floor((n + 1) / 2) - 1,
      parent = this.content[parentN];
      // If the parent has a lesser score, things are in order and we
      // are done.
      if (score >= this.scoreFunction(parent))
        break;

      // Otherwise, swap the parent with the current element and
      // continue.
      this.content[parentN] = element;
      this.content[n] = parent;
      n = parentN;
    }
  },

  sinkDown: function(n) {
    // Look up the target element and its score.
    var length = this.content.length,
    element = this.content[n],
    elemScore = this.scoreFunction(element);

    while(true) {
      // Compute the indices of the child elements.
      var child2N = (n + 1) * 2, child1N = child2N - 1;
      // This is used to store the new position of the element,
      // if any.
      var swap = null;
      // If the first child exists (is inside the array)...
      if (child1N < length) {
        // Look it up and compute its score.
        var child1 = this.content[child1N],
        child1Score = this.scoreFunction(child1);
        // If the score is less than our element's, we need to swap.
        if (child1Score < elemScore)
          swap = child1N;
      }
      // Do the same checks for the other child.
      if (child2N < length) {
        var child2 = this.content[child2N],
        child2Score = this.scoreFunction(child2);
        if (child2Score < (swap == null ? elemScore : child1Score))
          swap = child2N;
      }

      // No need to swap further, we are done.
      if (swap == null) break;

      // Otherwise, swap and continue.
      this.content[n] = this.content[swap];
      this.content[swap] = element;
      n = swap;
    }
  }
};


//---------------------------- 3. Event Listeners ----------------------------//

function setMovableClass() {
    var buttons = $(".boardBtn");
    buttons.removeClass("movable");
    buttons.removeClass("blankTile");
    buttons.removeClass("Umove");
    buttons.removeClass("Rmove");
    buttons.removeClass("Dmove");
    buttons.removeClass("Lmove");

    buttons.unbind("click");

    for (let i = 0; i < 9; i++) {
        if(buttons[i].textContent === '0') {
            buttons[i].classList.add("blankTile");
            //look left
            if (i-1 >= 0 && (Number(i-1) % 3 !== 2)) {
                buttons[i-1].classList.add("movable", "Lmove");
            }

            //look up
            if (i-3 >= 0) {
                buttons[i-3].classList.add("movable", "Umove");
            }

            //look right
            if (i+1 < 9 && (Number(i+1) % 3 !== 0)) {
                //coercion to avoid the + being interpreted as concat
                buttons[i+1].classList.add("movable", "Rmove");
            }

            //look down
            if (i+3 < 9) {
                buttons[i+3].classList.add("movable", "Dmove");
            }
        }
    }
}

function setTileListeners() {
    setMovableClass();
    setMoveTileListener();
}

function setMoveTileListener() {
    var movableButtons = $(".movable");

    movableButtons.on("click", function() {
        $(".blankTile").text($(this).text());
        $(".blankTile").removeClass("blankTile");
        $(this).addClass("blankTile");
        $(this).text(0);
        setTileListeners();
    });
}

function shuffle() {
    //shuffle the buttons on the table and set the event listeners
    //and classes for each button
    var randomSet = Math.floor(Math.random() * 100 + 20);
    var moves; 
    var randomMove;
    
    for (let i = 0; i < randomSet; i++) {
        moves = $(".movable");
        randomMove = moves[Math.floor(Math.random() * moves.length)];
        //this classList[4] is the moveable class
        $("." + randomMove.classList[4]).trigger("click");

    }

    // reset the classes and event listeners
    setTileListeners();
}

function goBack() {
    var buttons = $(".boardBtn");
    var startPosition = $("#startpos").text().split(",");
    // console.log(startPosition);
    // console.log(startPosition.length);
    for (let i = 0; i < 9; i++) {
        buttons[i].textContent = startPosition[i];
    }
    setTileListeners();
}

$(document).ready(function(){
    $("#shuffle").on("click", shuffle);
    $("#goback").on("click", goBack);
    $("#solve").on("click", animateSolution);
    $("#goback").hide();

    setTileListeners();
});


//--------------------------- 4. Animate Solution ----------------------------//

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function animateSolution() {
    //fetches the solution from the astar function
    //uses the moves in the solution array to trigger the click events on the board
    //while the animation is running all buttons are disabled

    $("#goback").prop("disabled", true);
    $("#shuffle").prop("disabled", true);
    $("#solve").prop("disabled", true);
    $(".boardBtn").prop("disabled", true);

    var solution = astar();

    for (let i = 0; i < solution.length; i++) {
            $("." + solution[i] + "move").trigger("click");
            await sleep(500);
    }

    $("#goback").prop("disabled", false);
    $("#shuffle").prop("disabled", false);
    $("#solve").prop("disabled", false);
    $(".boardBtn").prop("disabled", false);
}


//----------------------------- 5. A* Algorithm ------------------------------//

function astar() {
    //return a solution to the puzzle
    var current,
        tempBoard,
        topVal,
        heap = new BinaryHeap(function(x){return x;}),
        queueMap = {},
        expandedList = {},
        initialBoard = createInitialBoard();

    var movesInvestigated = -1;
    var maxQueueSize = 0;
    var t0;
    var t1;
    var runtime;

    //add the initialBoard fcost to the heap
    heap.push(initialBoard.getFCost());

    //add the initialBoard to the queue
    queueMap[initialBoard.getFCost()] = [];
    queueMap[initialBoard.getFCost()].push(initialBoard);


    return findSolution();

    function getInitialBoardValues() {
        var buttons = $(".boardBtn");
        let initialBoardValues = [];

        for (let i = 0; i < 9; i++) {
            initialBoardValues.push(Number(buttons[i].textContent));
        }

        return initialBoardValues;
    }

    function createInitialBoard() {
        var initialBoard = new Board();
        // console.log("new board created. does it have own property state? :" + initialBoard.hasOwnProperty("state"));
        // console.log("new board created. does it have own property path? :" + initialBoard.hasOwnProperty("path"));
        initialBoard.state = getInitialBoardValues();
        initialBoard.path = [];

        return initialBoard;
    }

    function updateHeapAndQueue(newBoard) {
        //if the new board does not exist in the expanded List
        //  add its fcost to the heap
        //  add the board to the queue
        if (!expandedList[newBoard.state]) {
            heap.push(newBoard.getFCost());
            maxQueueSize = Math.max(maxQueueSize, heap.size());
            if (!queueMap[newBoard.getFCost()]) {
                queueMap[newBoard.getFCost()] = [];
            }
            queueMap[newBoard.getFCost()].push(newBoard);

        }
    }

    function findSolution() {
        //main algorithm loop
        t0 = performance.now();

        while (heap.size() > 0) {
            //get the next value from the root of the heap
            topVal = heap.pop();
            //get the next board from the queue with that f-cost
            current = queueMap[topVal].pop();

            //test for the goal state
            movesInvestigated++;
            if (current.foundGoalState()) {
                t1 = performance.now();
                runtime = ((t1 - t0)/1000).toFixed(4);
                // console.log("moves investigated: " + movesInvestigated);
                // console.log("max queue size: " + maxQueueSize);
                // console.log("total moves: " + current.path.length);
                // console.log("solution: " + current.path.toString());
                $("#runtime").text(runtime + " seconds");
                $("#solution").text(current.path.toString());
                $("#startpos").text(initialBoard.state.toString());
                // $("#goback").removeAttr("hidden");
                $("#goback").show();
                $("#totalmoves").text(current.path.length);
                $("#investigated").text(movesInvestigated);
                $("#maxqueue").text(maxQueueSize);
                return current.path;
            }

            //no goal state found, expand the current state
            //move up
            if (current.canMoveUp()) {
                tempBoard = current.moveUp();
                updateHeapAndQueue(tempBoard);
            }

            //move right
            if (current.canMoveRight()) {
                tempBoard = current.moveRight();
                updateHeapAndQueue(tempBoard);
            }

            //move down
            if (current.canMoveDown()) {
                tempBoard = current.moveDown();
                updateHeapAndQueue(tempBoard);
            }

            //move left
            if (current.canMoveLeft()) {
                tempBoard = current.moveLeft();
                updateHeapAndQueue(tempBoard);
            }
        }
    }
}

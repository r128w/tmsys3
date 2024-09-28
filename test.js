// import * as Realm from "realm-web";


var internalData;

const app = new Realm.App({ id: "application-0-ivhubsi"});
const credentials = Realm.Credentials.anonymous();

var user_global;

var lastUpdated;

var instantWrite = false;// whether or not to write every update
//if true, writes will be pushed on page update
//if false, writes will be pushed once every 30 seconds, provided there has been an update
var needWrite = false;

async function iGotBlack(){
      // Create an anonymous credential
      // Authenticate the user
      console.log("Running authentication");
const user = await app.logIn(credentials);
user_global = user;
      // `App.currentUser` updates to match the logged in user
console.assert(user.id === app.currentUser.id);

};


async function iGotWhite(){//update internal data state

    console.log("Reading from MongoDB");
    
    const startTime = Date.now();
    await iGotBlack();


      var processedPassword = document.getElementById("passwordBox").innerText;
      processedPassword = processedPassword.replace("<br>", "");
      processedPassword = processedPassword.replace("\n", "");
    const allStuff = await user_global.functions.readAll(processedPassword);

    console.log(allStuff);
    internalData = allStuff;

    document.getElementById("updateTimeRead").innerText = `Read: ${Date.now()-startTime} ms`;
    blowohoh();

    hopOutsideAGhost(internalData);

};

async function whatchuWant(element){// update the list and data, write

    console.log(`Write request - button - received from ${element}`);
    const startTime = Date.now();

    const dataIndex = Array.from(element.parentNode.parentNode.children).indexOf(element.parentNode)-1; // -1 because of the sample task element at the top
    
    if(element.nodeName=="BUTTON"){//button functionality
        
        if(element.innerText=="x"){

            internalData[((element.parentNode.parentNode.id == "todoColumn") ? "todo" : "done")].splice(dataIndex, 1);

            hopOutsideAGhost(internalData);
            console.log(await andHopUp(internalData));

        }else if(element.innerText=="Done"){

            const dataToMove = internalData["todo"][dataIndex];

            internalData["todo"].splice(dataIndex, 1);// remove from original side
            internalData["done"].unshift(dataToMove);

            hopOutsideAGhost(internalData);
            console.log(await andHopUp(internalData));

        }else if(element.innerText=="Undo"){

            const dataToMove = internalData["done"][dataIndex];

            internalData["done"].splice(dataIndex, 1);// remove from original side
            internalData["todo"].push   (dataToMove);

            hopOutsideAGhost(internalData);
            console.log(await andHopUp(internalData));

        }else if(element.innerText=="↓"){
            const column = ((element.parentNode.parentNode.id == "todoColumn") ? "todo" : "done");
            const dataToMove = internalData[column][dataIndex];

            if(dataIndex + 1 < internalData[column].length){
                internalData[column][dataIndex] = internalData[column][dataIndex+1];
                internalData[column][dataIndex+1] = dataToMove;
                
                hopOutsideAGhost(internalData);
                console.log(await andHopUp(internalData));
            }
            // else{console.log("USER used DOWN! Nothing happened!");}
            
        }else if(element.innerText=="↑"){
            const column = ((element.parentNode.parentNode.id == "todoColumn") ? "todo" : "done");
            const dataToMove = internalData[column][dataIndex];

            if(dataIndex > 0){
                internalData[column][dataIndex] = internalData[column][dataIndex-1];
                internalData[column][dataIndex-1] = dataToMove;
                
                hopOutsideAGhost(internalData);
                console.log(await andHopUp(internalData));
            }
            // else{console.log("USER used UP! Nothing happened!");}
        }else if(element.innerText=="+"){
            var newTask = {};
            newTask["name"] = "New Task";
            newTask["description"] = "Description";
            newTask["timestamp"] = Math.floor(Date.now() / 1000);

            internalData["todo"].push(newTask);
            hopOutsideAGhost(internalData);
            // console.log(internalData);
            console.log(await andHopUp(internalData));
        }
    }


};

async function hopOutsideAGhost(rawJSON){//display the json input to the webpage

    console.log("Displaying data");

    const sampleTodoElement = document.getElementById("sampleTodo");
    const todoColumn = document.getElementById("todoColumn");
    const sampleDoneElement = document.getElementById("sampleDone");
    const doneColumn = document.getElementById("doneColumn");

    const addTaskElement = document.getElementById("addTask");

    todoColumn.innerHTML="";
    doneColumn.innerHTML="";
    todoColumn.appendChild(sampleTodoElement);
    doneColumn.appendChild(sampleDoneElement);

    for(var i = 0;i<rawJSON["todo"].length;i++){
        // console.log(rawJSON["todo"][i]["name"]);
        // console.log(rawJSON["todo"][i]["description"]);
        var newElement = sampleTodoElement.cloneNode(true);// clone the task etc, deep
        // console.log(newElement.childNodes[9]);
        newElement.className = "taskContainer";
        newElement.removeAttribute("id");

        newElement.childNodes[9].innerText = rawJSON["todo"][i]["name"];
        newElement.childNodes[11].innerText = rawJSON["todo"][i]["description"];

        todoColumn.appendChild(newElement);
    }

    for(var i = 0;i<rawJSON["done"].length;i++){
        var newElement = sampleDoneElement.cloneNode(true);
        newElement.className = "taskContainer";
        newElement.removeAttribute("id");//clean that up

        newElement.childNodes[9].innerText = rawJSON["done"][i]["name"];
        newElement.childNodes[11].innerText = rawJSON["done"][i]["description"];

        doneColumn.appendChild(newElement);
    }


    todoColumn.appendChild(addTaskElement);// readd the button at the bottom

};

async function andHopUp(stuff){//write function


    if(instantWrite){

    var processedPassword = document.getElementById("passwordBox").innerText;
    processedPassword = processedPassword.replace("<br>", "");
    processedPassword = processedPassword.replace("\n", "");
    if(await user_global.functions.writeAll(stuff, processedPassword) != "Write successful"){
        alert("401 - Unauthorized. Write to MongoDB unsuccessful.");
        return "Failed. lmao";
    }else{
        return "Write success";
    }
    }else{// mark modification is in order
        needWrite = true;
        return "Marked as needing write";
    }
};

var IPcalls = 0;//innaPhantom calls
// this function is called for all editable divs, meaning that editing two in quick succession will be broken... sucks ig
async function innaPhantom(element){//function called by the editable divs on keyup
    // console.log("ping!");

    // dont need call time check anymore, since write overlap shouldnt be an issue anymore
    // IPcalls++;
    // // this function, if called and then not called for another three seconds, sends a write request through andHopUp. if it is called twice in quick succession, it still only sends one request (to prevent overlap)
    // var old = IPcalls;
    // for(var i = 0;i<10;i++){
    // await new Promise(r => setTimeout(r, 100));//100 ms delay
    //     if(IPcalls!=old){
    //         return;
    //     }
    // }

    // console.log("write!");
    console.log(`Write request - text input - received from ${element}`);
    // const startTime = Date.now();

    //sick one-liner
    internalData[((element.parentNode.parentNode.id == "todoColumn") ? "todo" : "done")][Array.from(element.parentNode.parentNode.children).indexOf(element.parentNode)-1][(element.className == "taskName" ? "name" : "description")] = element.innerText;

    // hopOutsideAGhost(internalData); // no need to run display on every edit, as each edit already edits the display
    // console.log(internalData);
    console.log(await andHopUp(internalData));
    

};

var timerID = "none yet!";

function iKnowImBoutta(){//update the time elapsed since last update text

    let timeElapsed = Date.now() - lastUpdated;

    let displayString = `${timeElapsed} ms`;

    let selfExecuteDelay = 9;// ms until next call of this function (recursive updating) (starts at 10 ms, but increases with time)

    if(timeElapsed > 999){
        displayString = `${Math.floor(timeElapsed/1000)} s`;
        selfExecuteDelay = 999;
        if(timeElapsed > 59999){
            displayString = `${Math.floor(timeElapsed/60000)} m`;
            selfExecuteDelay = 9999;
            if(timeElapsed > 3599999){
                selfExecuteDelay = 999999;
                displayString = `${Math.floor(timeElapsed/3600000)} h`;
            }
        }
    }
    displayString = "Last updated: " + displayString;

    document.getElementById("updateTimeElapsed").innerText = displayString;

    console.log("Time since update ping");

    timerID = setTimeout(iKnowImBoutta, selfExecuteDelay);

}

function blowohoh() {
    lastUpdated = Date.now();
    if(timerID != "none yet!"){clearTimeout(timerID);}// clear the update loop
    iKnowImBoutta();// start the loop fresh
    console.log("Resetting timeElapsed loop");
}

function iAintDumb(){// calls read every update of the passwordBox - because read update overlap is not problematic (unlike write)
    iGotWhite();
    //redundant function for "clarity"
    //flickers if password is incorrect, but otherwise fine
}

async function theyTrynaStealMyFlow(){// recurring update timer (if instantWrite == false)
    console.log("<> Write update ping");
    if(needWrite){//copied from andHopUp()
        startTime = Date.now();
        var processedPassword = document.getElementById("passwordBox").innerText;
        processedPassword = processedPassword.replace("<br>", "");
        processedPassword = processedPassword.replace("\n", "");
        if(await user_global.functions.writeAll(internalData, processedPassword) != "Write successful"){
            alert("401 - Unauthorized. Write to MongoDB unsuccessful.");
            console.log("Write failed. lmao");
        }else{
            needWrite = false;

            document.getElementById("updateTimeWrite").innerText = `Write: ${Date.now()-startTime} ms`;
            blowohoh();

            console.log("Write success");
        }
    }else{console.log("No write");}
    setTimeout(theyTrynaStealMyFlow, 15000);// shouldnt be too resource intensive, because of the single bool check on idle
}

if(instantWrite == false){
    theyTrynaStealMyFlow();
}

iGotWhite();

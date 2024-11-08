// import * as Realm from "realm-web";


var internalData;
// formatted
/*
{
    "todo": [
        {"name": "blah","description":"blah","timestamp":123,"checklist":{
            "name":"blah",
            "content":[
                {"text":"blah","completed":true},
                {"text":"blah","completed":true},
                {"text":"blah","completed":true},
            ]
        },
        {"name": "blah","description":"blah","timestamp":123}
    ],
    "done": [
        {"name": "blah","description":"blah","timestamp":123},
        {"name": "blah","description":"blah","timestamp":123}
    ],
}

*/

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
        }else if(element.innerText=="+" || element.innerText=="^"){
            var newTask = {};
            newTask["name"] = "New Task";
            newTask["description"] = "Description";
            newTask["timestamp"] = Math.floor(Date.now() / 1000);

            if(element.innerText == "+"){
                internalData["todo"].push(newTask); // adds to bottom of tasklist
            }else{
                // internalData["todo"] = [newTask] + internalData["todo"];// cursed push to front
                // console.log(internalData["todo"]);
                internalData["todo"].unshift(newTask);
            }
            // if(element.innerText == "^"){// swap w top
            //     const first = internalData["todo"][0];
            //     internalData["todo"][0] = internalData["todo"][internalData["todo"].length-1];
            //     internalData["todo"][internalData["todo"].length-1] = first;
            // }
            hopOutsideAGhost(internalData);
            // console.log(internalData);
            console.log(await andHopUp(internalData));
        }
    }


};

const sampleChecklist = `<div class="checklist mainFont">
            <div class="checklistName mainFont" contenteditable="true">[[[CHECKLIST NAME]]]</div>
            <!--[[ITEMS]]-->
            
          `;
const sampleChecklistItem = `
            <div class = "checklistItem mainFont">
              <button class="checklistItemButton" onclick="iTakeTheyAs(this)">[[[DONE]]]</button>
              <button class="checklistItemButton" onclick="iTakeTheyAs(this)">-</button>
              <div class="checklistItemName mainFont" contenteditable="true" onkeyup="iTakeTheyAs(this)">[[[ITEM NAME]]]</div>
            </div>
`;

const sampleAddChecklistButton = `
            <button class = "checklistItemButton" onclick="iTakeTheyAs(this)">+</button>`;

async function hopOutsideAGhost(rawJSON){//display the json input to the webpage

    console.log("Displaying data");

    const sampleTodoElement = document.getElementById("sampleTodo");
    const todoColumn = document.getElementById("todoColumn");
    const sampleDoneElement = document.getElementById("sampleDone");
    const doneColumn = document.getElementById("doneColumn");

    const addTaskElement = document.getElementById("addTask");
    const extraAddButton = document.getElementById("addTaskAlt");

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

        if(rawJSON["todo"][i]["checklist"]!=null){//wait. im floated
            // console.log(i);
            newElement.innerHTML += sampleChecklist.replace("[[[CHECKLIST NAME]]]", rawJSON["todo"][i]["checklist"]["name"]);

            for(var ii = 0; ii < rawJSON["todo"][i]["checklist"]["content"].length;ii++){
                var newCheckItem = sampleChecklistItem;
                newCheckItem = newCheckItem.replace("[[[ITEM NAME]]]", rawJSON["todo"][i]["checklist"]["content"][ii]["name"]);
                // console.log(rawJSON["todo"][i]["checklist"]["content"][ii]["name"]);
                // console.log(newCheckItem);
                // console.log(newCheckItem.replace("[[[DONE]]]","GAY"));
                newCheckItem = newCheckItem.replace("[[[DONE]]]", (rawJSON["todo"][i]["checklist"]["content"][ii]["completed"] ? "D" : "<br>"));
                newElement.children[6].innerHTML+=newCheckItem;// index 6 not always guaranteed, but cest la vie
            }
            newElement.children[6].innerHTML+=sampleAddChecklistButton;
        }

        todoColumn.appendChild(newElement);
    }

    for(var i = 0;i<rawJSON["done"].length;i++){
        var newElement = sampleDoneElement.cloneNode(true);
        newElement.className = "taskContainer";
        newElement.removeAttribute("id");//clean that up

        newElement.childNodes[9].innerText = rawJSON["done"][i]["name"];
        newElement.childNodes[11].innerText = rawJSON["done"][i]["description"];

        if(rawJSON["done"][i]["checklist"]!=null){//wait. im floated
            // console.log(i);
            newElement.innerHTML += sampleChecklist.replace("[[[CHECKLIST NAME]]]", rawJSON["done"][i]["checklist"]["name"]);

            for(var ii = 0; ii < rawJSON["done"][i]["checklist"]["content"].length;ii++){
                var newCheckItem = sampleChecklistItem;
                newCheckItem.replace("[[[NAME]]]", rawJSON["done"][i]["checklist"]["content"][ii]["name"]);
                newCheckItem.replace("[[[DONE]]]", (rawJSON["done"][i]["checklist"]["content"][ii]["completed"] ? "D" : "<br>"));
                newElement.children[6].innerHTML+=newCheckItem;// index 6 not always guaranteed, but cest la vie
            }
            newElement.children[6].innerHTML+=sampleAddChecklistButton;
        }

        doneColumn.appendChild(newElement);
    }


    todoColumn.appendChild(addTaskElement);// readd the button at the bottom
    todoColumn.appendChild(extraAddButton);// anothero ne

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

    
    if(element.innerText.endsWith("[checklist]")){
        element.innerText = element.innerText.substring(0,element.innerText.length-11);// wait. im goated
        // console.log("woaooooh");
        internalData[((element.parentNode.parentNode.id == "todoColumn") ? "todo" : "done")][Array.from(element.parentNode.parentNode.children).indexOf(element.parentNode)-1]["checklist"]= {
            "name":"New Checklist",
            "content":[{"name":"New item","completed":false}]
        };// HOOOOLY first try. absolutely throated
        // console.log(internalData);
        internalData[((element.parentNode.parentNode.id == "todoColumn") ? "todo" : "done")][Array.from(element.parentNode.parentNode.children).indexOf(element.parentNode)-1][(element.className.includes("taskName") ? "name" : "description")] = element.innerText;
        hopOutsideAGhost(internalData);
        return;
    }// its checklisting time

    //sick one-liner
    internalData[((element.parentNode.parentNode.id == "todoColumn") ? "todo" : "done")][Array.from(element.parentNode.parentNode.children).indexOf(element.parentNode)-1][(element.className.includes("taskName") ? "name" : "description")] = element.innerText;


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

function iTakeTheyAs(element){// checklist only update function, called by buttons and textfields
/*"todo": [
        {"name": "blah","description":"blah","timestamp":123,"checklist":{
            "name":"blah",
            "content":[
                {"text":"blah","completed":true},
                {"text":"blah","completed":true},
                {"text":"blah","completed":true},
            ]
        },
        {"name": "blah","description":"blah","timestamp":123}
    ], */


    
    var column = ((element.parentNode.parentNode.parentNode.parentNode.id == "todoColumn") ? "todo" : "done");

    var dataIndex = Array.from(element.parentNode.parentNode.parentNode.parentNode.children).indexOf(element.parentNode.parentNode.parentNode)-1;
    var checklistIndex = Array.from(element.parentNode.parentNode.children).indexOf(element.parentNode)-1;

    if((element.innerHTML == "+" && element.nodeName == "BUTTON") || (element.nodeName == "DIV" && element.className.includes("checklistName"))){
        column = ((element.parentNode.parentNode.parentNode.id == "todoColumn") ? "todo" : "done");
        dataIndex = Array.from(element.parentNode.parentNode.parentNode.children).indexOf(element.parentNode.parentNode)-1;
        // checklistIndex = Array.from(element.parentNode.children).indexOf(element.parentNode)-1;
    }

    console.log("cl update:" +column + dataIndex + "@" + checklistIndex);

    if(element.nodeName == "BUTTON"){

        if(element.innerHTML == "+"){
            // add a checklist item
            console.log(internalData);
            internalData[column][dataIndex]["checklist"]["content"].push({"name":"New item", "completed":false});
        }else
        if(element.innerHTML == "-"){

            //remove checklist item
            internalData[column][dataIndex]["checklist"]["content"].splice(checklistIndex, 1);
            
        }else{
            // console.log(element.innerHTML);

        var checking = true;// whether or not this should be made true/false
        // console.log("asd")
        if(element.innerHTML == "D"){
            // console.log("check it");
            checking = false
        }

        if(checking){
            element.innerHTML = "D";
        }else{
            element.innerHTML = "<br>";
        }
        // set the corresponding button & internalData entry to value in 'checking'

        internalData[column][dataIndex]["checklist"]["content"][checklistIndex]["completed"] = checking;


        }
        hopOutsideAGhost(internalData);

    }else if (element.nodeName == "DIV"){
        if(element.className.includes("checklistName")){
            internalData[column][dataIndex]["checklist"]["name"] = element.innerText;
        }else if(element.className.includes("checklistItemName")){
            internalData[column][dataIndex]["checklist"]["content"][checklistIndex]["name"] = element.innerText;
        }
    }

    // const dataToMove = internalData[column][dataIndex];

    // if(dataIndex > 0){
    //     internalData[column][dataIndex] = internalData[column][dataIndex-1];
    //     internalData[column][dataIndex-1] = dataToMove;
        
    //     hopOutsideAGhost(internalData);
    //     console.log(await andHopUp(internalData));
    // }
}

if(instantWrite == false){
    theyTrynaStealMyFlow();
}

iGotWhite();

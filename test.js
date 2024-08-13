// import * as Realm from "realm-web";


var internalData;

const app = new Realm.App({ id: "application-0-ivhubsi"});
const credentials = Realm.Credentials.anonymous();

var user_global;

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

    const allStuff = await user_global.functions.readAll();

    console.log(allStuff);
    internalData = allStuff;
    document.getElementById("updateTimeRead").innerText = `Read took ${Date.now()-startTime} ms`;

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

    document.getElementById("updateTimeWrite").innerText = `Write took ${Date.now()-startTime} ms`;

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
    if(await user_global.functions.writeAll(stuff, document.getElementById("passwordBox").innerText) != "Write successful"){
        alert("401 - Unauthorized. Write to MongoDB unsuccessful.");
        return "Failed. lmao";
    }else{
        return "Write success";
    }
};

var IPcalls = 0;//innaPhantom calls
// this function is called for all editable divs, meaning that editing two in quick succession will be broken... sucks ig
async function innaPhantom(element){//function called by the editable divs on keyup
    // console.log("ping!");
    IPcalls++;
    // this function, if called and then not called for another three seconds, sends a write request through andHopUp. if it is called twice in quick succession, it still only sends one request (to prevent overlap)
    var old = IPcalls;
    for(var i = 0;i<30;i++){
    await new Promise(r => setTimeout(r, 100));//100 ms delay
        if(IPcalls!=old){
            return;
        }
    }

    // console.log("write!");
    console.log(`Write request - text input - received from ${element}`);
    const startTime = Date.now();

    //sick one-liner
    internalData[((element.parentNode.parentNode.id == "todoColumn") ? "todo" : "done")][Array.from(element.parentNode.parentNode.children).indexOf(element.parentNode)-1][(element.className == "taskName" ? "name" : "description")] = element.innerText;

    hopOutsideAGhost(internalData);
    // console.log(internalData);
    console.log(await andHopUp(internalData));

    document.getElementById("updateTimeWrite").innerText = `Write took ${Date.now()-startTime} ms`;
    

};

iGotWhite();
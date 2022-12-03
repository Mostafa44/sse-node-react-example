const express= require('express');
const cors= require('cors');
const { setTimeout } = require("timers/promises");
const { response } = require('express');


const app= express();
const PORT=3002;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get('/status', (request, response)=>{
    response.json({clients: clients.length});
})

let clients=[];
let facts= [];
app.listen(PORT, ()=>{
    console.log(`Facts Events service Listening at http://localhost:${PORT}`);
})

function eventsHandler(request, response, next){
    const headers={
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control' : 'no-cache'
    };
    response.writeHead(200, headers);
    const data= `data: ${JSON.stringify(facts)}\n\n`;
    response.write(data);
    const clientId = Date.now();
    const newClient= {
        id:clientId,
        res: response
    };
    clients.push(newClient);

    response.on('close',()=>{
        console.log(`${clientId} Connection closed`);
        clients= clients.filter(client=> client.id !== clientId);
        response.end();
    });

}
app.get('/events', eventsHandler);


function sendEventsToAll(newFact){
    clients.forEach(client => 
                client.res.write(`data:${JSON.stringify(newFact)}\n\n`));
    
}

async function addFact(request, response, next){
    const newFact= request.body;
    facts.push(newFact);
    response.json(newFact);
     return sendEventsToAll(newFact);
     //response.sendStatus(200);
}
app.post('/fact', addFact);


app.get('/progress', async (req, res,)=>{

    const headers={
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control' : 'no-cache'
    };
    response.writeHead(200, headers);
    //res.flushHeaders();
    const firstPart={
        info:"First part initiated",
        source: "validation"

    };
    const firstData= `data: ${firstPart}\n\n`;
    console.log("first data is ");
    console.log(JSON.stringify(firstPart));
    res.write(firstData);
    const clientId = Date.now();
    const newClient= {
        id:clientId,
        res: response
    };
   // clients.push(newClient);
   res.on('close',()=>{
    console.log(`${clientId} Connection closed`);
    clients= clients.filter(client=> client.id !== clientId);
    res.end();
});

    console.log("at the very beginning of the endpoint handler");
    await setTimeout("5000");
    console.log("after waiting for 5 seconds");
    const secondPart={
        info:"first part completed ",
        source: "validation"

    };
    const secondData= `data: ${secondPart}\n\n`;
    res.write(secondData);
    await setTimeout("5000");
    console.log("*** after waiting for next 5 seconds");
    const thirdPart={
        info:"first part completed ",
        source: "validation"

    };
    const thirdData= `data: ${thirdPart}\n\n`;
    res.write(thirdData);
    response.end("");

});
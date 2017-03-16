// console.log("Saurabh "," Welcome to NodeJS World!");

var mongo = require('mongodb').MongoClient,
    client = require('socket.io').listen(8080).sockets;


mongo.connect('mongodb://127.0.0.1/chat' , function(err , db){
  if(err){
    console.log("Saurabh ","err in databse connection ");
    throw err;
  }
  // console.log("Saurabh ","Connected to databse");

  client.on('connection' , function(socket){
    // console.log("Someone has connected!");

    //define collection to which data is going to store
    // we have defined collection as messages
    var col = db.collection('messages');
 
    var sendStatus = function(s){
      socket.emit('status' , s);
    }

    //Emit all messeges
    col.find().limit(20).sort({_id: 1}).toArray(function(err , res){
      if(err){
        console.log("Saurabh ","Error in fetching previous messeges from databse ",err);
        throw err;
      }
      socket.emit('output' , res);
    });

    // wait for input
    socket.on('input' , function(data){
      console.log("Saurabh ","data ",data);
      var name = data.name,
          message = data.message
          whiteSpacePattern = /^\s*$/;

      if(whiteSpacePattern.test(name) || whiteSpacePattern.test(message)){
        console.log("Saurabh ","Invalid Name or Message");
        sendStatus("Name and Message both are required");
      } else {
        col.insert({'name' : name ,
                    'message' :message
                  }, function(){
                        // console.log("Saurabh ","data inserted");

                        //Emit all messeges to all users
                        client.emit('output', [data]);
                        sendStatus({
                          'message' : "Message Sent",
                          'clear' : true
                        });
        });
      }

    });
  });

});

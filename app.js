//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


var date = "Today" ;


const db = 'mongodb+srv://andreaacardio:Pass321@cluster0.ikl3us9.mongodb.net/todolistDB?retryWrites=true&w=majority';

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((res) => console.log('Connected to DB'))
  .catch((error) => console.log(error));

const itemssSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemssSchema);

const item1 = new Item({
  name:"Welcome to todoList!"
});
const item2 = new Item({
  name:"You can use the button for add tasks!"
});
const item3 = new Item({
  name:"For delete you can use this checkbox on left side!"
});

const defaultItems = [item1, item2, item3];

// Item.insertMany(defaultItems);
const listSchema = {
  name: String,
  items: [itemssSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {
  
  Item.find({})
  .then((findItems) => {
    if(findItems.length === 0){
      Item.insertMany(defaultItems)
      .then(console.log("Conected to DB"))
      .catch(err => console.log(err));
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: findItems})
    }
    
  })
  .catch(err => console.log(err));
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName})
  .then((foundList) => {
    if(!foundList){
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);

    }else {
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
    }
  })
  .catch(err => console.log(err));


});
app.post("/s", function(req, res){
  const inn = req.body.time;
  res.redirect("/"+ inn);
})


app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.deleteOne({_id: checkedItemId}).then(function(){
        console.log("Data deleted"); // Success
    }).catch(function(error){
        console.log(error); // Failure
    });
    res.redirect("/")
  }else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
    .then(() => {
      res.redirect("/" + listName);
    })
  }


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  if(itemName === 0){
    alert("window");
  } else{

    const item = new Item({
      name: itemName
    });
  
    if(listName === "Today"){
      item.save();
      res.redirect("/");
    } else {
      List.findOne({name: listName})
      .then((foundList) => {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
    }
  }
  
 
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});

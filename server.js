// importing all the modules and requirements
const express = require("express");
const fs = require("fs");
const path = require("path");
const uniqid = require("uniqid");

const PORT = process.env.PORT || 3001;
const app = express();

// Middleware for parsing JSON and urlencoded form data, and 
// middleware to serve up static assets from the public folder
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("Develop/public"));


// html routes: view routes for the homepage and the notes page.
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "Develop/public/index.html"))
);

app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "Develop/public/notes.html"))
);



//This API route is a GET Route for retrieving the notes
//getting the "notes" in json by reading and parsing them then reading new notes and adding them to the json file.  
app.get("/api/notes", function (req, res) {
  fs.readFile("Develop/db/db.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
  } else {
    var jsonData = JSON.parse(data);
    res.json(jsonData);
  }
  });
});

const readAndAppend = (content, file) => {
  fs.readFile(file, "utf8", (err, data) => {
      if (err) {
          console.error(err);
      } else {
          const parsedData = JSON.parse(data);
          parsedData.push(content);
          writeNew(file, parsedData);
      }
  });
};

const writeNew = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );

  // This API route is a POST Route for a new Note. 
  // When a new note is written the post route saves it to the json file and displays the new note. 
  app.post("/api/notes", (req, res) => {
    const { title, text } = req.body;
    if (title && text) {
      const newNote = {
        title: title,
        text: text,
        id: uniqid(),
      };

    readAndAppend(newNote, "Develop/db/db.json");
    const response = {
      status: "success",
      body: newNote,
    };
    res.json(response);
  } else {
    res.json("Error");
  }
});


//delete post route removes a note from the json file based on its id 
app.delete("/api/notes/:id", (req, res) => {
  let id = req.params.id;
  let selectedData;
  fs.readFile("Develop/db/db.json", "utf8", (err, data) => {
      if (err) {
          console.error(err);
      } else {
          selectedData = JSON.parse(data);
          const filterData = selectedData.filter((note) => note.id !== id);
          writeNew("Develop/db/db.json", filterData);
      }
  });
  res.send(`The following were deleted ${req.params.id}`);
});



app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);
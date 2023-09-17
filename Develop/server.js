const express = require('express');
const path = require('path');
const fs = require('fs');
const uniqid = require('uniqid');


const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.json());
app.use(express.static('Develop/public'));
app.use(express.urlencoded({ extended: true }));

// html routes
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

// api routes
app.get('/api/notes', function (req, res) {
    fs.readFile('Develop/db/db.json', "utf8", (err, data) => {
      var jsonData = JSON.parse(data);
      res.json(jsonData);
    });
  });

  const addNote = (content, file) => {
    fs.readFile(file, "utf8", (err, data) => {
      if (err) {
        console.error(err);
      } else {
        const parsedData = JSON.parse(data);
        parsedData.push(content);
        addNew(file, parsedData);
      }
    });
  };
  
  const addNew = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );

  app.post('/api/notes', (req, res) => {
    const { title, text } = req.body;
    if (title && text) {
      const newNote = {
        title: title,
        text: text,
        id: uniqid(),
      };
  
      addNote(newNote, 'Develop/db/db.json');
  
      const response = {
        status: "success",
        body: newNote,
      };
  
      res.json(response);
    } else {
      res.json("An error occured when posting");
    }
  });

//   delete post 
app.delete('/api/notes/:id', (req, res) => {
    let id = req.params.id;
    let parsedData;
    fs.readFile('Develop/db/db.json', "utf8", (err, data) => {
      if (err) {
        console.error(err);
      } else {
        parsedData = JSON.parse(data);
        const filterData = parsedData.filter((note) => note.id !== id);
        addNew('Develop/db/db.json', filterData);
      }
    });
    res.send(`The following were deleted, Note- ${req.params.id}`);
  });


  app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);
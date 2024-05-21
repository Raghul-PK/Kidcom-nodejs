import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

import {updatePage, compareSpeechToStory, getMeaning, wordCollector, retrieveDB, createStorySpeechMatch} from './serverHelper.js';

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static('public'));

app.get('/', async function(req, res, next) {
  res.redirect('/story');
});

app.get('/home', async function(req, res, next) {
  res.sendFile(path.join(__dirname, './public/home.html'));
});

app.get('/story', async function(req, res, next) {
  await retrieveDB("thehonestwoodcutters");
  createStorySpeechMatch();
  res.sendFile(path.join(__dirname, './public/story.html'));
});

app.get('/storyStats', async function(req, res, next) {
  res.sendFile(path.join(__dirname, './public/storyStats.html'));
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
      });

    socket.on("nav_button", (msg) => {
        console.log("server.js --> " + msg);
        let [story_line, img_path] = updatePage(msg);
        console.log("story_line : ", story_line);
        if (story_line===-1)
        {
          console.log("socket closed");
          io.close();
        }

        io.emit("html_story_text", story_line);
        io.emit("story_img", img_path);
    });

    socket.on("speech_interim", (msg) => {
        console.log("server.js --> " + msg);
        let [html_story_line, img_path, correctness_percent] = compareSpeechToStory(msg);
        io.emit("html_story_text", html_story_line);
        io.emit("story_img", img_path);
    });

    socket.on("speech_final", (msg) => {
        console.log("server.js --> " + msg);
        let [html_story_line, img_path, correctness_percent] = compareSpeechToStory(msg);
        if (correctness_percent>50)
        {
          let [story_line, img_path] = updatePage("next");
          console.log("story_line : ", story_line);
          if (story_line===-1)
          {
            console.log("socket closed");
            io.close();
          }
        
          io.emit("html_story_text", story_line);
          io.emit("story_img", img_path);
        } 
    });

    socket.on("click_words", async (msg) => {
        console.log("server.js --> " + msg);
        let meaning = await getMeaning(msg);
        io.emit("story_word_meaning", meaning);
    });

    socket.on("collected_word", (msg) => {
        wordCollector(msg);
    });

});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log('server running at http://localhost:3000');
});
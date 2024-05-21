const socket = io();

// Get the elements by their ID
var popupWindow = document.getElementById("popup-window");
var popupWord = $("#popup-word");
var popupMeaning = $("#popup-meaning");
var closeButton = document.getElementById("close-button");
var collectButton = document.getElementById("collect-button");

let clicked_word;
const synth = window.speechSynthesis; // from Web-speech API

// Listen for messages from server
socket.on("html_story_text", (msg) => {
    console.log("story.js --> " + msg);
    $("#story-text").html(msg); // Update story-line
});
socket.on("story_img", (msg) => {
    console.log("story.js --> " + msg);
    $("#story-img").attr("src", msg); // Update image
});
socket.on("story_word_meaning", (msg) => {
    console.log("story.js --> " + msg);
    event.preventDefault();
    popupWindow.style.display = "block";
    $("#collect-button").text("Collect");
    $("#popup-word").text(clicked_word);
    $("#popup-meaning").text(msg);
});

// Navigation --> Previous and Next pages
$(".nav-button.prev").on("click", function(){
    socket.emit('nav_button', "prev");
    const audioElement = new Audio("./SFX/single_press.mp3");
    audioElement.play();
});

$(".nav-button.next").on("click", function(){
    socket.emit('nav_button', "next");
    const audioElement = new Audio("./SFX/single_press.mp3");
    audioElement.play();
});

// Send the clicked word to backend to retrieve meaning
$("#story-text").on("click", "span", function(){
    clicked_word = $(this).text();
    console.log(clicked_word);
    $(this).addClass("red-text");
    const audioElement = new Audio("./SFX/popup1.mp3");
    audioElement.play();

    socket.emit('click_words', clicked_word);
});

collectButton.addEventListener("click", function() {
    $("#collect-button").text("Collected");
    let word = $("#popup-word").text();

    socket.emit('collected_word', word);
  });

// Hide the pop-up window when the close button is clicked
closeButton.addEventListener("click", function() {
  popupWindow.style.display = "none";
});

const custom_cursor = document.querySelector('#invertedcursor');

document.addEventListener('mousemove', function(e) {
    const {clientWidth, clientHeight} = custom_cursor;
    custom_cursor.style.left = ((e.pageX - (clientWidth / 2)) + 'px');
    custom_cursor.style.top = (e.pageY - (clientHeight / 2)) + 'px';

    // When cursor hovered over words in story line
    $("#story-text").on("mouseover", "span", function(){
        hovered_word = $(this).text();
        console.log(hovered_word);
        speak(hovered_word);
        $(this).addClass("increase-word-font-size");

        setTimeout(() => {
            $(this).removeClass("increase-word-font-size");
        }, 1000);
    });
});

function speak(word)
{
    event.preventDefault();
    if (synth.speaking) {
        console.log("speechSynthesis.speaking");
        return;
    }

    const utterThis = new SpeechSynthesisUtterance(word);
    utterThis.voice = synth.getVoices()[0];
    utterThis.pitch = 1;
    utterThis.rate = 1;
    synth.speak(utterThis);
}
import fetch from 'node-fetch';
import mongoose from 'mongoose';

let page = 0;

let story_lines = [];
let story_img_urls = [];

// Array of arrays to keep track of correctly spoken words
let story_speech_match = [];

let collected_words = [];

export function createStorySpeechMatch()
{
  for (var i=0; i<story_lines.length; i++)
  {
    let storyLine = story_lines[i];
    let storyLine1 = storyLine.replace(/[^a-zA-Z ]/g, "");
    let storyLine2 = storyLine1.trim();
    let storyLine3 = storyLine2.toLowerCase();

    let storyArr3 = storyLine3.split(" ");

    let inside_arr = Array(storyArr3.length).fill(0);
    story_speech_match.push(inside_arr);
  }
  return true;
}

export function compareSpeechToStory(speechLine)
{
  let storyLine = story_lines[page];
  let storyLine1 = storyLine.replace(/[^a-zA-Z ]/g, "");
  let storyLine2 = storyLine1.trim();
  let storyLine3 = storyLine2.toLowerCase();

  let speechLine1 = speechLine.replace(/[^a-zA-Z ]/g, "");
  let speechLine2 = speechLine1.trim();
  let speechLine3 = speechLine2.toLowerCase();

  let speechArr3 = speechLine3.split(" ");
  let storyArr = storyLine.split(" ");
  let storyArr3 = storyLine3.split(" ");

  let modified_html_text = "";
  let correct_word_count = 0, correctness_percent = 0;

  for (var i=0; i<storyArr3.length; i++)
  {
    if (speechArr3.includes(storyArr3[i]))
    {
      story_speech_match[page][i] = 1;
      correct_word_count++;
    }

    let str_word_id = "word_id='" + i + "'";
    if (story_speech_match[page][i]===1)
      modified_html_text += "<span " + str_word_id + " class='correct-word'>" + storyArr[i] + "</span> ";
    else
      modified_html_text += "<span " + str_word_id + ">" + storyArr[i] + "</span> ";
  }
  correctness_percent = (correct_word_count/storyArr3.length)*100;

  let word_counter = speechArr3.length;
  let img_no = word_counter % story_img_urls[page].length;

  let modified_img_path = "https://storage.googleapis.com/kidcom-web.appspot.com/The_Honest_Woodcutter/Images/" + story_img_urls[page][img_no];
  console.log(modified_img_path);
  
  return [modified_html_text, modified_img_path, correctness_percent];

}

export function updatePage(button)
{
  if (button==="prev")
    page--;
  else if (button==="next")
    page++;

  if (page >= story_lines.length)
    return [-1, -1];

  let storyLine = story_lines[page];
  let storyArr = storyLine.split(" ");
  let modified_html_text = "";
  for (var i=0; i<storyArr.length; i++)
  {
    let str_word_id = "word_id='" + i + "'";
    modified_html_text += "<span " + str_word_id + ">" + storyArr[i] + "</span> ";
  }

  let page_story_line = modified_html_text;
  let page_img_path = "https://storage.googleapis.com/kidcom-web.appspot.com/The_Honest_Woodcutter/Images/" + story_img_urls[page][0];

  return [page_story_line, page_img_path];
}

export async function getMeaning(word)
{
  let word1 = word.replace(/[^a-zA-Z ]/g, "");
  let word2 = word1.trim();
  let word3 = word2.toLowerCase();

  // retrieve the meaning of the word using api call
  let url = "https://api.dictionaryapi.dev/api/v2/entries/en/" + word3;
  let meaning="Sorry, no meaning fetched!!!";
  try {
    const response = await fetch(url, {method: "GET"});
    const json = await response.json();
    meaning = json[0].meanings[0].definitions[0].definition;
  } catch (error) {
    console.log(error);
  }

  console.log(meaning);
  return meaning;
}

export function wordCollector(word)
{
  collected_words.push(word);
  console.log(collected_words);
}

export function getCollectedWords(word)
{
  return collected_words;
}

export async function retrieveDB(collectionsName)
{
    await mongoose.connect("mongodb+srv://pkraghul2001:123raghulpk@kidcom.yzvdnuj.mongodb.net/storyDB");

    const storySchema = new mongoose.Schema({
        page: Number,
        story_text: String,
        story_img_url: [String]
    });

    const Story = mongoose.model(collectionsName, storySchema);

    let mystory = await Story.find({}).sort( { page: 1 } )
    console.log(mystory);

    for (let i=0; i<mystory.length; i++)
    {
        story_lines.push(mystory[i].story_text);
        story_img_urls.push(mystory[i].story_img_url);
    }

    mongoose.connection.close()

    console.log(story_lines, story_img_urls);

    return true;
}
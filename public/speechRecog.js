var recognizing = false;

if ("webkitSpeechRecognition" in window) 
{
  let speechRecognition = new webkitSpeechRecognition();
  let final_transcript = "";

  speechRecognition.continuous = true;
  speechRecognition.interimResults = true; // Gives in b/w results

  speechRecognition.onstart = () => {
    console.log("Speech Recognition Started");
    recognizing = true;
  };
  speechRecognition.onerror = (event) => {
    console.log("Speech Recognition Error");
    console.log(event);
    recognizing = false;
  };
  speechRecognition.onend = () => {
    console.log("Speech Recognition Ended");
    recognizing = false;
    console.log("Restarting again...");
    startSpeechRecog();
    recognizing = true;
  };

  speechRecognition.onresult = (event) => {
    let interim_transcript = "";
    let final_transcript = "";

    let final_flag = 0;
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
        final_flag = 1; 
      } else {
        interim_transcript += event.results[i][0].transcript;
      }    
      console.log("Final : " + final_transcript);
    }

    if (final_transcript!="")
    {
      socket.emit("speech_final", final_transcript);
    }
    else
    {
      interim_transcript = interim_transcript.trim();
      socket.emit("speech_interim", interim_transcript);
    }
    
  };

  $( window ).on( "load", function() {
    startSpeechRecog();
  });

  // Define the startSpeechRecog function
  function startSpeechRecog(){
    if (!recognizing)
      speechRecognition.start();
  }
  
} 
else 
{
  console.log("Speech Recognition Not Available");
}

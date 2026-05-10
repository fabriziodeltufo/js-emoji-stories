// javascript;

// console.log("log");
// console.warn("warning");
// console.error("errore");

// prendo gli elementi della sezione start : nome prot + emoji + bottone genera
const mainSection = document.querySelector("main");
const heroInput = document.querySelector("input");
const emojiElements = document.querySelectorAll(".emoji");
const heroButton = document.querySelector("#generate");
const emojiSelection = [];

// prendo gli elementi della sezione end : story
const storyTitle = document.querySelector("story-title");
const storyDesc = document.querySelector("story-desc");
const homeBtn = document.querySelector("#home");
const nextStoryBtn = document.querySelector("#next-story");

// parametri chat GPT
const endpoint = "https://api.openai.com/v1/chat/completions";
const API_KEY = "";

// Funzione che colora le emoji selezionate
function colorSelectedEmojis() {
  for (const element of emojiElements) {
    // Recupero l'emoji di ogni elemento
    const emoji = element.innerText;

    // Se l'emoji è nella lista delle selezionate...
    if (emojiSelection.includes(emoji)) {
      // Aggiungi la classe selected
      element.classList.add("selected");
    } else {
      // Rimuovi (se c'è la clase selected)
      element.classList.remove("selected");
    }
  }
}

//   salvo gli emoji cliccati
for (const element of emojiElements) {
  element.addEventListener("click", function () {
    const emojiClicked = element.innerText;

    // se emoji cliccato esiste gia notifica errore
    if (emojiSelection.includes(emojiClicked)) {
      //   console.warn(`${emojiClicked} gia presente`);
      alert(`${emojiClicked} gia presente`);

      return;
    }

    // inserisci in array emoji cliccato
    emojiSelection.push(emojiClicked);

    // se array contiene piu di 3 , elimina il primo x avere sempre 3 emoji
    if (emojiSelection.length > 3) {
      alert("raggiunto limite 3 emoji da cliccare, elimino il primo");
      emojiSelection.shift();
    }

    // Colora gli elementi le cui emoji sono in lista
    colorSelectedEmojis();

    console.log(emojiSelection);
  });
}

// bottone genera: salva scelte utente + crea prompt //
heroButton.addEventListener("click", function () {
  // salviamo nome protagonista
  const heroName = heroInput.value;

  if (emojiSelection.length < 3 || heroName.length < 2) {
    alert("Devi inserire 3 emoji e il nome protagonista");
    return;
  }

  console.log(heroName);
  console.log(emojiSelection);

  // preparo il prompt x chatGPT

  const prompt = {
    role: "user",
    content: `creami una storia con un eroe che si chiama : ${heroName} che lotta contro 3 mostri in questo elenco : ${emojiSelection}
    La storia deve essere breve e avere un titolo, anche questo molto breve. Le tue risposte sono solo in formato JSON come questo esempio:

    {
      "title": "Incontro intergalattico",
      "text": "Durante un'esplorazione notturna, Alberto Angela s'imbatte in un'astronave aliena atterrata a Roma. Gli extraterrestri cercano aiuto contro un'orda di gatti robotici. Angela li aiuta e in cambio gli alieni gli regalano un'astronave.",
    }

    Assicurati che le chiavi del JSON siano "title" e "text", con virgolette.`,
  };

  askChatGPT(prompt);
});

async function askChatGPT(prompt) {
  // verifico il prompt se completo
  console.log(prompt);

  // dichiaro un array messages
  const messages = [];

  //   ci carico il prompt
  messages.push(prompt);

  //   passo alla schermata loading...
  mainSection.className = "work";

  //   preparo la reale call x chatGPT

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      messages: messages,
    }),
  });

  // response torna in JSON, va convertita estrendo i soli dati che interessano messi in un array
  const data = await response.json();
  console.log(data);

  //   recuperiamo la storia
  const story = JSON.parse(data.choices[0].message.content);
  console.log(story);

  // Mettiamo la storia nella lista dei messaggi con lo stesso formato del prompt ma role : assistant (cosi abbiamo tutti e due i messaggi, di partenza e arrivo)
  messages.push({
    role: "assistant",
    content: JSON.stringify(story),
  });

  // Inseriamo la storia all'interno della pagina
  storyTitle.innerText = story.title;
  storyDesc.innerText = story.text;

  // Mostra la sezione end dopo aver caricato titolo e desc della storia
  mainSection.className = "end";
}

// click bottone home
homeBtn.addEventListener("click", function () {
  // Ricarica la pagina
  window.location.reload();
});

// click bottone avanti
nextStoryBtn.addEventListener("click", function () {
  // Prepariamo un nuovo prompt
  const prompt = {
    role: "user",
    content:
      'Continua la storia da qui. Scrivi un breve paragrafo che prosegua la storia precedente. Le tue risposte sono solo in formato JSON con lo stesso formato delle tue risposte precedenti. Mantieni lo stesso valore per "title". Cambia solo il valore di "text"',
  };

  // richiama di nuovo chatGPT per creare il seguito della storia
  askChatGPT(prompt);
});

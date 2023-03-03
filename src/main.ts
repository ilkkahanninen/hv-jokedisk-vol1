const rand = <T>(...ts: T[]): T => ts[Math.floor(ts.length * Math.random())];

const humor = () =>
  rand("H", "Hj") +
  rand("u", "uu", "üü", "yy", "ue") +
  rand("m", "mm") +
  rand("o", "ö", "öö", "oe", "oeoe") +
  rand("r", "re");

const bandName = () =>
  humor() +
  rand(" v", " V", " w") +
  rand("ei", "ee") +
  rand("k", "c", "cc") +
  rand("o", "oe") +
  "t";

const releaseName = () =>
  rand(
    "Joke",
    "Tsoukki",
    "Huumori",
    "Vitsi",
    "Nauru",
    "VitsiHuumori",
    "Läppä",
    "Komedia",
    humor()
  ) +
  rand(" ", "") +
  rand("Disk", "Disc", "Levyke", "Levy", "Kokoelma") +
  " " +
  rand("vol.", "pt.") +
  " 1";

const fullName = () => bandName() + " – " + releaseName();

const toHex = (n: number) => n.toString(16).padStart(2, "0");
const randomColor = () => Math.floor(Math.random() * 255);

const laughterAudios = [
  new URL("naurut/nauru1.mp3", import.meta.url),
  new URL("naurut/nauru2.mp3", import.meta.url),
  new URL("naurut/nauru3.mp3", import.meta.url),
  new URL("naurut/nauru4.mp3", import.meta.url),
  new URL("naurut/nauru5.mp3", import.meta.url),
  new URL("naurut/nauru6.mp3", import.meta.url),
  new URL("naurut/nauru7.mp3", import.meta.url),
  // new URL("naurut/nauru8.mp3", import.meta.url),
  new URL("naurut/nauru9.mp3", import.meta.url),
  new URL("naurut/nauru10.mp3", import.meta.url),
].map(
  (url) =>
    new Promise<HTMLAudioElement>((resolve, reject) => {
      const audio = new Audio();
      audio.src = url.href;
      audio.oncanplay = () => resolve(audio);
      audio.onerror = reject;
    })
);

const appendJoke = (name: string, url: URL, onEnd: () => void) => {
  const audio = new Audio();
  audio.src = url.href;

  const item = document.createElement("li");
  item.textContent = name;
  // audio.controls = true;
  // item.appendChild(audio);
  const play = document.createElement("span");
  play.className = "play";
  item.appendChild(play);
  play.onclick = () => {
    if (audio.paused) {
      play.className = "play playing";
      audio.play();
    } else {
      play.className = "play";
      audio.pause();
      audio.currentTime = 0;
    }
  };
  document.querySelector("#joket")?.append(item);

  audio.onended = () => {
    onEnd();
    play.className = "play";
  };
};

const randomizeNames = () => {
  document.querySelector("h1")!.textContent = fullName();
  document.title = fullName();
};

randomizeNames();

const socket = new WebSocket("ws://valot.instanssi:9910");
socket.onclose = () => {
  console.log("Voi jummijammi, ei ole valoja");
};
socket.onerror = (err) => {
  console.log("Valohommat meni vihkoon:", err);
};

const nick = [0, ..."Huumor!".split("").map((c) => c.charCodeAt(0)), 0];

const setColor = (red: number, green: number, blue: number) => {
  document.body.style.background =
    "#" + toHex(red) + toHex(green) + toHex(blue);

  if (socket.readyState === socket.OPEN) {
    const lightCmd = (lightIndex: number) => [lightIndex, 0, red, green, blue];

    const lightCmds = new Array(28).fill(0).flatMap((_, i) => lightCmd(i));

    const data = new Uint8Array([
      1, // Speksin versio
      ...nick,
      1, // Tehosteen tyyppi, valo
      ...lightCmds,
    ]);
  }
};

Promise.all(laughterAudios).then((laughters) => {
  const laugh = () => {
    console.log("naur naur");
    const laughter = rand(...laughters);
    laughter.play();

    const gif = document.querySelector<HTMLImageElement>(".naur")!;
    gif.style.display = "block";
    const vaelk = () => {
      setColor(randomColor(), randomColor(), randomColor());
      if (!laughter.ended) {
        setTimeout(vaelk, 100);
      } else {
        setColor(0x44, 0x22, 0);
        gif.style.display = "none";
        randomizeNames();
      }
    };
    vaelk();
  };

  appendJoke(
    "Epäonnistunut vitsi",
    new URL("./vitsit/bloober1.mp3", import.meta.url),
    laugh
  );

  // window.onclick = laugh;
});

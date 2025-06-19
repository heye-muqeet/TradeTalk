import axios from "axios";
import RNFS from "react-native-fs";
import Sound from "react-native-sound";

const GOOGLE_TTS_API_KEY = "AIzaSyBtRcA8BI5LvvgzV1jrQpsxrwXe7gbJ-lM";

export const speak = async (text: string, language: "en-US" | "es-ES"): Promise<void> => {
  console.log("Speaking:", text);
  const voiceConfig = language === "es-ES" ? { languageCode: "es-ES", name: "en-US-Wavenet-F" } : { languageCode: "en-US", name: "en-US-Wavenet-F" };
  return new Promise((resolve, reject) => {
    axios
      .post(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`,
        {
          input: { text: text },
          voice: voiceConfig,
          audioConfig: { audioEncoding: "MP3" },
        }
      )
      .then(async (response) => {
        const audioContent = response.data.audioContent;
        const filePath = `${RNFS.DocumentDirectoryPath}/speech.mp3`;
        await RNFS.writeFile(filePath, audioContent, "base64");
        const sound = new Sound(filePath, "", (error) => {
          if (error) reject(error);
          sound.play((success) => {
            sound.release();
            resolve();
          });
        });
      })
      .catch(reject);
  });
};
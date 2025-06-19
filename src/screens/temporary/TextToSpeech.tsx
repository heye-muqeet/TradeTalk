import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import axios from 'axios';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs'; // Import react-native-fs

// Initialize the Sound library (required for iOS)
Sound.setCategory('Playback');

const TextToSpeech = () => {
  const [sound, setSound] = useState(null);

  // Function to handle text-to-speech API call
  const handleTextToSpeech = async () => {
    const apiKey = 'YOUR_API_KEY'; // Replace with your API Key
    const text = 'How can I assist you today? Hello, how are you? Hope you are doing well!';
    
    try {
      const response = await axios.post(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
        {
          input: { text: text },
          voice: { languageCode: 'en-US', name: 'en-US-Wavenet-D' },
          audioConfig: { audioEncoding: 'MP3' },
        }
      );

      // Extract base64 audio content from the response
      const audioContent = response.data.audioContent;

      // Convert base64 to a temporary file path
      const filePath = `${RNFS.DocumentDirectoryPath}/speech.mp3`;

      // Write the base64 content to a file
      await RNFS.writeFile(filePath, audioContent, 'base64');

      // Create a new Sound object and load the file
      const newSound = new Sound(filePath, '', (error) => {
        if (error) {
          console.error('Error loading sound:', error);
          Alert.alert('Error', 'Failed to load the audio');
          return;
        }

        // Play the sound
        newSound.play((success) => {
          if (success) {
            console.log('Successfully finished playing');
          } else {
            console.log('Playback failed');
          }
        });
      });

      // Set the sound state
      setSound(newSound);
    } catch (error) {
      console.error('Error converting text to speech:', error);
      Alert.alert('Error', 'Failed to convert text to speech');
    }
  };

  return (
    <View>
      <Text>Google Cloud Text-to-Speech Example</Text>
      <Button title="Convert to Speech" onPress={handleTextToSpeech} />
    </View>
  );
};

export default TextToSpeech;

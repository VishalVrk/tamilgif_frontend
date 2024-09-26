import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, listAll,deleteObject } from 'firebase/storage';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const firebaseConfig = {
  apiKey: "AIzaSyBcqkntjTMpiGkh4lGt_3B-AnVvW4cst5c",
  authDomain: "tamiltextspeech.firebaseapp.com",
  projectId: "tamiltextspeech",
  storageBucket: "tamiltextspeech.appspot.com",
  messagingSenderId: "252918820128",
  appId: "1:252918820128:web:74ba26cdd3f4e029823b45",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcription, setTranscription] = useState('');
  // const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [recordings, setRecordings] = useState([]);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      processorRef.current.onaudioprocess = (e) => {
        const channelData = e.inputBuffer.getChannelData(0);
        audioChunksRef.current.push(new Float32Array(channelData));
      };

      setIsRecording(true);
      setTranscription('');
      setAudioURL('');
      setAudioBlob(null);
    } catch (err) {
      console.error('Error starting recording:', err);
      alert('Failed to start recording. Please check your microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (isRecording) {
      processorRef.current.disconnect();
      audioContextRef.current.close();
      setIsRecording(false);

      const blob = exportWAV(audioChunksRef.current);
      const url = URL.createObjectURL(blob);
      setAudioURL(url);
      setAudioBlob(blob);
      audioChunksRef.current = [];
    }
  };

  const analyzeAudio = async (url) => {
    if (!url && !audioBlob) {
      alert('Please record audio or select a recording to analyze.');
      return;
    }
    try {
      setLoading(true);
      const downloadURL = url
      const response = await axios.post('https://speechtotextapi.onrender.com/speech-to-text', { url: downloadURL });
      // console.log(response)
      setTranscription(response.data.transcription[0]);
    } catch (error) {
      console.error('Error during upload or transcription:', error);
      setTranscription('Error during transcription. Please try again.');
    }finally{
      setLoading(false);
    }
  };

  // Function to upload audio to Firebase
  const uploadToFirebase = async () => {
    if (!audioBlob) {
      toast.error('No audio recorded to upload.');
      return;
    }

    try {
      const storageRef = ref(storage, `recordings/${Date.now()}.wav`);
      await uploadBytes(storageRef, audioBlob);
      const downloadURL = await getDownloadURL(storageRef);
      console.log('Audio uploaded successfully:', downloadURL);
      toast.success('Audio uploaded successfully!');
    } catch (error) {
      console.error('Error uploading audio:', error);
      toast.error('Error uploading audio. Please try again.');
    }
  };
  



  const exportWAV = (audioChunks) => {
    const sampleRate = audioContextRef.current.sampleRate;
    const numChannels = 1; // Mono audio
    const bitDepth = 16;

    let totalLength = 0;
    for (const chunk of audioChunks) {
      totalLength += chunk.length;
    }

    const buffer = new ArrayBuffer(44 + totalLength * 2);
    const view = new DataView(buffer);

    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + totalLength * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
    view.setUint16(32, numChannels * (bitDepth / 8), true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, totalLength * 2, true);

    // Write audio data
    let offset = 44;
    for (const chunk of audioChunks) {
      for (let i = 0; i < chunk.length; i++) {
        const sample = Math.max(-1, Math.min(1, chunk[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return new Blob([buffer], { type: 'audio/wav' });
  };

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // Function to fetch recordings from Firebase Storage
  const fetchRecordings = async () => {
    const storageRef = ref(storage, 'recordings/');
    const listResult = await listAll(storageRef);
    const urls = await Promise.all(
      listResult.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return { url, id: itemRef.fullPath };
      })
    );
    setRecordings(urls);
  };

  const removeRecording = async (recordingUrl) => {
    const storageRef = ref(storage, recordingUrl);
    try {
      await deleteObject(storageRef);
      console.log('Recording deleted successfully');
      toast.success('Recording deleted successfully');
      fetchRecordings();
    } catch (error) {
      console.error('Error removing recording:', error);
      toast.error('Error removing recording');
    }
  };
  

  useEffect(() => {
    fetchRecordings();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
       <ToastContainer autoClose={3000} />
      <h1 className="text-3xl font-bold text-gray-800 mb-6">ENHANCING COMMUNICATION FOR HEARING IMAPAIRED</h1>
      <div className="mb-6">
        {isRecording ? (
          <button
            onClick={stopRecording}
            className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-red-600 transition duration-200"
          >
            Stop Recording
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-green-600 transition duration-200"
          >
            Start Recording
          </button>
        )}
      </div>
      {audioURL && (
        <div className="w-full max-w-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Recorded Audio:</h3>
          <audio src={audioURL} controls className="w-full mb-2" />
          <button
            onClick={uploadToFirebase}
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-blue-600 transition duration-200"
          >
            Upload Audio
          </button>
        </div>
      )}
        {loading && ( // Display loader while loading
        <div className="mt-4">
          <div className="loader">Loading...</div>
          {/* You can replace the above with a spinner or any other loading indicator */}
        </div>
      )}
      {transcription && (
        <div className="mt-6 w-full max-w-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Transcription:</h3>
          <p className="bg-white p-4 rounded-lg shadow-md">{transcription}</p>
        </div>
      )}
      <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Previous Recordings:</h2>
      <div className="w-full max-w-md">
        {recordings.map((recording) => (
          <div key={recording.id} className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow-md">
            <audio src={recording.url} controls className="mr-4" />
            <div className="flex space-x-2">
            <button
  onClick={() => removeRecording(recording.url)}
  className="bg-red-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-red-600 transition duration-200"
>
  Remove
</button>

              <button
                onClick={() => {
                  // Trigger analysis for this specific recording
                  // You might need to adjust this according to your API structure
                  analyzeAudio(recording.url);
                }}
                className="bg-blue-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-blue-600 transition duration-200"
              >
                Analyze
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AudioRecorder;
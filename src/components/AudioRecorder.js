import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TamilVisualOutput from './TamilVisualOutput';
import { 
  Mic, Square, Upload, Trash2, PlayCircle, 
  Brain, AudioWaveform, Loader2, Volume2
} from 'lucide-react';

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
      setIsAnalyzing(true)
      const downloadURL = url
      const response = await axios.post('https://speechtotextapi-1.onrender.com/speech-to-text', { url: downloadURL });
      // console.log(response)
      setTranscription(response.data.transcription[0]);
    } catch (error) {
      console.error('Error during upload or transcription:', error);
      setTranscription('Error during transcription. Please try again.');
    }finally{
      setLoading(false);
      setIsAnalyzing(false)
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <ToastContainer autoClose={3000} />
      
      {/* Header Section */}
      <div className="bg-white shadow-md py-6 mb-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Enhancing Communication for Hearing Impaired
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Recording Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              {isRecording ? (
                <div className="animate-pulse">
                  <AudioWaveform className="w-16 h-16 text-red-500" />
                </div>
              ) : (
                <Mic className="w-16 h-16 text-gray-400" />
              )}
            </div>
            
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 bg-red-500 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:bg-red-600 transition duration-300 transform hover:scale-105"
              >
                <Square className="w-5 h-5" />
                Stop Recording
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="flex items-center gap-2 bg-blue-500 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:bg-blue-600 transition duration-300 transform hover:scale-105"
              >
                <Mic className="w-5 h-5" />
                Start Recording
              </button>
            )}
          </div>

          {/* Current Recording Playback */}
          {audioURL && (
            <div className="mt-8 p-6 bg-gray-50 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Current Recording
              </h3>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <audio src={audioURL} controls className="w-full md:w-2/3 rounded-lg" />
                <button
                  onClick={uploadToFirebase}
                  className="flex items-center gap-2 bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
                >
                  <Upload className="w-5 h-5" />
                  Save Recording
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center my-8">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          </div>
        )}

        {/* Transcription Results */}
        {transcription && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="space-y-6">
              <div className="p-6 bg-gray-50 rounded-xl">
                <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Text Transcription
                </h3>
                <p className="text-lg text-gray-800 leading-relaxed">{transcription}</p>
              </div>
              <TamilVisualOutput text={transcription} />
            </div>
          </div>
        )}

        {/* Previous Recordings */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <PlayCircle className="w-6 h-6" />
            Previous Recordings
          </h2>
          
          <div className="space-y-4">
            {recordings.map((recording) => (
              <div key={recording.id} 
                   className="flex flex-col md:flex-row items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition duration-300">
                <div className="w-full md:w-2/3">
                  <audio src={recording.url} controls className="w-full rounded-lg" />
                </div>
                <div className="flex gap-2 w-full md:w-auto justify-center">
                  <button
                    onClick={() => removeRecording(recording.url)}
                    className="flex items-center gap-2 bg-red-100 text-red-600 font-semibold py-2 px-4 rounded-lg hover:bg-red-200 transition duration-300"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                  <button
                    onClick={() => analyzeAudio(recording.url)}
                    className="flex items-center gap-2 bg-blue-100 text-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-blue-200 transition duration-300"
                    disabled={isAnalyzing}
                  >
                    <Brain className="w-4 h-4" />
                    {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioRecorder;
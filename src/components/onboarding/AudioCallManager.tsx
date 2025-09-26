import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, PhoneCall, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const AudioCallManager: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [log, setLog] = useState<{ sender: string; message: string; timestamp: Date }[]>([]);
  const websocket = useRef<WebSocket | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const processor = useRef<ScriptProcessorNode | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const audioQueue = useRef<ArrayBuffer[]>([]);
  const isPlaying = useRef(false);
  const currentSource = useRef<AudioBufferSourceNode | null>(null);

  const SEND_SAMPLE_RATE = 16000;
  const PLAYBACK_SAMPLE_RATE = 24000;
  const WS_URL = 'wss://sanskara-ai-onboarding.lovableproject.com/vendor/onboard';

  const logMessage = (sender: string, message: string) => {
    setLog(prev => [...prev, { sender, message, timestamp: new Date() }].slice(-10)); // Keep last 10 messages
  };

  const startCall = async () => {
    setIsConnecting(true);
    setConnectionStatus('connecting');
    logMessage('System', 'Initializing audio call...');
    
    try {
      // Request microphone permission
      mediaStream.current = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: SEND_SAMPLE_RATE
        } 
      });
      
      // Initialize audio context
      if (!audioContext.current || audioContext.current.state === 'closed') {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContext.current.state === 'suspended') {
        await audioContext.current.resume();
      }

      // Connect to WebSocket
      websocket.current = new WebSocket(WS_URL);

      websocket.current.onopen = () => {
        setConnectionStatus('connected');
        setIsConnected(true);
        setIsConnecting(false);
        logMessage('System', 'Connected! AI assistant is ready to help with your profile.');
        
        const source = audioContext.current!.createMediaStreamSource(mediaStream.current!);
        processor.current = audioContext.current!.createScriptProcessor(4096, 1, 1);

        source.connect(processor.current);
        processor.current.connect(audioContext.current!.destination);

        processor.current.onaudioprocess = (e) => {
          if (websocket.current?.readyState !== WebSocket.OPEN || isMuted) return;
          const inputData = e.inputBuffer.getChannelData(0);
          const downsampled = downsampleBuffer(inputData, audioContext.current!.sampleRate, SEND_SAMPLE_RATE);
          const pcm16 = toPcm16(downsampled);
          const base64 = btoa(String.fromCharCode.apply(null, Array.from(pcm16)));
          websocket.current.send(JSON.stringify({ type: 'audio', data: base64 }));
        };
      };

      websocket.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'audio' && message.data && isSpeakerOn) {
          const audioData = _base64ToArrayBuffer(message.data);
          audioQueue.current.push(audioData);
          if (!isPlaying.current) {
            playNextInQueue();
          }
        } else if (message.type === 'text') {
          logMessage('AI Assistant', message.data);
        } else if (message.type === 'interrupted') {
          interruptPlayback();
        } else if (message.type === 'profile_updated') {
          logMessage('System', 'Profile information updated successfully!');
        }
      };

      websocket.current.onclose = () => {
        logMessage('System', 'Call ended.');
        stopCall();
      };

      websocket.current.onerror = (error) => {
        console.error('WebSocket Error:', error);
        logMessage('System', 'Connection error occurred. Please try again.');
        setConnectionStatus('error');
        stopCall();
      };

    } catch (err) {
      console.error('Error starting call:', err);
      logMessage('System', 'Could not access microphone. Please grant permission and try again.');
      setConnectionStatus('error');
      setIsConnecting(false);
    }
  };

  const stopCall = () => {
    if (websocket.current) {
      websocket.current.close();
    }
    
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach(track => track.stop());
      mediaStream.current = null;
    }
    
    if (processor.current) {
      processor.current.disconnect();
      processor.current = null;
    }
    
    if (audioContext.current) {
      audioContext.current.close();
      audioContext.current = null;
    }
    
    interruptPlayback();
    setIsConnected(false);
    setIsConnecting(false);
    setConnectionStatus('disconnected');
    setIsMuted(false);
    logMessage('System', 'Call disconnected.');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    logMessage('System', isMuted ? 'Microphone enabled' : 'Microphone muted');
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    if (!isSpeakerOn) {
      interruptPlayback();
    }
    logMessage('System', isSpeakerOn ? 'Speaker muted' : 'Speaker enabled');
  };

  // Helper functions for audio processing
  const playNextInQueue = async () => {
    if (audioQueue.current.length === 0) {
      isPlaying.current = false;
      return;
    }

    isPlaying.current = true;
    const audioData = audioQueue.current.shift();
    if (!audioData) return;

    try {
      if (audioContext.current?.state === 'suspended') {
        await audioContext.current.resume();
      }

      const int16Array = new Int16Array(audioData);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = audioContext.current!.createBuffer(1, float32Array.length, PLAYBACK_SAMPLE_RATE);
      audioBuffer.getChannelData(0).set(float32Array);

      currentSource.current = audioContext.current!.createBufferSource();
      currentSource.current.buffer = audioBuffer;
      currentSource.current.connect(audioContext.current!.destination);
      
      currentSource.current.onended = () => {
        currentSource.current = null;
        playNextInQueue();
      };
      
      currentSource.current.start(0);

    } catch (error) {
      console.error('Error playing audio:', error);
      isPlaying.current = false;
      setTimeout(playNextInQueue, 100);
    }
  };

  const interruptPlayback = () => {
    if (currentSource.current) {
      try {
        currentSource.current.onended = null;
        currentSource.current.stop();
      } catch (e) {
        console.warn("Error stopping current audio source:", e);
      }
      currentSource.current = null;
    }
    audioQueue.current = [];
    isPlaying.current = false;
  };

  const downsampleBuffer = (buffer: Float32Array, inputSampleRate: number, outputSampleRate: number) => {
    if (outputSampleRate === inputSampleRate) {
      return buffer;
    }
    const sampleRateRatio = inputSampleRate / outputSampleRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;
    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      let accum = 0, count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }
      result[offsetResult] = accum / count;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    return result;
  };

  const toPcm16 = (input: Float32Array) => {
    const buffer = new ArrayBuffer(input.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return new Uint8Array(buffer);
  };
  
  const _base64ToArrayBuffer = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  useEffect(() => {
    return () => {
      stopCall();
    };
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI Onboarding Call</span>
          <Badge variant={connectionStatus === 'connected' ? 'default' : connectionStatus === 'error' ? 'destructive' : 'secondary'}>
            {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Call Controls */}
        <div className="flex justify-center space-x-4">
          {!isConnected && !isConnecting && (
            <Button onClick={startCall} className="flex items-center gap-2" size="lg">
              <PhoneCall className="w-5 h-5" />
              Start Call
            </Button>
          )}
          
          {isConnecting && (
            <Button disabled className="flex items-center gap-2" size="lg">
              <Loader2 className="w-5 h-5 animate-spin" />
              Connecting...
            </Button>
          )}
          
          {isConnected && (
            <>
              <Button 
                onClick={toggleMute} 
                variant={isMuted ? "destructive" : "outline"}
                size="lg"
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              
              <Button 
                onClick={toggleSpeaker} 
                variant={!isSpeakerOn ? "destructive" : "outline"}
                size="lg"
              >
                {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </Button>
              
              <Button onClick={stopCall} variant="destructive" size="lg">
                <PhoneOff className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>

        {connectionStatus === 'error' && (
          <Alert variant="destructive">
            <AlertDescription>
              Connection failed. Please check your internet connection and try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Call Log */}
        <Separator />
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Call Activity</h4>
          <div className="max-h-40 overflow-y-auto space-y-2 bg-muted/50 p-3 rounded-md">
            {log.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">No activity yet</p>
            ) : (
              log.map((entry, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium text-primary">{entry.sender}:</span>{' '}
                  <span className="text-foreground">{entry.message}</span>
                  <div className="text-xs text-muted-foreground">
                    {entry.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioCallManager;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  Mic, 
  Send, 
  Upload, 
  X, 
  Menu, 
  MessageSquare, 
  Volume2, 
  VolumeX,
  Loader2 
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  type: 'text' | 'audio';
}

interface AiOnboardingChatProps {
  userType: 'vendor' | 'staff';
  onOnboardingComplete: (data: any) => void;
  websocketUrl: string; // e.g., "ws://localhost:8000/onboarding/onboard"
  uploadEndpoint: string; // e.g., "http://localhost:8000/api/vendor_onboarding/upload-and-extract"
}

const AiOnboardingChat: React.FC<AiOnboardingChatProps> = ({
  userType,
  onOnboardingComplete,
  websocketUrl,
  uploadEndpoint
}) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [chatPanelOpen, setChatPanelOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [conversationalData, setConversationalData] = useState<any>(null);
  const [documentData, setDocumentData] = useState<any>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(`${websocketUrl}?user_type=${userType}`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      toast({
        title: 'Connected',
        description: 'AI assistant is ready to help you onboard!',
      });
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'text') {
          // AI text response
          addMessage('ai', data.content, 'text');
        } else if (data.type === 'audio') {
          // AI audio response (base64 encoded)
          setIsAiSpeaking(true);
          if (!isMuted) {
            await playAudioFromBase64(data.content);
          }
          setIsAiSpeaking(false);
        } else if (data.type === 'conversational_data') {
          // Initial conversational data from form_filling_agent
          console.log('Received conversational data:', data.data);
          setConversationalData(data.data);
          toast({
            title: 'Initial Data Collected',
            description: 'Please upload any relevant documents to continue.',
          });
        } else if (data.type === 'onboarding_complete') {
          // Onboarding process complete
          handleOnboardingComplete();
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to AI assistant',
        variant: 'destructive',
      });
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [websocketUrl, userType, isMuted]);

  // Add message to chat
  const addMessage = (sender: 'user' | 'ai', content: string, type: 'text' | 'audio' = 'text') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender,
      content,
      timestamp: new Date(),
      type
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Send text message
  const sendTextMessage = useCallback(() => {
    if (!inputText.trim() || !wsRef.current) return;

    const message = inputText.trim();
    addMessage('user', message, 'text');
    
    wsRef.current.send(JSON.stringify({
      type: 'text',
      content: message
    }));

    setInputText('');
  }, [inputText]);

  // Handle audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Recording Error',
        description: 'Could not access microphone',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Send audio message
  const sendAudioMessage = async (audioBlob: Blob) => {
    if (!wsRef.current) return;

    // Convert audio blob to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Audio = reader.result?.toString().split(',')[1];
      if (base64Audio) {
        wsRef.current?.send(JSON.stringify({
          type: 'audio',
          content: base64Audio
        }));
        addMessage('user', '[Voice message]', 'audio');
      }
    };
    reader.readAsDataURL(audioBlob);
  };

  // Play audio from base64
  const playAudioFromBase64 = async (base64Audio: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const audioData = atob(base64Audio);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }

      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start(0);

      return new Promise<void>((resolve) => {
        source.onended = () => resolve();
      });
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  // Handle file upload
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files]);
      toast({
        title: 'Files Selected',
        description: `${files.length} file(s) selected for upload`,
      });
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload documents and extract data
  const uploadDocuments = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: 'No Files',
        description: 'Please select files to upload',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    
    uploadedFiles.forEach((file, index) => {
      formData.append('files', file);
    });
    formData.append('user_type', userType);

    try {
      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      console.log('Extracted document data:', data);
      setDocumentData(data);

      toast({
        title: 'Documents Processed',
        description: 'Data extracted successfully from your documents',
      });

      // Notify backend that documents are uploaded
      wsRef.current?.send(JSON.stringify({
        type: 'documents_uploaded',
        data: data
      }));

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: 'Could not process documents',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Merge conversational and document data
  const mergeData = useCallback(() => {
    if (!conversationalData && !documentData) return null;

    // Deep merge with document data taking priority
    const merged = {
      ...conversationalData,
      ...documentData,
    };

    return merged;
  }, [conversationalData, documentData]);

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    const mergedData = mergeData();
    
    if (mergedData) {
      toast({
        title: 'Onboarding Complete',
        description: 'Redirecting to complete your profile...',
      });
      onOnboardingComplete(mergedData);
    } else {
      toast({
        title: 'No Data',
        description: 'Please complete the conversation or upload documents',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background relative overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <X className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">SanskaraAI Onboarding</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setChatPanelOpen(!chatPanelOpen)}
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </header>

      {/* Main Audio Interface */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 pb-32">
        {/* AI Visualizer */}
        <div className="relative mb-8">
          <div className={`w-40 h-40 rounded-full bg-primary/20 flex items-center justify-center transition-all duration-300 ${
            isAiSpeaking ? 'scale-110 animate-pulse' : 'scale-100'
          }`}>
            <div className={`w-32 h-32 rounded-full bg-primary/40 flex items-center justify-center ${
              isRecording ? 'animate-pulse' : ''
            }`}>
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center">
                {isRecording ? (
                  <Mic className="h-12 w-12 text-primary-foreground animate-pulse" />
                ) : isAiSpeaking ? (
                  <Volume2 className="h-12 w-12 text-primary-foreground" />
                ) : (
                  <MessageSquare className="h-12 w-12 text-primary-foreground" />
                )}
              </div>
            </div>
          </div>
          
          {/* Connection Status */}
          <div className="absolute -top-2 -right-2">
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">
            {isRecording ? 'Listening...' : isAiSpeaking ? 'AI Speaking...' : 'Ready to Help'}
          </h2>
          <p className="text-muted-foreground">
            {userType === 'vendor' ? 'Vendor Onboarding' : 'Staff Onboarding'}
          </p>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background to-transparent">
        <div className="space-y-4">
          {/* Tap to Talk Button */}
          <Button
            size="lg"
            className="w-full rounded-full"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            disabled={!isConnected}
          >
            <Mic className="h-5 w-5 mr-2" />
            {isRecording ? 'Release to Send' : 'Hold to Talk'}
          </Button>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => fileInputRef.current?.click()}
              disabled={!isConnected}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>

          {/* File Upload Section */}
          {uploadedFiles.length > 0 && (
            <Card className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {uploadedFiles.length} file(s) selected
                </span>
                <Button
                  size="sm"
                  onClick={uploadDocuments}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Upload & Extract'
                  )}
                </Button>
              </div>
              <div className="space-y-1">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex justify-between items-center text-xs">
                    <span className="truncate flex-1">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Chat Panel (Slide-in from right) */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-96 bg-background border-l shadow-lg transform transition-transform duration-300 z-20 ${
          chatPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Chat Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Chat History</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setChatPanelOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Text Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
                disabled={!isConnected}
              />
              <Button
                size="icon"
                onClick={sendTextMessage}
                disabled={!isConnected || !inputText.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiOnboardingChat;

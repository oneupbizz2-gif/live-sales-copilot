import { useState, useRef, useCallback } from 'react';
import { AudioRecorder, encodeAudioForAPI, playAudioData } from '@/utils/AudioHandler';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  role: 'user' | 'client' | 'ai';
  content: string;
  timestamp: Date;
}

export const useRealtimeAI = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentScript, setCurrentScript] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { toast } = useToast();

  const connect = useCallback(async (clientContext: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      }

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'bmkfduxysyfebcecvvjp';
      const wsUrl = `wss://${projectId}.supabase.co/functions/v1/realtime-ai`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = async () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // Send initialization with context
        wsRef.current?.send(JSON.stringify({
          type: 'session.init',
          context: clientContext
        }));

        // Start audio recording
        recorderRef.current = new AudioRecorder((audioData) => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: encodeAudioForAPI(audioData)
            }));
          }
        });

        await recorderRef.current.start();
      };

      wsRef.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log('Received:', data.type);

        switch (data.type) {
          case 'response.audio.delta':
            if (audioContextRef.current) {
              const binaryString = atob(data.delta);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              await playAudioData(audioContextRef.current, bytes);
            }
            break;

          case 'response.audio_transcript.delta':
            setCurrentScript(prev => prev + data.delta);
            break;

          case 'response.audio_transcript.done':
            setMessages(prev => [...prev, {
              role: 'ai',
              content: data.transcript,
              timestamp: new Date()
            }]);
            break;

          case 'conversation.item.input_audio_transcription.completed':
            setMessages(prev => [...prev, {
              role: 'client',
              content: data.transcript,
              timestamp: new Date()
            }]);
            break;

          case 'error':
            console.error('WebSocket error:', data);
            toast({
              title: 'Error',
              description: data.message || 'Connection error',
              variant: 'destructive'
            });
            break;
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to AI service',
          variant: 'destructive'
        });
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
        recorderRef.current?.stop();
      };

    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to connect',
        variant: 'destructive'
      });
    }
  }, [toast]);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    recorderRef.current?.stop();
    setIsConnected(false);
    setCurrentScript('');
  }, []);

  return {
    messages,
    currentScript,
    isConnected,
    connect,
    disconnect
  };
};

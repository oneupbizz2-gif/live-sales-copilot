import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY not configured");
    socket.send(JSON.stringify({ 
      type: 'error', 
      message: 'OPENAI_API_KEY not configured on server' 
    }));
    socket.close();
    return response;
  }
  
  console.log("OPENAI_API_KEY is configured");

  let openAISocket: WebSocket | null = null;
  let clientContext = "";

  socket.onopen = () => {
    console.log("Client WebSocket connected");
  };

  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log("Received from client:", message.type);

      if (message.type === 'session.init') {
        // Initialize OpenAI connection with client context
        clientContext = message.context || "";
        
        openAISocket = new WebSocket(
          "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01",
          {
            headers: {
              "Authorization": `Bearer ${OPENAI_API_KEY}`,
              "OpenAI-Beta": "realtime=v1"
            }
          }
        );

        openAISocket.onopen = () => {
          console.log("OpenAI WebSocket connected");
          // Wait for session.created before sending session.update
        };

        openAISocket.onmessage = (openAIEvent) => {
          const data = JSON.parse(openAIEvent.data);
          console.log("OpenAI event:", data.type);
          
          // Send session.update after receiving session.created
          if (data.type === 'session.created') {
            const systemPrompt = `You are an AI sales assistant helping with a cold call. 
Client Context: ${clientContext}

Your role is to:
1. Listen to the conversation in real-time
2. Generate persuasive, contextually relevant script suggestions
3. Respond to client objections with solutions
4. Keep responses concise and natural (2-3 sentences max)
5. Focus on the client's pain points and how the software services solve them
6. Be professional, friendly, and authentic

Generate script suggestions that feel natural and conversational, not robotic.`;

            openAISocket?.send(JSON.stringify({
              type: "session.update",
              session: {
                modalities: ["text", "audio"],
                instructions: systemPrompt,
                voice: "alloy",
                input_audio_format: "pcm16",
                output_audio_format: "pcm16",
                input_audio_transcription: {
                  model: "whisper-1"
                },
                turn_detection: {
                  type: "server_vad",
                  threshold: 0.5,
                  prefix_padding_ms: 300,
                  silence_duration_ms: 500
                },
                temperature: 0.8,
                max_response_output_tokens: 1000
              }
            }));
          }
          
          // Forward to client
          socket.send(openAIEvent.data);
        };

        openAISocket.onerror = (error) => {
          console.error("OpenAI WebSocket error:", error);
          socket.send(JSON.stringify({ 
            type: 'error', 
            message: 'OpenAI connection error' 
          }));
        };

        openAISocket.onclose = () => {
          console.log("OpenAI WebSocket closed");
        };

      } else if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
        // Forward audio and other messages to OpenAI
        openAISocket.send(event.data);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      socket.send(JSON.stringify({ 
        type: 'error', 
        message: 'Failed to process message' 
      }));
    }
  };

  socket.onclose = () => {
    console.log("Client WebSocket closed");
    openAISocket?.close();
  };

  socket.onerror = (error) => {
    console.error("Client WebSocket error:", error);
    openAISocket?.close();
  };

  return response;
});

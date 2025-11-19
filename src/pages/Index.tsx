import { useState } from "react";
import { ClientContextForm } from "@/components/ClientContextForm";
import { TeleprompterDisplay } from "@/components/TeleprompterDisplay";
import { CallControls } from "@/components/CallControls";
import { TranscriptDisplay } from "@/components/TranscriptDisplay";
import { useToast } from "@/components/ui/use-toast";
import { useRealtimeAI } from "@/hooks/useRealtimeAI";

interface ClientData {
  clientName: string;
  context: string;
  phoneNumber: string;
}

const Index = () => {
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const { toast } = useToast();
  const { messages, currentScript, isConnected, connect, disconnect } = useRealtimeAI();

  const handleClientSubmit = (data: ClientData) => {
    setClientData(data);
    toast({
      title: "Client information saved",
      description: `Ready to call ${data.clientName}`,
    });
  };

  const handleConnect = async () => {
    if (!clientData) {
      toast({
        title: "Error",
        description: "Please enter client information first",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Connecting...",
      description: `Initializing AI for ${clientData.clientName}`,
    });

    const contextPrompt = `Client Name: ${clientData.clientName}\nPhone: ${clientData.phoneNumber}\nContext: ${clientData.context}`;
    await connect(contextPrompt);
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: "Call ended",
      description: "Call disconnected successfully",
    });
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="text-center space-y-2 py-8">
          <h1 className="text-4xl font-bold text-foreground">
            AI Live Teleprompter
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time AI-powered script generation for cold calls
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <ClientContextForm 
              onSubmit={handleClientSubmit} 
              disabled={isConnected}
            />
            
            <CallControls
              isConnected={isConnected}
              isMuted={isMuted}
              isSpeakerOn={isSpeakerOn}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onToggleMute={handleToggleMute}
              onToggleSpeaker={handleToggleSpeaker}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <TeleprompterDisplay 
              script={currentScript || (isConnected ? "Listening for conversation..." : "")}
              isActive={isConnected}
            />
            
            <TranscriptDisplay messages={messages} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

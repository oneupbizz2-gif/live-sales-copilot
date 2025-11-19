import { useState } from "react";
import { ClientContextForm } from "@/components/ClientContextForm";
import { TeleprompterDisplay } from "@/components/TeleprompterDisplay";
import { CallControls } from "@/components/CallControls";
import { TranscriptDisplay } from "@/components/TranscriptDisplay";
import { useToast } from "@/components/ui/use-toast";

interface ClientData {
  clientName: string;
  context: string;
  phoneNumber: string;
}

const Index = () => {
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [script, setScript] = useState("");
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'client' | 'ai'; content: string; timestamp: Date }>>([]);
  const { toast } = useToast();

  const handleClientSubmit = (data: ClientData) => {
    setClientData(data);
    toast({
      title: "Client information saved",
      description: `Ready to call ${data.clientName}`,
    });
  };

  const handleConnect = () => {
    if (!clientData) {
      toast({
        title: "Error",
        description: "Please enter client information first",
        variant: "destructive",
      });
      return;
    }
    
    setIsConnected(true);
    setScript("Initializing AI assistant and establishing connection...");
    
    toast({
      title: "Connecting...",
      description: `Calling ${clientData.clientName}`,
    });

    // Simulate initial script
    setTimeout(() => {
      setScript(`Hi ${clientData.clientName}, this is [Your Name] calling about our software services. I understand you're looking to ${clientData.context.slice(0, 50)}...`);
    }, 2000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setScript("");
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
              script={script}
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

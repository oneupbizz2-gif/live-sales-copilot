import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";

interface CallControlsProps {
  isConnected: boolean;
  isMuted: boolean;
  isSpeakerOn: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
}

export const CallControls = ({
  isConnected,
  isMuted,
  isSpeakerOn,
  onConnect,
  onDisconnect,
  onToggleMute,
  onToggleSpeaker,
}: CallControlsProps) => {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-center gap-4">
          {!isConnected ? (
            <Button
              onClick={onConnect}
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground h-16 px-8 rounded-full"
            >
              <Phone className="mr-2 h-5 w-5" />
              Start Call
            </Button>
          ) : (
            <>
              <Button
                onClick={onToggleMute}
                variant="secondary"
                size="lg"
                className="h-14 w-14 rounded-full"
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              
              <Button
                onClick={onToggleSpeaker}
                variant="secondary"
                size="lg"
                className="h-14 w-14 rounded-full"
              >
                {isSpeakerOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </Button>
              
              <Button
                onClick={onDisconnect}
                variant="destructive"
                size="lg"
                className="h-16 px-8 rounded-full"
              >
                <PhoneOff className="mr-2 h-5 w-5" />
                End Call
              </Button>
            </>
          )}
        </div>
        
        {isConnected && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-sm font-medium text-accent">Call Active</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

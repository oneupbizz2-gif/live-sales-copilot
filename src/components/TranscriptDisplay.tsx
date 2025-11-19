import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: 'user' | 'client' | 'ai';
  content: string;
  timestamp: Date;
}

interface TranscriptDisplayProps {
  messages: Message[];
}

export const TranscriptDisplay = ({ messages }: TranscriptDisplayProps) => {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Call Transcript</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full rounded-md">
          <div className="space-y-4 pr-4">
            {messages.length === 0 ? (
              <p className="text-muted-foreground italic">Transcript will appear here during the call...</p>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${
                      msg.role === 'user' ? 'text-primary' :
                      msg.role === 'client' ? 'text-accent' :
                      'text-muted-foreground'
                    }`}>
                      {msg.role === 'user' ? 'YOU' : msg.role === 'client' ? 'CLIENT' : 'AI'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{msg.content}</p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

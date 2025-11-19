import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TeleprompterDisplayProps {
  script: string;
  isActive: boolean;
}

export const TeleprompterDisplay = ({ script, isActive }: TeleprompterDisplayProps) => {
  return (
    <Card className={`border-2 transition-all ${isActive ? 'border-primary shadow-lg shadow-primary/20' : 'border-border'}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-call-active animate-pulse' : 'bg-call-inactive'}`} />
          <span className="text-sm font-medium text-muted-foreground">
            {isActive ? 'Live Script' : 'Waiting for call...'}
          </span>
        </div>
        
        <ScrollArea className="h-[400px] w-full rounded-md">
          <div className="space-y-4 pr-4">
            {script ? (
              <p className="text-2xl leading-relaxed text-foreground font-medium tracking-wide">
                {script}
              </p>
            ) : (
              <p className="text-xl text-muted-foreground italic">
                Your AI-generated script will appear here in real-time during the call...
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

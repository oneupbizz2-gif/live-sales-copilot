import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ClientContextFormProps {
  onSubmit: (data: { clientName: string; context: string; phoneNumber: string }) => void;
  disabled?: boolean;
}

export const ClientContextForm = ({ onSubmit, disabled }: ClientContextFormProps) => {
  const [clientName, setClientName] = useState("");
  const [context, setContext] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientName && context && phoneNumber) {
      onSubmit({ clientName, context, phoneNumber });
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Client Information</CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter details about your client before starting the call
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientName" className="text-foreground">Client Name</Label>
            <Input
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="John Doe"
              disabled={disabled}
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-foreground">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              disabled={disabled}
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="context" className="text-foreground">Client Context & Requirements</Label>
            <Textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Describe the client's business, pain points, and specific requirements..."
              rows={6}
              disabled={disabled}
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none"
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={disabled || !clientName || !context || !phoneNumber}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Ready to Call
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

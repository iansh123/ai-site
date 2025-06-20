import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const { toast } = useToast();

  const contactMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent successfully",
        description: "We'll get back to you as soon as possible."
      });
      setFormData({ name: "", email: "", message: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    contactMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section id="contact" className="py-32 px-6 bg-muted/30">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 text-foreground tracking-tight">
            Get In Touch
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed">
            Ready to transform your business with AI automation? Let's discuss your needs.
          </p>
        </div>
        
        <div className="bg-card rounded-3xl p-12 border border-border shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <Label htmlFor="name" className="text-lg font-semibold text-foreground mb-3 block">
                Name
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Your full name"
                className="h-14 text-lg rounded-xl border-border bg-background"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email" className="text-lg font-semibold text-foreground mb-3 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="your.email@company.com"
                className="h-14 text-lg rounded-xl border-border bg-background"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="message" className="text-lg font-semibold text-foreground mb-3 block">
                Message
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                placeholder="Tell us about your automation needs..."
                rows={6}
                className="text-lg rounded-xl border-border bg-background resize-none"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-16 bg-foreground text-background hover:bg-muted-foreground text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
              disabled={contactMutation.isPending}
            >
              {contactMutation.isPending ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

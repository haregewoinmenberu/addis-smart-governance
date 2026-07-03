import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, Paperclip, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  institutionType?: string;
}

export function AIAssistant({ institutionType = "UNKNOWN" }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: `Hello! I'm your AI assistant. I can help you with:\n\n• Filling out service request forms\n• Understanding requirements and procedures\n• Providing guidance on document preparation\n• Answering questions about STRP services\n\nHow can I assist you today?`,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickPrompts = [
    "How do I submit a research request?",
    "What documents do I need for licensing?",
    "Explain the approval process",
    "Help me fill out a transformation request",
  ];

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response (in production, this would call your AI API)
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage, institutionType);
      const assistantMessage: Message = {
        id: messages.length + 2,
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputMessage(prompt);
    inputRef.current?.focus();
  };

  const generateAIResponse = (question: string, type: string): string => {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes("research")) {
      return `For submitting a research request, you'll need to:\n\n1. Go to the Services section and select "Research & Consulting"\n2. Fill out the research proposal form with:\n   • Project title and objectives\n   • Expected outcomes\n   • Timeline and budget\n   • Research methodology\n\n3. Upload supporting documents:\n   • Detailed research proposal (PDF)\n   • Budget breakdown\n   • Team CVs\n\n4. Submit the form and note your reference number\n\nAs a ${type.replace(/_/g, " ")}, you may be eligible for priority processing. Would you like me to help you fill out the form?`;
    }

    if (lowerQuestion.includes("document") || lowerQuestion.includes("license")) {
      return `For licensing requests, you'll typically need:\n\n📄 **Required Documents:**\n• Business/Institution license\n• TIN certificate\n• Registration certificate\n• Valid ID of authorized signatory\n• Recent financial statements\n\n📋 **Process:**\n1. Prepare all documents (scanned copies acceptable)\n2. Navigate to "Technology Licensing" service\n3. Fill out the application form\n4. Upload documents\n5. Submit and track via your reference number\n\n⏱️ **Processing Time:** 5-10 business days\n\nWould you like help with any specific document?`;
    }

    if (lowerQuestion.includes("approval") || lowerQuestion.includes("process")) {
      return `The STRP approval process works as follows:\n\n**Stage 1: Submission** ✓\n• You submit your request with required documents\n• System generates a reference number\n• Initial validation (automated)\n\n**Stage 2: Review** 🔍\n• STRP analyst reviews your application\n• May request additional information\n• Feasibility assessment conducted\n\n**Stage 3: Approval** ✅\n• Department head reviews recommendation\n• Final approval or feedback provided\n• Notification sent to you\n\n**Stage 4: Implementation** 🚀\n• Service delivery begins\n• Regular status updates\n• Post-service evaluation\n\n📊 Average processing time: 7-14 business days\n\nYou can track your request status anytime in the Requests tab.`;
    }

    if (lowerQuestion.includes("transform") || lowerQuestion.includes("fill")) {
      return `I'd be happy to help you with a transformation request! Let me guide you:\n\n**Digital Transformation Request Form:**\n\n1. **Current State Assessment**\n   • What systems do you currently use?\n   • What are the main challenges?\n   • Number of users/beneficiaries?\n\n2. **Desired Outcome**\n   • What processes do you want to digitize?\n   • Expected improvements?\n   • Target completion date?\n\n3. **Resources**\n   • Available budget range?\n   • Internal technical team?\n   • Existing infrastructure?\n\n4. **Priority Level**\n   • How urgent is this transformation?\n   • Impact on your operations?\n\nBased on your institution type (${type.replace(/_/g, " ")}), I can provide specific recommendations. Would you like to start filling this out together?`;
    }

    return `Thank you for your question! I'm here to help with:\n\n• **Service Requests**: Guide you through any STRP service application\n• **Requirements**: Explain what documents and information you need\n• **Form Assistance**: Help fill out forms step-by-step\n• **Process Inquiries**: Clarify approval workflows and timelines\n• **Best Practices**: Share tips for successful applications\n\nCould you please provide more details about what you need help with? For example:\n- Which service are you interested in?\n- What specific question do you have?\n- What stage are you at in the process?`;
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                AI Assistant
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Beta
                </Badge>
              </CardTitle>
              <CardDescription>Get instant help with forms and procedures</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">AI is typing...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Prompts */}
        {messages.length === 1 && (
          <div className="px-4 pb-3 border-t pt-3">
            <p className="text-xs text-muted-foreground mb-2">Quick prompts:</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleQuickPrompt(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Type your question..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isTyping}
            />
            <Button onClick={handleSendMessage} disabled={isTyping || !inputMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            AI responses are generated for guidance only. Verify critical information with STRP staff.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

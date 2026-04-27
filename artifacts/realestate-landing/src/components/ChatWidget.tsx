import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Message = {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  time: string;
};

const botResponses = [
  "That's a great budget! We have some excellent options in Whitefield and Electronic City.",
  "Would you prefer a ready-to-move property or an under-construction one?",
  "I can arrange a site visit this weekend — shall I have our agent Ramesh call you?",
  "Good choice. We only deal with clear-title properties so you don't have to worry about legal issues.",
  "Please share your contact number, and one of our senior agents will call you with specific details within an hour."
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Namaste! I'm Kavitha from Priya Estates. Looking for a property? I can help you find the right plot, flat, or villa. What's your budget range and preferred city?",
      sender: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [responseIndex, setResponseIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!inputValue.trim()) return;

    const newUserMsg: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot thinking
    setTimeout(() => {
      const newBotMsg: Message = {
        id: Date.now() + 1,
        text: botResponses[responseIndex % botResponses.length],
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, newBotMsg]);
      setResponseIndex(prev => prev + 1);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-16 h-16 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center justify-center hover:bg-primary/90 transition-colors z-50 group"
          >
            <MessageCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
              1
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[90vw] sm:w-[380px] h-[550px] max-h-[85vh] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-primary p-4 flex items-center justify-between text-primary-foreground">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-primary rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-bold text-sm">Kavitha</h3>
                  <p className="text-xs text-primary-foreground/80">Property Assistant</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-muted/30 space-y-4">
              <div className="text-center text-xs text-muted-foreground mb-4">
                Chat securely with Priya Estates
              </div>
              
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-2xl p-3 text-sm shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-br-sm' 
                        : 'bg-background border border-border text-foreground rounded-bl-sm'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    <span className={`text-[10px] mt-1 block ${msg.sender === 'user' ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground text-left'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-background border border-border rounded-2xl rounded-bl-sm p-4 shadow-sm flex gap-1">
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-primary/80 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background border-t border-border">
              <form 
                onSubmit={handleSend}
                className="flex items-center gap-2"
              >
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-muted/50 border-border focus-visible:ring-primary rounded-full"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!inputValue.trim() || isTyping}
                  className="rounded-full shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

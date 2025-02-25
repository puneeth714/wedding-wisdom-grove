
import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, X, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatbotModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

type Message = {
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
};

const INITIAL_MESSAGES: Message[] = [
  {
    content: "Hi there! I'm your wedding wisdom assistant. How can I help you with your wedding plans today?",
    sender: "bot",
    timestamp: new Date(),
  },
];

const ChatbotModal = ({ open, setOpen }: ChatbotModalProps) => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (input.trim() === "") return;

    // Add user message
    const userMessage: Message = {
      content: input,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponses: { [key: string]: string } = {
        "wedding": "A wedding is a ceremony where two people are united in marriage. Wedding traditions and customs vary greatly between cultures, ethnic groups, religions, countries, and social classes.",
        "venue": "When choosing a wedding venue, consider your budget, guest count, location convenience, and whether it matches your wedding vision. Visit multiple venues before making

If there's knowledge, context or custom instructions you want to include in every edit in this project, set it below.

<lov-actions>
<lov-knowledge>
</lov-actions>

Given your project's requirements (chatbot, vendor matching, full-stack planning), integrating Supabase for user authentication, data storage (wedding details, vendor information, user preferences), and potentially AI features for the chatbot would be highly beneficial.  You can use the Supabase menu to connect your project.
<lov-actions>
<lov-message-prompt message="Tell me more about Supabase">Learn more about Supabase</lov-message-prompt>
</lov-actions>

<lov-actions>
<lov-link url="https://docs.lovable.dev/">Visit docs</lov-link>
</lov-actions>

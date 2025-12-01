'use client';

import { useState, useRef, useEffect } from 'react';
import type { Lead } from '@/lib/generateLeads';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
}

interface AIChatProps {
  leads: Lead[];
  selectedLeadIds?: string[];
}

export default function AIChat({ leads, selectedLeadIds }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          leadIds: selectedLeadIds || leads.map((l) => l.id),
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Si hay una acción, procesarla
      if (data.action) {
        console.log('Action:', data.action);
        // Aquí puedes agregar lógica para procesar acciones
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Error al procesar tu mensaje. Por favor intenta de nuevo.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-bg-card rounded-lg border border-border-dark p-6 h-full flex flex-col">
      <h2 className="text-lg font-bold uppercase tracking-wider text-white mb-4 font-display">
        AI Assistant
      </h2>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 min-h-[300px] max-h-[400px]">
        {messages.length === 0 ? (
          <div className="text-text-secondary/50 text-sm text-center py-8">
            <p className="mb-2">💬 Chatea con el asistente de IA</p>
            <p className="text-xs">Ejemplos:</p>
            <p className="text-xs">• "¿Cuáles tienen correo bueno?"</p>
            <p className="text-xs">• "Mándales correo a los de score alto"</p>
            <p className="text-xs">• "Muéstrame los leads calificados"</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-accent-red/20 text-white border border-accent-red/50'
                    : 'bg-bg-card-alt text-text-secondary border border-border-dark'
                }`}
              >
                <div className="text-xs font-mono whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-bg-card-alt rounded-lg p-3 border border-border-dark">
              <div className="flex items-center gap-2 text-text-secondary text-xs">
                <div className="w-2 h-2 bg-accent-red rounded-full animate-pulse"></div>
                <span>Pensando...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Escribe tu mensaje..."
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 bg-bg-card-alt border border-border-dark rounded text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/30 transition-all disabled:opacity-50"
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="px-6 py-2.5 bg-accent-red text-white font-bold uppercase tracking-wider rounded glow-red hover:glow-red-strong transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-display"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}


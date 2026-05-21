import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Video, Mic, MicOff, VideoOff, MessageSquare, Users, 
  Settings, PhoneOff, Plus, MoreVertical, Shield, 
  Hand, Share2, Maximize2, Send, X, Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Participant {
  id: string;
  name: string;
  role: "aluno" | "professor";
  isMuted: boolean;
  isVideoOff: boolean;
  isHandRaised?: boolean;
  avatar?: string;
}

interface Message {
  id: string;
  sender: string;
  role: string;
  content: string;
  time: string;
}

interface Room {
  id: string;
  title: string;
  teacher: string;
  subject: string;
  participantsCount: number;
  status: "active" | "scheduled";
}

export default function VideoSalas() {
  const [inCall, setInCall] = useState(false);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", sender: "Prof. Ana", role: "professor", content: "Bom dia, turma! Prontos para a aula de hoje?", time: "09:00" },
    { id: "2", sender: "Lucas Silva", role: "aluno", content: "Bom dia, professora!", time: "09:01" },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [handRaised, setHandRaised] = useState(false);

  const [rooms, setRooms] = useState<Room[]>([
    { id: "1", title: "Aula de Português - Gramática", teacher: "Prof. Ana", subject: "Português", participantsCount: 15, status: "active" },
    { id: "2", title: "Matemática - Equações", teacher: "Prof. Maria", subject: "Matemática", participantsCount: 8, status: "active" },
    { id: "3", title: "Projeto de IA", teacher: "Prof. Tech", subject: "Tecnologia e IA", participantsCount: 0, status: "scheduled" },
  ]);

  const [participants, setParticipants] = useState<Participant[]>([
    { id: "p1", name: "Prof. Ana", role: "professor", isMuted: false, isVideoOff: false, avatar: "A" },
    { id: "p2", name: "Lucas Silva", role: "aluno", isMuted: true, isVideoOff: false, avatar: "L" },
    { id: "p3", name: "Mariana Oliveira", role: "aluno", isMuted: false, isVideoOff: true, avatar: "M" },
    { id: "p4", name: "João Pedro", role: "aluno", isMuted: true, isVideoOff: false, avatar: "J" },
    { id: "p5", name: "Beatriz Santos", role: "aluno", isMuted: false, isVideoOff: false, avatar: "B" },
  ]);

  const handleJoinRoom = (room: Room) => {
    setActiveRoom(room);
    setInCall(true);
    toast.success(`Entrando na sala: ${room.title}`);
  };

  const handleLeaveCall = () => {
    setInCall(false);
    setActiveRoom(null);
    toast.info("Você saiu da reunião");
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      sender: "Você",
      role: "aluno",
      content: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, msg]);
    setNewMessage("");
  };

  const toggleHand = () => {
    setHandRaised(!handRaised);
    if (!handRaised) {
      toast.info("Você levantou a mão");
    }
  };

  const handleMuteAll = () => {
    setParticipants(participants.map(p => p.role === "aluno" ? { ...p, isMuted: true } : p));
    toast.success("Todos os alunos foram silenciados");
  };

  if (!inCall) {
    return (
      <DashboardLayout role="professor" userName="Prof. Ana">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Salas de Aula Virtual</h1>
              <p className="text-muted-foreground">Gerencie suas aulas e reuniões em tempo real como no Teams.</p>
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-2 h-4 w-4" /> Nova Reunião
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <motion.div
                key={room.id}
                whileHover={{ y: -4 }}
                className="bg-card border rounded-xl overflow-hidden shadow-sm flex flex-col"
              >
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Video className="h-5 w-5 text-indigo-600" />
                    </div>
                    {room.status === "active" ? (
                      <Badge className="bg-green-500/10 text-green-600 border-green-200">Ao Vivo</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Agendada</Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-1">{room.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{room.subject} • {room.teacher}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{room.participantsCount} alunos participando</span>
                  </div>
                </div>
                <div className="p-4 bg-muted/30 border-t">
                  <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700" 
                    onClick={() => handleJoinRoom(room)}
                  >
                    Entrar na Sala
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
            <h3 className="font-bold text-indigo-900 mb-2">Plano de Integração Supabase</h3>
            <p className="text-indigo-700 text-sm mb-4">
              Para tornar este sistema funcional em tempo real, utilizaremos as seguintes tabelas e recursos:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-bold text-sm mb-1">Tabela: `rooms`</h4>
                <p className="text-xs text-muted-foreground">ID, título, matéria, professor_id, status (ativo/encerrado).</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-bold text-sm mb-1">Tabela: `messages`</h4>
                <p className="text-xs text-muted-foreground">ID, room_id, user_id, conteúdo, timestamp. (Supabase Realtime)</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-bold text-sm mb-1">Tabela: `participants`</h4>
                <p className="text-xs text-muted-foreground">Mapeamento de usuários em salas, status de microfone/camera.</p>
              </div>
            </div>
            <p className="text-indigo-700 text-xs mt-4 italic">
              *Integração via WebRTC para áudio/vídeo e Supabase Realtime para chat e sinalização.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <div className="h-screen bg-[#111111] text-white flex flex-col overflow-hidden">
      {/* Header Reunião */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm">{activeRoom?.title}</h2>
            <div className="flex items-center gap-2 text-[10px] text-white/50">
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> REC 00:45:12
              </span>
              <span>•</span>
              <span>{participants.length} participantes</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setShowParticipants(!showParticipants)} className={showParticipants ? "bg-white/10" : ""}>
            <Users size={20} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowChat(!showChat)} className={showChat ? "bg-white/10" : ""}>
            <MessageSquare size={20} />
          </Button>
          <Separator orientation="vertical" className="h-8 bg-white/10 mx-2" />
          <Button variant="destructive" onClick={handleLeaveCall} className="gap-2">
            <PhoneOff size={18} /> Sair
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content (Video Grid) */}
        <div className="flex-1 p-4 flex flex-col gap-4 overflow-hidden relative">
          <div className={`grid gap-4 flex-1 ${
            participants.length <= 1 ? "grid-cols-1" :
            participants.length <= 4 ? "grid-cols-2" :
            "grid-cols-3"
          }`}>
            {participants.map((p) => (
              <div key={p.id} className="relative bg-[#2a2a2a] rounded-xl overflow-hidden group border border-white/5">
                {p.isVideoOff ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e]">
                    <div className="w-24 h-24 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-3xl font-bold border-2 border-indigo-600/30">
                      {p.avatar}
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    {/* Placeholder para vídeo real */}
                    <div className="absolute inset-0 bg-[#333] flex items-center justify-center">
                       <VideoOff className="h-10 w-10 text-white/10" />
                       <span className="absolute bottom-4 left-4 text-xs bg-black/40 px-2 py-1 rounded">Câmera de {p.name}</span>
                    </div>
                  </div>
                )}
                
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {p.isMuted && (
                    <div className="p-1.5 bg-red-500 rounded-lg">
                      <MicOff size={14} />
                    </div>
                  )}
                  {p.isHandRaised && (
                    <div className="p-1.5 bg-yellow-500 rounded-lg">
                      <Hand size={14} className="text-black" />
                    </div>
                  )}
                </div>

                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <span className="text-xs bg-black/60 backdrop-blur-md px-2 py-1 rounded-md font-medium border border-white/10">
                    {p.name} {p.role === "professor" && "(Professor)"}
                  </span>
                  {p.isMuted && <MicOff size={14} className="text-red-400" />}
                </div>
              </div>
            ))}
          </div>

          {/* Controls Overlay */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl">
            <Button 
              variant="outline" 
              size="icon" 
              className={`rounded-full h-12 w-12 border-white/10 ${isMuted ? "bg-red-500 hover:bg-red-600 border-none" : "bg-white/5 hover:bg-white/10"}`}
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className={`rounded-full h-12 w-12 border-white/10 ${isVideoOff ? "bg-red-500 hover:bg-red-600 border-none" : "bg-white/5 hover:bg-white/10"}`}
              onClick={() => setIsVideoOff(!isVideoOff)}
            >
              {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
            </Button>
            
            <Separator orientation="vertical" className="h-8 bg-white/10" />

            <Button 
              variant="outline" 
              size="icon" 
              className={`rounded-full h-12 w-12 border-white/10 ${handRaised ? "bg-yellow-500 text-black hover:bg-yellow-600" : "bg-white/5 hover:bg-white/10"}`}
              onClick={toggleHand}
            >
              <Hand size={22} />
            </Button>

            <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-white/10 bg-white/5 hover:bg-white/10">
              <Share2 size={22} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-white/10 bg-white/5 hover:bg-white/10">
                  <MoreVertical size={22} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#1a1a1a] border-white/10 text-white">
                <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" onClick={handleMuteAll}>
                  <MicOff className="mr-2 h-4 w-4" /> Silenciar Todos
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer">
                  <Shield className="mr-2 h-4 w-4" /> Config. de Segurança
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer">
                  <Maximize2 className="mr-2 h-4 w-4" /> Tela Cheia
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer text-red-400 focus:text-red-400">
                  <PhoneOff className="mr-2 h-4 w-4" /> Encerrar Reunião
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Side Panels */}
        <AnimatePresence>
          {showChat && (
            <motion.div 
              initial={{ x: 350 }} 
              animate={{ x: 0 }} 
              exit={{ x: 350 }}
              className="w-80 bg-[#1a1a1a] border-l border-white/10 flex flex-col"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold">Chat da Aula</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowChat(false)} className="h-8 w-8 text-white/50 hover:text-white">
                  <X size={18} />
                </Button>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold ${msg.role === 'professor' ? 'text-indigo-400' : 'text-white/70'}`}>
                          {msg.sender}
                        </span>
                        <span className="text-[10px] text-white/40">{msg.time}</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-lg text-sm text-white/90">
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-4 border-t border-white/10 flex gap-2">
                <Input 
                  placeholder="Digite uma mensagem..." 
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button size="icon" className="bg-indigo-600 hover:bg-indigo-700 shrink-0" onClick={handleSendMessage}>
                  <Send size={16} />
                </Button>
              </div>
            </motion.div>
          )}

          {showParticipants && (
            <motion.div 
              initial={{ x: 350 }} 
              animate={{ x: 0 }} 
              exit={{ x: 350 }}
              className="w-80 bg-[#1a1a1a] border-l border-white/10 flex flex-col"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold">Participantes ({participants.length})</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowParticipants(false)} className="h-8 w-8 text-white/50 hover:text-white">
                  <X size={18} />
                </Button>
              </div>
              <div className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/30" />
                  <Input placeholder="Buscar..." className="bg-white/5 border-white/10 pl-9 text-xs" />
                </div>
                <div className="space-y-4">
                  {participants.map((p) => (
                    <div key={p.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center text-xs font-bold text-indigo-400 border border-indigo-600/20">
                          {p.avatar}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <p className="text-[10px] text-white/50">{p.role === 'professor' ? 'Organizador' : 'Participante'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          {p.isMuted ? <MicOff size={14} className="text-red-400" /> : <Mic size={14} />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          {p.isVideoOff ? <VideoOff size={14} className="text-red-400" /> : <Video size={14} />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-auto p-4 border-t border-white/10">
                <Button variant="outline" className="w-full bg-white/5 border-white/10 text-xs" onClick={handleMuteAll}>
                  Silenciar Todos
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
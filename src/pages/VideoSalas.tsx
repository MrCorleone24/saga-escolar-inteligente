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
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Room {
  id: string;
  name: string;
  status: "online" | "offline";
  created_by: string;
}

export default function VideoSalas() {
  const queryClient = useQueryClient();
  const [inCall, setInCall] = useState(false);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
      if (data.user?.id) {
        supabase.from('profiles').select('role').eq('id', data.user.id).single()
          .then(({ data: profile }) => setUserRole(profile?.role || null));
      }
    });
  }, []);

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data, error } = await supabase.from('rooms').select('*').eq('is_active', true);
      if (error) throw error;
      return data as Room[];
    }
  });

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    const { error } = await supabase.from('rooms').insert({
      name: newRoomName,
      created_by: userId,
      status: 'online'
    });

    if (error) {
      toast.error("Erro ao criar sala");
      return;
    }

    setNewRoomName("");
    queryClient.invalidateQueries({ queryKey: ['rooms'] });
    toast.success("Sala criada com sucesso!");
  };

  const handleJoinRoom = (room: Room) => {
    setActiveRoom(room);
    setInCall(true);
    toast.success(`Entrando na sala: ${room.name}`);
  };

  if (inCall && activeRoom) {
    return (
      <div className="h-screen bg-black flex flex-col">
        <div className="flex items-center justify-between p-4 bg-[#1a1a1a] text-white border-b border-white/10">
          <div className="flex items-center gap-3">
            <h2 className="font-bold">{activeRoom.name}</h2>
            <Badge variant="outline" className="text-red-500 border-red-500 animate-pulse">AO VIVO</Badge>
          </div>
          <Button variant="destructive" onClick={() => setInCall(false)}>
            <PhoneOff className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
        <div className="flex-1">
          {/* Usando Jitsi Meet para a funcionalidade real de Video/Audio/Chat */}
          <iframe
            src={`https://meet.jit.si/${activeRoom.id.replace(/-/g, '')}#config.prejoinPageEnabled=false&interfaceConfig.TOOLBAR_BUTTONS=["microphone","camera","closedcaptions","desktop","embedview","fullscreen","fodeviceselection","hangup","profile","chat","recording","livestreaming","etherpad","sharedvideo","settings","raisehand","videoquality","filmstrip","invite","feedback","stats","shortcuts","tileview","videobackgroundblur","download","help","mute-everyone","security"]`}
            allow="camera; microphone; display-capture; autoplay; clipboard-write"
            style={{ width: '100%', height: '100%', border: '0' }}
          />
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout role={(userRole as any) || "aluno"} userName="Usuário" xp={0} level={1}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Salas de Aula Virtual</h1>
            <p className="text-muted-foreground">Ambiente seguro para aulas ao vivo e colaboração.</p>
          </div>
          {userRole === 'professor' && (
            <div className="flex gap-2">
              <Input 
                placeholder="Nome da sala..." 
                value={newRoomName} 
                onChange={e => setNewRoomName(e.target.value)} 
                className="max-w-[200px]"
              />
              <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleCreateRoom}>
                <Plus className="mr-2 h-4 w-4" /> Criar Sala
              </Button>
            </div>
          )}
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
                  <Badge className="bg-green-500/10 text-green-600 border-green-200">Online</Badge>
                </div>
                <h3 className="font-bold text-lg mb-1">{room.name}</h3>
                <p className="text-sm text-muted-foreground">ID da sala: {room.id.substring(0,8)}</p>
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
          {rooms.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl">
              <VideoOff className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p>Nenhuma sala ativa no momento.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

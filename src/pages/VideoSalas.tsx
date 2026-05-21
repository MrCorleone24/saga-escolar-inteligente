import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Video, Mic, MicOff, VideoOff, MessageSquare, Users, 
  Settings, PhoneOff, Plus, MoreVertical, Shield, 
  Hand, Share2, Maximize2, Send, X, Search,
  Lock, Unlock, UserMinus, VolumeX
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
  room_type: "classroom" | "administrative";
}

interface Participant {
  user_id: string;
  role: 'admin' | 'moderador' | 'participante';
  can_chat: boolean;
  can_audio: boolean;
  can_video: boolean;
  is_muted: boolean;
  hand_raised: boolean;
  profiles: {
    full_name: string;
    role: string;
  };
}

export default function VideoSalas() {
  const queryClient = useQueryClient();
  const [inCall, setInCall] = useState(false);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomType, setNewRoomType] = useState<"classroom" | "administrative">("classroom");
  const [showParticipants, setShowParticipants] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id || null);
      if (data.user?.id) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
        setUserRole(profile?.role || null);
      }
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('realtime_notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          toast.info(payload.new.title, {
            description: payload.new.message,
          });
        }
      )
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [userId]);

  useEffect(() => {
    if (!activeRoom || !inCall) return;

    const channel = supabase
      .channel(`room_moderation_${activeRoom.id}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'classroom_moderation', 
          filter: `room_id=eq.${activeRoom.id}` 
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['room_participants', activeRoom.id] });
        }
      )
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [activeRoom?.id, inCall, queryClient]);


  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data, error } = await supabase.from('rooms').select('*').eq('is_active', true);
      if (error) throw error;
      return data as Room[];
    }
  });

  const { data: participants = [] } = useQuery({
    queryKey: ['room_participants', activeRoom?.id],
    queryFn: async () => {
      if (!activeRoom) return [];
      const { data, error } = await supabase
        .from('classroom_moderation')
        .select('*, profiles(full_name, role)')
        .eq('room_id', activeRoom.id);
      if (error) throw error;
      return data as unknown as Participant[];
    },
    enabled: !!activeRoom && inCall
  });

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .insert({
        name: newRoomName,
        created_by: userId,
        status: 'online',
        room_type: newRoomType
      })
      .select()
      .single();

    if (roomError) {
      toast.error("Erro ao criar sala");
      return;
    }

    // Set creator as admin
    await supabase.from('classroom_moderation').insert({
      room_id: roomData.id,
      user_id: userId,
      role: 'admin',
      can_audio: true,
      can_video: true,
      can_chat: true
    });

    setNewRoomName("");
    queryClient.invalidateQueries({ queryKey: ['rooms'] });
    toast.success("Sala criada com sucesso!");
  };

  const handleJoinRoom = async (room: Room) => {
    // Check if moderation record exists, if not create as participante
    const { data: existing } = await supabase
      .from('classroom_moderation')
      .select('*')
      .eq('room_id', room.id)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      await supabase.from('classroom_moderation').insert({
        room_id: room.id,
        user_id: userId,
        role: userRole === 'professor' ? 'admin' : 'participante'
      });
    }

    setActiveRoom(room);
    setInCall(true);
    toast.success(`Entrando na sala: ${room.name}`);
  };

  const updateModeration = async (participantId: string, updates: Partial<Participant>) => {
    const { error } = await supabase
      .from('classroom_moderation')
      .update({ 
        is_muted: updates.is_muted, 
        can_chat: updates.can_chat,
        hand_raised: updates.hand_raised 
      })
      .eq('room_id', activeRoom?.id)
      .eq('user_id', participantId);

    if (error) toast.error("Erro ao atualizar moderação");
    else queryClient.invalidateQueries({ queryKey: ['room_participants'] });
  };

  const handleMuteAll = async () => {
    if (!activeRoom || !isAdmin) return;
    
    const otherParticipants = participants.filter(p => p.user_id !== userId);
    const promises = otherParticipants.map(p => 
      supabase
        .from('classroom_moderation')
        .update({ is_muted: true })
        .eq('room_id', activeRoom.id)
        .eq('user_id', p.user_id)
    );

    await Promise.all(promises);
    toast.success("Todos os alunos foram silenciados");
    queryClient.invalidateQueries({ queryKey: ['room_participants'] });
  };

  const toggleHandRaise = async () => {
    if (!userId || !activeRoom) return;
    const newState = !isHandRaised;
    setIsHandRaised(newState);
    await updateModeration(userId, { hand_raised: newState });
    toast.info(newState ? "Você levantou a mão" : "Você abaixou a mão");
  };

  const currentUserModeration = participants.find(p => p.user_id === userId);
  const isAdmin = currentUserModeration?.role === 'admin' || userRole === 'professor' || userRole === 'admin' || userRole === 'school';

  if (inCall && activeRoom) {
    return (
      <div className="h-screen bg-black flex flex-col">
        <div className="flex items-center justify-between p-4 bg-[#1a1a1a] text-white border-b border-white/10">
          <div className="flex items-center gap-3">
            <h2 className="font-bold">{activeRoom.name}</h2>
            <Badge variant="outline" className={`animate-pulse ${activeRoom.room_type === 'administrative' ? 'text-blue-400 border-blue-400' : 'text-red-500 border-red-500'}`}>
              {activeRoom.room_type === 'administrative' ? 'DIREÇÃO' : 'AO VIVO'}
            </Badge>
            {isAdmin && <Badge className="bg-blue-600">MODERADOR</Badge>}
          </div>
          <div className="flex items-center gap-2">
            {!isAdmin && (
              <Button 
                variant={isHandRaised ? "secondary" : "ghost"} 
                size="sm" 
                onClick={toggleHandRaise}
                className={isHandRaised ? "bg-amber-500 hover:bg-amber-600" : ""}
              >
                <Hand className={`h-5 w-5 ${isHandRaised ? "animate-bounce" : ""}`} />
                <span className="ml-2 hidden sm:inline">{isHandRaised ? "Mão Levantada" : "Levantar Mão"}</span>
              </Button>
            )}
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={handleMuteAll} className="text-red-400 border-red-400/30 hover:bg-red-400/10">
                <VolumeX className="mr-2 h-4 w-4" /> Silenciar Todos
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setShowParticipants(!showParticipants)}>
              <Users className="h-5 w-5" />
            </Button>
            <Button variant="destructive" onClick={() => setInCall(false)}>
              <PhoneOff className="mr-2 h-4 w-4" /> Sair
            </Button>
          </div>
        </div>
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 relative">
            <iframe
              src={`https://meet.jit.si/${activeRoom.id.replace(/-/g, '')}#config.prejoinPageEnabled=false&interfaceConfig.TOOLBAR_BUTTONS=["microphone","camera","closedcaptions","desktop","embedview","fullscreen","fodeviceselection","hangup","profile","chat","recording","livestreaming","etherpad","sharedvideo","settings","raisehand","videoquality","filmstrip","invite","feedback","stats","shortcuts","tileview","videobackgroundblur","download","help","mute-everyone","security"]`}
              allow="camera; microphone; display-capture; autoplay; clipboard-write"
              style={{ width: '100%', height: '100%', border: '0' }}
            />
          </div>

          <AnimatePresence>
            {showParticipants && (
              <motion.div 
                initial={{ x: 300 }}
                animate={{ x: 0 }}
                exit={{ x: 300 }}
                className="w-80 bg-[#1a1a1a] border-l border-white/10 text-white p-4 overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">Participantes ({participants.length})</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowParticipants(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {participants.map((p) => (
                    <div key={p.user_id} className="flex flex-col gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold relative ${p.user_id === userId ? 'bg-green-600' : 'bg-indigo-600'}`}>
                            {p.profiles?.full_name?.charAt(0) || 'U'}
                            {p.hand_raised && (
                              <motion.div 
                                initial={{ scale: 0 }} 
                                animate={{ scale: 1 }} 
                                className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5"
                              >
                                <Hand className="h-3 w-3 text-white" />
                              </motion.div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <p className="text-sm font-medium">{p.profiles?.full_name}</p>
                              {p.user_id === userId && <span className="text-[10px] opacity-50">(Você)</span>}
                            </div>
                            <p className="text-[10px] opacity-60 uppercase">{p.role}</p>
                          </div>
                        </div>
                        {isAdmin && (
                          <div className="flex items-center gap-1">
                            {p.hand_raised && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-amber-400"
                                onClick={() => updateModeration(p.user_id, { hand_raised: false })}
                              >
                                <Hand className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {p.user_id !== userId && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 text-red-400"
                                  onClick={() => updateModeration(p.user_id, { is_muted: !p.is_muted })}
                                >
                                  {p.is_muted ? <MicOff className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 text-amber-400"
                                  onClick={() => updateModeration(p.user_id, { can_chat: !p.can_chat })}
                                >
                                  {p.can_chat ? <MessageSquare className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
            <p className="text-muted-foreground">Ambiente seguro para aulas ao vivo e moderação em tempo real.</p>
          </div>
          {(userRole === 'professor' || userRole === 'admin' || userRole === 'school') && (
            <div className="flex flex-col gap-2 bg-card p-4 rounded-xl border border-dashed border-primary/50">
              <h3 className="font-semibold text-sm mb-1">Nova Sala</h3>
              <div className="flex gap-2">
                <Input 
                  placeholder="Nome da sala..." 
                  value={newRoomName} 
                  onChange={e => setNewRoomName(e.target.value)} 
                  className="flex-1"
                />
                <select 
                  className="bg-background border rounded px-2 text-sm"
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value as any)}
                >
                  <option value="classroom">Aula</option>
                  {(userRole === 'admin' || userRole === 'school') && (
                    <option value="administrative">Direção</option>
                  )}
                </select>
                <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleCreateRoom}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <motion.div
              key={room.id}
              whileHover={{ y: -4 }}
              className={`bg-card border rounded-xl overflow-hidden shadow-sm flex flex-col ${room.room_type === 'administrative' ? 'border-blue-200 shadow-blue-50' : ''}`}
            >
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg ${room.room_type === 'administrative' ? 'bg-blue-100' : 'bg-indigo-100'}`}>
                    {room.room_type === 'administrative' ? <Shield className="h-5 w-5 text-blue-600" /> : <Video className="h-5 w-5 text-indigo-600" />}
                  </div>
                  <Badge className={room.room_type === 'administrative' ? 'bg-blue-500/10 text-blue-600 border-blue-200' : 'bg-green-500/10 text-green-600 border-green-200'}>
                    {room.room_type === 'administrative' ? 'Sala da Direção' : 'Online'}
                  </Badge>
                </div>
                <h3 className="font-bold text-lg mb-1">{room.name}</h3>
                <p className="text-sm text-muted-foreground">ID da sala: {room.id.substring(0,8)}</p>
              </div>
              <div className="p-4 bg-muted/30 border-t">
                <Button 
                  className={`w-full ${room.room_type === 'administrative' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'}`} 
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

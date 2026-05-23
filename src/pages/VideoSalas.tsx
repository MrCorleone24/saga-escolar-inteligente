import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Video, Mic, MicOff, VideoOff, MessageSquare, Users, 
  Settings, PhoneOff, Plus, MoreVertical, Shield, 
  Hand, Share2, Maximize2, Send, X, Search,
  Lock, Unlock, UserMinus, VolumeX, ClipboardList, UserCheck, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AttendanceList from "@/components/presenca/AttendanceList";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface Room {
  id: string;
  name: string;
  status: "online" | "offline";
  created_by: string;
  room_type: "classroom" | "administrative" | "direction";
  school_id?: string;
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
  const { user, loading: userLoading } = useCurrentUser();
  const [inCall, setInCall] = useState(false);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomType, setNewRoomType] = useState<"classroom" | "administrative" | "direction">("classroom");
  const [rightPanel, setRightPanel] = useState<'participants' | 'attendance' | null>(null);
  const [isHandRaised, setIsHandRaised] = useState(false);
  
  const userId = user?.id;
  const userRole = user?.role?.toLowerCase();

  // Set up Realtime for moderation commands
  useEffect(() => {
    if (!activeRoom || !inCall || !userId) return;

    const channel = supabase.channel(`room-management:${activeRoom.id}`)
      .on('broadcast', { event: 'moderation' }, ({ payload }) => {
        if (payload.action === 'mute_all' && payload.targetId !== userId) {
          toast.info("O moderador silenciou todos.");
        }
        if (payload.action === 'kick' && payload.targetId === userId) {
          toast.error("Você foi removido da sala pelo moderador.");
          setInCall(false);
          setActiveRoom(null);
        }
        if (payload.action === 'private_call' && payload.targetId === userId) {
          toast.info(`${payload.fromName} iniciou uma conversa reservada.`);
          const privateRoomUrl = `https://meet.jit.si/EduBrasil-Private-${payload.roomId}-${userId}`;
          window.open(privateRoomUrl, '_blank', 'width=800,height=600');
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeRoom, inCall, userId]);

  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms', userId, userRole],
    queryFn: async () => {
      if (!userId) return [];
      let query = (supabase.from('rooms') as any).select('*').eq('is_active', true);
      
      if (userRole === 'admin') {
        // Admin vê tudo
      } else if (userRole === 'school') {
        query = query.eq('school_id', userId);
      } else if (['aluno', 'student'].includes(userRole || '')) {
        const { data: profile } = await supabase.from('profiles').select('school_id, teacher_id').eq('id', userId).single();
        if (profile) {
          query = query.or(`created_by.eq.${profile.school_id},created_by.eq.${profile.teacher_id},school_id.eq.${profile.school_id}`);
          query = query.neq('room_type', 'direction');
        }
      } else {
        query = query.or(`created_by.eq.${userId},school_id.eq.${user?.school_id}`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) return [];
      return data as Room[];
    },
    enabled: !!userId
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
    const { data: roomData, error } = await (supabase
      .from('rooms') as any)
      .insert({
        name: newRoomName,
        created_by: userId,
        school_id: userRole === 'school' ? userId : user?.school_id,
        status: 'online',
        room_type: newRoomType,
        is_active: true
      })
      .select().single();

    if (error) {
      toast.error("Erro ao criar sala");
      return;
    }

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
    toast.success("Sala criada!");
  };

  const handleJoinRoom = async (room: Room) => {
    const { data: existing } = await supabase
      .from('classroom_moderation')
      .select('*').eq('room_id', room.id).eq('user_id', userId).single();

    if (!existing) {
      await supabase.from('classroom_moderation').insert({
        room_id: room.id,
        user_id: userId,
        role: ['professor', 'teacher', 'admin', 'school'].includes(userRole || '') ? 'admin' : 'participante'
      });
    }
    setActiveRoom(room);
    setInCall(true);
  };

  const updateModeration = async (participantId: string, updates: any) => {
    const { profiles, ...cleanUpdates } = updates;
    await supabase.from('classroom_moderation').update(cleanUpdates).eq('room_id', activeRoom?.id).eq('user_id', participantId);
    queryClient.invalidateQueries({ queryKey: ['room_participants'] });
  };

  const broadcastModeration = async (action: string, targetId?: string) => {
    if (!activeRoom) return;
    const channel = supabase.channel(`room-management:${activeRoom.id}`);
    await channel.send({
      type: 'broadcast',
      event: 'moderation',
      payload: { action, targetId, roomId: activeRoom.id, fromName: 'Moderador' }
    });
    toast.success(`Comando enviado: ${action}`);
  };

  const handlePrivateCall = async (participant: Participant) => {
    if (!activeRoom) return;
    broadcastModeration('private_call', participant.user_id);
    window.open(`https://meet.jit.si/EduBrasil-Private-${activeRoom.id}-${(participant as any).user_id}`, '_blank');
  };

  const toggleHandRaise = async () => {
    if (!userId || !activeRoom) return;
    const newState = !isHandRaised;
    setIsHandRaised(newState);
    await updateModeration(userId, { hand_raised: newState });
  };

  const currentUserModeration = participants.find(p => (p as any).user_id === userId);
  const isModerator = (currentUserModeration as any)?.role === 'admin' || ['professor', 'teacher', 'admin', 'school', 'teacher_solo', 'teacher_institutional'].includes(userRole || '');
  const canCreate = ['professor', 'teacher', 'admin', 'school', 'teacher_solo', 'teacher_institutional'].includes(userRole || '');

  if (inCall && activeRoom) {
    return (
      <div className="h-screen bg-black flex flex-col">
        {/* Teams-like Header */}
        <div className="flex items-center justify-between p-4 bg-[#1a1a1a] text-white border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm">{activeRoom.name}</h2>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] h-4 border-green-500 text-green-500 uppercase">Ao Vivo</Badge>
                {isModerator && <Badge className="text-[10px] h-4 bg-primary uppercase">Moderador</Badge>}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isModerator && (
              <div className="flex items-center gap-1 border-r border-white/10 pr-2 mr-2">
                <Button variant="ghost" size="sm" className="h-8 text-xs hover:bg-white/10" onClick={() => broadcastModeration('mute_all')}>
                  <VolumeX className="h-4 w-4 mr-2" /> Silenciar Tudo
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs hover:bg-white/10" onClick={() => setRightPanel(rightPanel === 'attendance' ? null : 'attendance')}>
                  <UserCheck className="h-4 w-4 mr-2" /> Chamada
                </Button>
              </div>
            )}
            
            {!isModerator && (
              <Button variant={isHandRaised ? "secondary" : "ghost"} size="sm" className="h-8" onClick={toggleHandRaise}>
                <Hand className={`h-5 w-5 ${isHandRaised ? 'text-yellow-500' : ''}`} />
              </Button>
            )}
            
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setRightPanel(rightPanel === 'participants' ? null : 'participants')}>
              <Users className="h-5 w-5" />
            </Button>
            
            <Button variant="destructive" size="sm" className="h-8 font-bold" onClick={() => setInCall(false)}>
              <PhoneOff className="mr-2 h-4 w-4" /> Sair
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Video Area */}
          <div className="flex-1 bg-zinc-900 relative">
            <iframe
              src={`https://meet.jit.si/${activeRoom.id.replace(/-/g, '')}#config.prejoinPageEnabled=false&interfaceConfig.TOOLBAR_BUTTONS=["microphone","camera","closedcaptions","desktop","fullscreen","fittowindow","chat","raisehand","videoquality","filmstrip","shortcuts","tileview","videobackgroundblur","download","help","mute-everyone","security"]`}
              allow="camera; microphone; display-capture; autoplay; clipboard-write"
              style={{ width: '100%', height: '100%', border: '0' }}
            />
          </div>

          {/* Right Panels (Participants / Attendance) */}
          <AnimatePresence>
            {rightPanel && (
              <motion.div 
                initial={{ x: 300, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }} 
                exit={{ x: 300, opacity: 0 }} 
                className="w-80 bg-[#1a1a1a] border-l border-white/10 text-white flex flex-col"
              >
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2">
                    {rightPanel === 'participants' ? <><Users size={18} /> Participantes</> : <><ClipboardList size={18} /> Lista de Chamada</>}
                  </h3>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setRightPanel(null)}>
                    <X size={18} />
                  </Button>
                </div>

                <ScrollArea className="flex-1 p-4">
                  {rightPanel === 'participants' ? (
                    <div className="space-y-3">
                      {participants.map(p => (
                        <div key={(p as any).user_id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5 group">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                                {(p as any).profiles?.full_name?.charAt(0)}
                              </div>
                              {(p as any).hand_raised && (
                                <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5 animate-bounce">
                                  <Hand size={10} className="text-black" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-medium">{(p as any).profiles?.full_name}</p>
                              <p className="text-[10px] text-white/40">{(p as any).role}</p>
                            </div>
                          </div>
                          
                          {isModerator && (p as any).user_id !== userId && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-blue-400 hover:bg-blue-400/10" title="Chamada Reservada" onClick={() => handlePrivateCall(p as any)}>
                                <MessageSquare size={14} />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:bg-red-400/10" title="Remover" onClick={() => broadcastModeration('kick', (p as any).user_id)}>
                                <UserMinus size={14} />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <AttendanceList 
                      lessonId={activeRoom.id} 
                      lessonName={activeRoom.name}
                      students={participants.filter(p => (p as any).role === 'participante').map(p => ({
                        id: (p as any).user_id,
                        full_name: (p as any).profiles?.full_name
                      }))} 

                    />
                  )}
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (userLoading && !user) {
    return (
      <DashboardLayout role="admin" userName="Carregando...">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="h-12 w-full bg-muted animate-pulse rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-card border rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={(userRole as any) || "aluno"} userName={user?.full_name || "Usuário"}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Video className="text-primary h-8 w-8" />
              </div>
              Salas Virtuais
            </h1>
            <p className="text-muted-foreground mt-1">Gerencie suas aulas e reuniões em tempo real.</p>
          </div>
          
          {canCreate && (
            <div className="flex flex-wrap gap-2 items-center bg-card p-2 rounded-xl border shadow-sm">
              <Input 
                placeholder="Nome da sala..." 
                className="max-w-[200px] border-none bg-muted" 
                value={newRoomName} 
                onChange={e => setNewRoomName(e.target.value)} 
              />
              <Select value={newRoomType} onValueChange={(val: any) => setNewRoomType(val)}>
                <SelectTrigger className="w-[160px] border-none bg-muted h-10">
                  <SelectValue placeholder="Tipo de Sala" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classroom">Sala de Aula</SelectItem>
                  <SelectItem value="administrative">Administrativo</SelectItem>
                  {userRole === 'admin' && <SelectItem value="direction">Diretoria</SelectItem>}
                </SelectContent>
              </Select>
              <Button onClick={handleCreateRoom} className="gradient-hero text-white">
                <Plus className="h-4 w-4 mr-2" /> Criar Sala
              </Button>
            </div>
          )}
        </div>

        <Separator />

        {roomsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-card border rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(rooms as any[]).map(room => (
              <motion.div 
                key={room.id} 
                whileHover={{ y: -5 }}
                className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary/5 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                    <Video className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="border-green-500 text-green-500">ONLINE</Badge>
                </div>
                
                <h3 className="text-xl font-bold mb-1">{room.name}</h3>
                <p className="text-xs text-muted-foreground mb-6 uppercase tracking-wider">
                  {room.room_type === 'classroom' ? 'Sala de Aula' : room.room_type === 'administrative' ? 'Administrativo' : 'Diretoria'}
                </p>

                <Button 
                  className="w-full font-bold bg-primary hover:bg-primary/90 text-white" 
                  onClick={() => handleJoinRoom(room)}
                >
                  Entrar na Sala
                </Button>
              </motion.div>
            ))}
            {rooms.length === 0 && (
              <div className="col-span-full py-20 text-center bg-muted/20 rounded-3xl border-2 border-dashed border-border">
                <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-bold text-muted-foreground">Nenhuma sala ativa</h3>
                <p className="text-muted-foreground">Crie uma nova sala para começar.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

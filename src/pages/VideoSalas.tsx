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
  const [inCall, setInCall] = useState(false);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomType, setNewRoomType] = useState<"classroom" | "administrative" | "direction">("classroom");
  const [showParticipants, setShowParticipants] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id || null);
      if (data.user?.id) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
        setUserRole(profile?.role?.toLowerCase() || null);
      }
    };
    initAuth();
  }, []);

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms', userId, userRole],
    queryFn: async () => {
      let query = supabase.from('rooms').select('*').eq('is_active', true);
      
      if (['aluno', 'student'].includes(userRole || '')) {
        const { data: profile } = await supabase.from('profiles').select('school_id, teacher_id').eq('id', userId).single();
        if (profile) {
          query = query.or(`created_by.eq.${profile.school_id},created_by.eq.${profile.teacher_id}`);
          query = query.neq('room_type', 'direction');
        }
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
    const { data: roomData, error } = await supabase
      .from('rooms')
      .insert({
        name: newRoomName,
        created_by: userId,
        status: 'online',
        room_type: newRoomType
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

  const updateModeration = async (participantId: string, updates: Partial<Participant>) => {
    await supabase.from('classroom_moderation').update(updates).eq('room_id', activeRoom?.id).eq('user_id', participantId);
    queryClient.invalidateQueries({ queryKey: ['room_participants'] });
  };

  const toggleHandRaise = async () => {
    if (!userId || !activeRoom) return;
    const newState = !isHandRaised;
    setIsHandRaised(newState);
    await updateModeration(userId, { hand_raised: newState });
  };

  const currentUserModeration = participants.find(p => p.user_id === userId);
  const isAdmin = currentUserModeration?.role === 'admin' || ['professor', 'teacher', 'admin', 'school'].includes(userRole || '');
  const canCreate = ['professor', 'teacher', 'admin', 'school'].includes(userRole || '');
  const isSchoolAdmin = userRole === 'school' || userRole === 'admin';

  if (inCall && activeRoom) {
    return (
      <div className="h-screen bg-black flex flex-col">
        <div className="flex items-center justify-between p-4 bg-[#1a1a1a] text-white border-b border-white/10">
          <div className="flex items-center gap-3">
            <h2 className="font-bold">{activeRoom.name}</h2>
            {isAdmin && <Badge className="bg-blue-600">MODERADOR</Badge>}
          </div>
          <div className="flex items-center gap-2">
            {!isAdmin && (
              <Button variant={isHandRaised ? "secondary" : "ghost"} size="sm" onClick={toggleHandRaise}>
                <Hand className="h-5 w-5" />
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
          <iframe
            src={`https://meet.jit.si/${activeRoom.id.replace(/-/g, '')}#config.prejoinPageEnabled=false`}
            allow="camera; microphone; display-capture; autoplay; clipboard-write"
            style={{ width: '100%', height: '100%', border: '0' }}
          />
          <AnimatePresence>
            {showParticipants && (
              <motion.div initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: 300 }} className="w-80 bg-[#1a1a1a] border-l border-white/10 text-white p-4">
                <h3 className="font-bold mb-4">Participantes</h3>
                <div className="space-y-3">
                  {participants.map(p => (
                    <div key={p.user_id} className="flex items-center justify-between p-2 bg-white/5 rounded">
                      <span className="text-sm">{p.profiles?.full_name}</span>
                      {isAdmin && p.user_id !== userId && (
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400" onClick={() => updateModeration(p.user_id, { is_muted: !p.is_muted })}>
                          <VolumeX size={14} />
                        </Button>
                      )}
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
    <DashboardLayout role={(userRole as any) || "aluno"} userName="Usuário">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Video className="text-primary h-8 w-8" /> Salas Virtuais
          </h1>
          {canCreate && (
            <div className="flex gap-2">
              <Input placeholder="Nome da sala..." value={newRoomName} onChange={e => setNewRoomName(e.target.value)} />
              <Button onClick={handleCreateRoom} className="gradient-hero text-white">Criar</Button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => (
            <div key={room.id} className="bg-card border border-border p-5 rounded-xl">
              <h3 className="text-lg font-bold mb-4">{room.name}</h3>
              <Button className="w-full gradient-hero text-white" onClick={() => handleJoinRoom(room)}>Entrar</Button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, X, User as UserIcon, Medal, Users, Plus, LogOut, Copy, Check, Coins } from 'lucide-react';

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  users: any[];
  currentUserUid?: string;
  activeTab: 'global' | 'room';
  onTabChange: (tab: 'global' | 'room') => void;
  room: any | null;
  roomMembers: any[];
  onCreateRoom: (name: string) => void;
  onJoinRoom: (roomId: string) => void;
  onLeaveRoom: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ 
  isOpen, 
  onClose, 
  users, 
  currentUserUid,
  activeTab,
  onTabChange,
  room,
  roomMembers,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom
}) => {
  const [roomName, setRoomName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayUsers = activeTab === 'global' ? users : roomMembers;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-earth-brown/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-soft-cream w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/50 flex flex-col max-h-[85vh]"
          >
            <div className="p-8 pb-4 flex justify-between items-center border-b border-earth-brown/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-400/20 text-yellow-600 rounded-xl">
                  <Trophy size={24} />
                </div>
                <h3 className="text-2xl font-black text-earth-brown tracking-tight">Leaderboard</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-earth-brown/5 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex p-2 bg-earth-brown/5 mx-6 mt-4 rounded-2xl">
              <button
                onClick={() => onTabChange('global')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-bold transition-all ${
                  activeTab === 'global' ? 'bg-white text-forest-green shadow-sm' : 'text-earth-brown/40'
                }`}
              >
                <Trophy size={18} />
                Global
              </button>
              <button
                onClick={() => onTabChange('room')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-bold transition-all ${
                  activeTab === 'room' ? 'bg-white text-forest-green shadow-sm' : 'text-earth-brown/40'
                }`}
              >
                <Users size={18} />
                Room
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {activeTab === 'room' && !room ? (
                <div className="space-y-6 py-4">
                  <div className="bg-white/40 p-6 rounded-[2rem] border border-earth-brown/5">
                    <h4 className="font-black text-earth-brown mb-4 flex items-center gap-2">
                      <Plus size={18} className="text-forest-green" />
                      Create a Room
                    </h4>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="Room Name"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        className="flex-1 bg-white border-2 border-forest-green/10 rounded-xl px-4 py-2 font-medium focus:outline-none focus:border-forest-green/30"
                      />
                      <button 
                        onClick={() => {
                          if (roomName.trim()) {
                            onCreateRoom(roomName);
                            setRoomName('');
                          }
                        }}
                        className="bg-forest-green text-white px-4 py-2 rounded-xl font-bold hover:bg-forest-green/90 transition-all"
                      >
                        Create
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/40 p-6 rounded-[2rem] border border-earth-brown/5">
                    <h4 className="font-black text-earth-brown mb-4 flex items-center gap-2">
                      <Users size={18} className="text-forest-green" />
                      Join a Room
                    </h4>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="Room Code (e.g. ABC123)"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        className="flex-1 bg-white border-2 border-forest-green/10 rounded-xl px-4 py-2 font-medium focus:outline-none focus:border-forest-green/30"
                      />
                      <button 
                        onClick={() => {
                          if (joinCode.trim()) {
                            onJoinRoom(joinCode);
                            setJoinCode('');
                          }
                        }}
                        className="bg-forest-green text-white px-4 py-2 rounded-xl font-bold hover:bg-forest-green/90 transition-all"
                      >
                        Join
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {activeTab === 'room' && room && (
                    <div className="flex items-center justify-between bg-forest-green/5 p-4 rounded-2xl mb-4 border border-forest-green/10">
                      <div>
                        <h4 className="font-black text-forest-green">{room.name}</h4>
                        <button 
                          onClick={() => handleCopy(room.id)}
                          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-earth-brown/40 hover:text-forest-green transition-colors"
                        >
                          Code: {room.id}
                          {copied ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                      <button 
                        onClick={onLeaveRoom}
                        className="p-2 text-earth-brown/40 hover:text-red-500 transition-colors"
                        title="Leave Room"
                      >
                        <LogOut size={20} />
                      </button>
                    </div>
                  )}

                  {displayUsers.length === 0 ? (
                    <div className="text-center py-12 text-earth-brown/40">
                      <UserIcon size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="font-medium">No one here yet.</p>
                    </div>
                  ) : (
                    displayUsers.map((user, index) => (
                      <div 
                        key={user.uid}
                        className={`flex items-center gap-4 p-4 rounded-2xl transition-all border ${
                          user.uid === currentUserUid 
                            ? 'bg-forest-green/10 border-forest-green/20 shadow-sm' 
                            : 'bg-white/40 border-transparent hover:border-earth-brown/10'
                        }`}
                      >
                        <div className="w-8 flex justify-center font-black text-earth-brown/40">
                          {index === 0 ? <Medal className="text-yellow-500" size={20} /> : 
                           index === 1 ? <Medal className="text-gray-400" size={20} /> :
                           index === 2 ? <Medal className="text-amber-600" size={20} /> :
                           index + 1}
                        </div>
                        
                        <div className="w-10 h-10 rounded-full bg-forest-green/20 overflow-hidden flex items-center justify-center text-forest-green font-bold border border-forest-green/10">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            user.displayName?.charAt(0) || '?'
                          )}
                        </div>

                        <div className="flex-1">
                          <p className={`font-bold text-earth-brown truncate ${user.uid === currentUserUid ? 'text-forest-green' : ''}`}>
                            {user.displayName} {user.uid === currentUserUid && '(You)'}
                          </p>
                          <div className="flex items-center gap-3">
                            <p className="text-xs text-earth-brown/50 font-medium uppercase tracking-wider">
                              {user.totalFocusTime}m Focused
                            </p>
                            <div className="flex items-center gap-1 text-amber-600 text-[10px] font-bold uppercase">
                              <Coins size={10} />
                              {user.coins || 0}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-black text-forest-green leading-none">
                            {user.totalTreesGrown}
                          </p>
                          <p className="text-[10px] text-earth-brown/40 font-bold uppercase">Trees</p>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
            
            <div className="p-6 bg-earth-brown/5 text-center">
              <p className="text-xs text-earth-brown/40 font-bold uppercase tracking-widest">
                {activeTab === 'global' ? 'Grow more trees to climb the ranks!' : 'Compete with your friends!'}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

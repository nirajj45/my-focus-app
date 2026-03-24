import { useState, useEffect, useCallback } from 'react';
import { Timer } from './components/Timer';
import { ForestGrid } from './components/ForestGrid';
import { Stats } from './components/Stats';
import { Modal } from './components/Modal';
import { Leaderboard } from './components/Leaderboard';
import { Store } from './components/Store';
import { Tree, ForestStats, TreeSpecies } from './types';
import { Leaf, Trophy, LogIn, LogOut, User as UserIcon, ShoppingBag } from 'lucide-react';
import { TREE_SPECIES, COINS_PER_MINUTE } from './constants';
import { 
  auth, 
  db, 
  signInWithGoogle, 
  logout, 
  handleFirestoreError, 
  OperationType 
} from './lib/firebase';
import { 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc,
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  increment,
  runTransaction
} from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [leaderboardUsers, setLeaderboardUsers] = useState<any[]>([]);
  const [currentRoom, setCurrentRoom] = useState<any | null>(null);
  const [roomMembers, setRoomMembers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'global' | 'room'>('global');
  
  const [isFocusing, setIsFocusing] = useState(false);
  const [currentSessionDuration, setCurrentSessionDuration] = useState(0);
  const [selectedSpecies, setSelectedSpecies] = useState('oak');
  
  // Modal states
  const [isGiveUpModalOpen, setIsGiveUpModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Stats calculation
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      return;
    }
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        setUserProfile(doc.data());
      }
    });
    return unsubscribe;
  }, [user]);

  const stats: ForestStats = {
    grown: trees.filter(t => t.status === 'success').length,
    withered: trees.filter(t => t.status === 'withered').length,
    totalFocusTime: trees
      .filter(t => t.status === 'success')
      .reduce((acc, t) => acc + t.duration, 0),
    coins: userProfile?.coins || 0,
    unlockedTrees: userProfile?.unlockedTrees || ['oak'],
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
      
      if (u) {
        // Create/Update user profile in Firestore
        const userRef = doc(db, 'users', u.uid);
        setDoc(userRef, {
          uid: u.uid,
          displayName: u.displayName || 'Anonymous',
          photoURL: u.photoURL,
          lastActive: serverTimestamp(),
          coins: 0,
          unlockedTrees: ['oak'],
          totalTreesGrown: 0,
          totalFocusTime: 0
        }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${u.uid}`));
      }
    });
    return unsubscribe;
  }, []);

  // Sync Sessions from Firestore
  useEffect(() => {
    if (!user) {
      setTrees([]);
      return;
    }

    const sessionsRef = collection(db, 'users', user.uid, 'sessions');
    const q = query(sessionsRef, orderBy('timestamp', 'desc'), limit(100));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessionData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toMillis() || Date.now()
      })) as Tree[];
      setTrees(sessionData);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/sessions`));

    return unsubscribe;
  }, [user]);

  // Sync Global Leaderboard
  useEffect(() => {
    if (!user) {
      setLeaderboardUsers([]);
      return;
    }

    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('totalTreesGrown', 'desc'), limit(20));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leaders = snapshot.docs.map(doc => doc.data());
      setLeaderboardUsers(leaders);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));

    return unsubscribe;
  }, [user]);

  // Sync Room Data and Members
  useEffect(() => {
    if (!user || !currentRoom) {
      setRoomMembers([]);
      return;
    }

    const membersRef = collection(db, 'rooms', currentRoom.id, 'members');
    const q = query(membersRef, orderBy('totalTreesGrown', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const members = snapshot.docs.map(doc => doc.data());
      setRoomMembers(members);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `rooms/${currentRoom.id}/members`));

    return unsubscribe;
  }, [user, currentRoom]);

  const createRoom = async (name: string) => {
    if (!user) return;
    const roomId = Math.random().toString(36).substr(2, 6).toUpperCase();
    const roomRef = doc(db, 'rooms', roomId);
    const memberRef = doc(db, 'rooms', roomId, 'members', user.uid);

    try {
      await setDoc(roomRef, {
        id: roomId,
        name,
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });

      await setDoc(memberRef, {
        uid: user.uid,
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL,
        totalTreesGrown: stats.grown,
        totalFocusTime: stats.totalFocusTime,
        coins: stats.coins,
        joinedAt: serverTimestamp()
      });

      setCurrentRoom({ id: roomId, name });
      setActiveTab('room');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `rooms/${roomId}`);
    }
  };

  const joinRoom = async (roomId: string) => {
    if (!user) return;
    const roomRef = doc(db, 'rooms', roomId);
    const memberRef = doc(db, 'rooms', roomId, 'members', user.uid);

    try {
      const roomSnap = await getDoc(roomRef);
      if (!roomSnap.exists()) {
        setAlertMessage('Room not found! Please check the code.');
        setIsAlertModalOpen(true);
        return;
      }

      await setDoc(memberRef, {
        uid: user.uid,
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL,
        totalTreesGrown: stats.grown,
        totalFocusTime: stats.totalFocusTime,
        coins: stats.coins,
        joinedAt: serverTimestamp()
      });

      setCurrentRoom(roomSnap.data());
      setActiveTab('room');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `rooms/${roomId}/members/${user.uid}`);
    }
  };

  const leaveRoom = () => {
    setCurrentRoom(null);
    setActiveTab('global');
  };

  const addTree = useCallback(async (status: 'success' | 'withered', duration: number, species: string = 'oak') => {
    if (!user) return;

    const sessionId = Math.random().toString(36).substr(2, 9);
    const sessionRef = doc(db, 'users', user.uid, 'sessions', sessionId);
    const userRef = doc(db, 'users', user.uid);

    try {
      await runTransaction(db, async (transaction) => {
        // Add session
        transaction.set(sessionRef, {
          uid: user.uid,
          status,
          duration,
          species,
          timestamp: serverTimestamp()
        });

        // Update user stats if success
        if (status === 'success') {
          const earnedCoins = duration * COINS_PER_MINUTE;

          transaction.update(userRef, {
            totalTreesGrown: increment(1),
            totalFocusTime: increment(duration),
            coins: increment(earnedCoins),
            lastActive: serverTimestamp()
          });

          // Update room member stats if in a room
          if (currentRoom) {
            const memberRef = doc(db, 'rooms', currentRoom.id, 'members', user.uid);
            transaction.update(memberRef, {
              totalTreesGrown: increment(1),
              totalFocusTime: increment(duration),
              coins: increment(earnedCoins)
            });
          }
        } else {
          transaction.update(userRef, {
            lastActive: serverTimestamp()
          });
        }
      });
      
      setIsFocusing(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/sessions`);
    }
  }, [user, currentRoom]);

  const handlePurchase = async (species: TreeSpecies) => {
    if (!user || stats.coins < species.cost) return;

    const userRef = doc(db, 'users', user.uid);
    try {
      await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) return;

        const currentCoins = userSnap.data().coins || 0;
        const currentUnlocked = userSnap.data().unlockedTrees || ['oak'];

        if (currentCoins < species.cost) throw new Error('Insufficient coins');
        if (currentUnlocked.includes(species.id)) throw new Error('Already unlocked');

        transaction.update(userRef, {
          coins: currentCoins - species.cost,
          unlockedTrees: [...currentUnlocked, species.id]
        });
      });
      setAlertMessage(`Successfully purchased ${species.name}! 🌳`);
      setIsAlertModalOpen(true);
    } catch (err: any) {
      setAlertMessage(err.message || 'Purchase failed');
      setIsAlertModalOpen(true);
    }
  };

  const handleStart = (duration: number, species: string) => {
    if (!user) {
      setAlertMessage('Please sign in to start growing your forest!');
      setIsAlertModalOpen(true);
      return;
    }
    setIsFocusing(true);
    setCurrentSessionDuration(duration);
    setSelectedSpecies(species);
  };

  const handleGiveUp = () => {
    setIsGiveUpModalOpen(true);
  };

  const confirmGiveUp = () => {
    addTree('withered', currentSessionDuration, selectedSpecies);
    setIsGiveUpModalOpen(false);
  };

  const handleComplete = () => {
    addTree('success', currentSessionDuration, selectedSpecies);
    setAlertMessage(`Congratulations! You've grown a new tree and earned ${currentSessionDuration * COINS_PER_MINUTE} coins! 🌳`);
    setIsAlertModalOpen(true);
  };

  // Handle page visibility change (anti-cheat)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isFocusing) {
        addTree('withered', currentSessionDuration, selectedSpecies);
        setAlertMessage("You left the app! Your tree has withered. Stay focused next time! 🥀");
        setIsAlertModalOpen(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isFocusing, currentSessionDuration, addTree, selectedSpecies]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-cream">
        <div className="flex flex-col items-center gap-4">
          <Leaf className="text-forest-green animate-bounce" size={48} />
          <p className="text-earth-brown font-bold animate-pulse">Growing your forest...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 sm:px-6">
      <header className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <div className="bg-forest-green p-2 rounded-xl text-soft-cream">
              <Leaf size={32} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-forest-green">
              Evergreen Focus
            </h1>
          </div>
          <p className="text-earth-brown/60 font-medium">Stay focused, grow your forest.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsStoreOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-amber-500/10 rounded-2xl font-bold text-amber-600 hover:bg-amber-500/5 transition-all shadow-sm"
          >
            <ShoppingBag size={20} />
            Store
          </button>

          <button 
            onClick={() => setIsLeaderboardOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-forest-green/10 rounded-2xl font-bold text-forest-green hover:bg-forest-green/5 transition-all shadow-sm"
          >
            <Trophy size={20} />
            Leaderboard
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-forest-green/20 overflow-hidden border border-forest-green/10">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-forest-green">
                    <UserIcon size={20} />
                  </div>
                )}
              </div>
              <button 
                onClick={logout}
                className="p-3 bg-white border-2 border-earth-brown/10 rounded-2xl text-earth-brown/40 hover:text-red-500 hover:border-red-500/20 transition-all"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="flex items-center gap-2 px-6 py-3 bg-forest-green text-soft-cream rounded-2xl font-bold hover:bg-forest-green/90 transition-all shadow-lg shadow-forest-green/20"
            >
              <LogIn size={20} />
              Sign In
            </button>
          )}
        </div>
      </header>

      <main className="w-full flex flex-col items-center gap-12">
        <Timer 
          isFocusing={isFocusing} 
          onStart={handleStart} 
          onGiveUp={handleGiveUp} 
          onComplete={handleComplete} 
          unlockedTrees={stats.unlockedTrees}
        />
        
        <Stats stats={stats} />
        
        <ForestGrid trees={trees} />
      </main>

      <footer className="mt-20 text-earth-brown/40 text-sm font-medium">
        © {new Date().getFullYear()} Evergreen Focus • Built for Productivity
      </footer>

      {/* Modals */}
      <Modal
        isOpen={isGiveUpModalOpen}
        onClose={() => setIsGiveUpModalOpen(false)}
        onConfirm={confirmGiveUp}
        title="Give Up?"
        confirmText="Yes, Give Up"
        type="danger"
      >
        Are you sure you want to give up? Your seedling will wither and die. 🥀
      </Modal>

      <Modal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        title={user ? "Session Failed" : "Sign In Required"}
        confirmText={user ? "I Understand" : "Got it"}
      >
        {alertMessage}
      </Modal>

      <Leaderboard 
        isOpen={isLeaderboardOpen} 
        onClose={() => setIsLeaderboardOpen(false)} 
        users={leaderboardUsers}
        currentUserUid={user?.uid}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        room={currentRoom}
        roomMembers={roomMembers}
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        onLeaveRoom={leaveRoom}
      />

      <Store
        isOpen={isStoreOpen}
        onClose={() => setIsStoreOpen(false)}
        coins={stats.coins}
        unlockedTrees={stats.unlockedTrees}
        onPurchase={handlePurchase}
      />
    </div>
  );
}

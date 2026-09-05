import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import {
  writeDocumentToCloud,
  deleteDocumentFromCloud,
  uploadAllToCloud,
  subscribeToAllCollections,
  fetchFullCloudSnapshot,
  CasabuildCloudState
} from '../services/cloudSync';
import {
  UserRole,
  Project,
  Worker,
  AttendanceRecord,
  DailySiteReport,
  MaterialItem,
  MaterialTransaction,
  ExpenseRecord,
  Vendor,
  QuoteEstimate,
  InteriorSelectionItem,
  SitePhotoItem,
  UserProfile,
  CloudSyncStatus,
} from '../types';
import {
  INITIAL_PROJECTS,
  INITIAL_WORKERS,
  INITIAL_ATTENDANCE,
  INITIAL_DAILY_REPORTS,
  INITIAL_MATERIALS,
  INITIAL_TRANSACTIONS,
  INITIAL_EXPENSES,
  INITIAL_VENDORS,
  INITIAL_QUOTES,
  INITIAL_SELECTIONS,
  INITIAL_PHOTOS,
  INITIAL_USERS,
} from '../data/mockData';

interface CasabuildContextType {
  currentUser: UserProfile | null;
  users: UserProfile[];
  login: (email: string, password: string) => { success: boolean; error?: string };
  registerUser: (newUser: Omit<UserProfile, 'id'>) => { success: boolean; error?: string };
  logout: () => void;
  updateUserProfile: (id: string, updates: Partial<UserProfile>) => void;
  addUser: (u: Omit<UserProfile, 'id'>) => void;
  deleteUser: (id: string) => void;
  toggleUserDisabled: (id: string) => void;
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;
  activeProject: Project;
  projects: Project[];
  addProject: (p: Partial<Project>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  workers: Worker[];
  addWorker: (w: Partial<Worker>) => void;
  updateWorker: (id: string, updates: Partial<Worker>) => void;
  deleteWorker: (id: string) => void;
  toggleWorkerBlacklist: (id: string, reason?: string) => void;
  toggleWorkerDisabled: (id: string) => void;
  attendance: AttendanceRecord[];
  markAttendance: (workerId: string, status: 'Present' | 'Half Day' | 'Absent', workAssigned: string) => void;
  dailyReports: DailySiteReport[];
  addDailyReport: (r: Partial<DailySiteReport>) => void;
  materials: MaterialItem[];
  transactions: MaterialTransaction[];
  addMaterial: (m: Partial<MaterialItem>) => void;
  receiveMaterial: (materialId: string, qty: number, vendor: string, po: string, notes?: string) => void;
  consumeMaterial: (materialId: string, qty: number, projectId: string, notes?: string) => void;
  expenses: ExpenseRecord[];
  addExpense: (e: Partial<ExpenseRecord>) => void;
  vendors: Vendor[];
  addVendor: (v: Partial<Vendor>) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;
  toggleVendorBlacklist: (id: string, reason?: string) => void;
  toggleVendorDisabled: (id: string) => void;
  recordVendorPayment: (vendorId: string, amount: number, paymentMode: string) => void;
  settleVendorPayment?: (vendorId: string, amount: number, paymentMode?: string) => void;
  quotes: QuoteEstimate[];
  addQuote: (q: QuoteEstimate) => void;
  selections: InteriorSelectionItem[];
  interiorSelections: InteriorSelectionItem[];
  updateSelectionStatus: (id: string, status: 'Approved' | 'Pending' | 'Rejected') => void;
  updateInteriorSelection: (id: string, updates: Partial<InteriorSelectionItem>) => void;
  sitePhotos: SitePhotoItem[];
  addSitePhoto: (p: Partial<SitePhotoItem>) => void;
  resetToDefaults: () => void;
  cloudSyncStatus: CloudSyncStatus;
  firebaseUser: FirebaseUser | null;
  signInWithGoogle: () => Promise<void>;
  signOutGoogle: () => Promise<void>;
  syncAllToCloud: () => Promise<{ success: boolean; message: string }>;
  fetchLatestFromCloud: () => Promise<void>;
  lastCloudSyncTime: string | null;
  cloudSyncError: string | null;
}

const CasabuildContext = createContext<CasabuildContextType | null>(null);

const STORAGE_KEY = 'casabuild_erp_v3_state';

// Enforce rule: Ar. Aamir Khan (ar.khanaamir@gmail.com) is the ONLY system Owner
const normalizeOwnerRules = (userList: UserProfile[]): UserProfile[] => {
  return userList.map(u => {
    const isAamir = u.email.trim().toLowerCase() === 'ar.khanaamir@gmail.com';
    if (isAamir) {
      return {
        ...u,
        role: 'owner' as const,
        designation: u.designation || 'Managing Owner & Principal Architect'
      };
    }
    if (u.role === 'owner' && !isAamir) {
      return {
        ...u,
        role: 'architect' as const,
        designation: u.designation === 'Managing Director & Founder' ? 'Co-Director & Senior Project Architect' : u.designation
      };
    }
    return u;
  });
};

export const CasabuildProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Predefined users registry
  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
      const parsed: UserProfile[] = saved ? JSON.parse(saved) : INITIAL_USERS;
      return normalizeOwnerRules(parsed);
    } catch {
      return normalizeOwnerRules(INITIAL_USERS);
    }
  });

  // Current authenticated user profile
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_currentUser`);
      if (saved) {
        const u: UserProfile = JSON.parse(saved);
        return normalizeOwnerRules([u])[0];
      }
      return null;
    } catch {
      return null;
    }
  });

  const [currentRole, setRoleState] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_currentUser`);
      if (saved) {
        const u: UserProfile = JSON.parse(saved);
        const normalized = normalizeOwnerRules([u])[0];
        return normalized.role;
      }
    } catch {}
    return 'architect';
  });

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  const [activeProjectId, setActiveProjectId] = useState<string>('proj-1');

  // Load from local storage or defaults
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_projects`);
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  const [workers, setWorkers] = useState<Worker[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_workers`);
      return saved ? JSON.parse(saved) : INITIAL_WORKERS;
    } catch {
      return INITIAL_WORKERS;
    }
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_attendance`);
      return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
    } catch {
      return INITIAL_ATTENDANCE;
    }
  });

  const [dailyReports, setDailyReports] = useState<DailySiteReport[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_dailyReports`);
      return saved ? JSON.parse(saved) : INITIAL_DAILY_REPORTS;
    } catch {
      return INITIAL_DAILY_REPORTS;
    }
  });

  const [materials, setMaterials] = useState<MaterialItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_materials`);
      return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
    } catch {
      return INITIAL_MATERIALS;
    }
  });

  const [transactions, setTransactions] = useState<MaterialTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_expenses`);
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_vendors`);
      return saved ? JSON.parse(saved) : INITIAL_VENDORS;
    } catch {
      return INITIAL_VENDORS;
    }
  });

  const [quotes, setQuotes] = useState<QuoteEstimate[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_quotes`);
      return saved ? JSON.parse(saved) : INITIAL_QUOTES;
    } catch {
      return INITIAL_QUOTES;
    }
  });

  const [selections, setSelections] = useState<InteriorSelectionItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_selections`);
      return saved ? JSON.parse(saved) : INITIAL_SELECTIONS;
    } catch {
      return INITIAL_SELECTIONS;
    }
  });

  const [sitePhotos, setSitePhotos] = useState<SitePhotoItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_photos`);
      return saved ? JSON.parse(saved) : INITIAL_PHOTOS;
    } catch {
      return INITIAL_PHOTOS;
    }
  });

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_projects`, JSON.stringify(projects));
  }, [projects]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_workers`, JSON.stringify(workers));
  }, [workers]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_attendance`, JSON.stringify(attendance));
  }, [attendance]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_dailyReports`, JSON.stringify(dailyReports));
  }, [dailyReports]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_materials`, JSON.stringify(materials));
  }, [materials]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
  }, [transactions]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(expenses));
  }, [expenses]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_vendors`, JSON.stringify(vendors));
  }, [vendors]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_quotes`, JSON.stringify(quotes));
  }, [quotes]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_selections`, JSON.stringify(selections));
  }, [selections]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_photos`, JSON.stringify(sitePhotos));
  }, [sitePhotos]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(currentUser));
      setRoleState(currentUser.role);
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_currentUser`);
    }
  }, [currentUser]);

  // Firebase Cloud Synchronization State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('needs_login');
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string | null>(null);
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);

  // Monitor Firebase Authentication State
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        setCloudSyncStatus('synced');
        setLastCloudSyncTime(new Date().toLocaleTimeString());
      } else {
        setCloudSyncStatus('needs_login');
      }
    });
    return () => unsubAuth();
  }, []);

  // Real-time Firestore Cloud Subscriptions (multi-device listener)
  useEffect(() => {
    if (!firebaseUser) return;

    setCloudSyncStatus('syncing');
    const unsubCollections = subscribeToAllCollections(
      (updatedState) => {
        if (updatedState.projects && updatedState.projects.length > 0) {
          setProjects(updatedState.projects);
        }
        if (updatedState.workers && updatedState.workers.length > 0) {
          setWorkers(updatedState.workers);
        }
        if (updatedState.attendance && updatedState.attendance.length > 0) {
          setAttendance(updatedState.attendance);
        }
        if (updatedState.dailyReports && updatedState.dailyReports.length > 0) {
          setDailyReports(updatedState.dailyReports);
        }
        if (updatedState.materials && updatedState.materials.length > 0) {
          setMaterials(updatedState.materials);
        }
        if (updatedState.transactions && updatedState.transactions.length > 0) {
          setTransactions(updatedState.transactions);
        }
        if (updatedState.expenses && updatedState.expenses.length > 0) {
          setExpenses(updatedState.expenses);
        }
        if (updatedState.vendors && updatedState.vendors.length > 0) {
          setVendors(updatedState.vendors);
        }
        if (updatedState.quotes && updatedState.quotes.length > 0) {
          setQuotes(updatedState.quotes);
        }
        if (updatedState.selections && updatedState.selections.length > 0) {
          setSelections(updatedState.selections);
        }
        if (updatedState.sitePhotos && updatedState.sitePhotos.length > 0) {
          setSitePhotos(updatedState.sitePhotos);
        }
        if (updatedState.users && updatedState.users.length > 0) {
          setUsers(normalizeOwnerRules(updatedState.users));
        }
        setCloudSyncStatus('synced');
        setLastCloudSyncTime(new Date().toLocaleTimeString());
      },
      (err) => {
        console.warn('Realtime cloud sync error:', err);
        setCloudSyncStatus('error');
        setCloudSyncError(err.message || 'Cloud sync error');
      }
    );

    return () => unsubCollections();
  }, [firebaseUser]);

  const signInWithGoogle = async () => {
    setCloudSyncStatus('syncing');
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      setFirebaseUser(cred.user);
      setCloudSyncStatus('synced');
      setLastCloudSyncTime(new Date().toLocaleTimeString());

      // If user email matches or needs login, link:
      if (cred.user.email) {
        const email = cred.user.email.toLowerCase();
        const existing = users.find(u => u.email.toLowerCase() === email);
        if (existing) {
          setCurrentUser(existing);
          setRoleState(existing.role);
        } else {
          const isAamir = email === 'ar.khanaamir@gmail.com';
          const newU: UserProfile = {
            id: `usr-${Date.now()}`,
            name: cred.user.displayName || 'Casabuild User',
            email: cred.user.email,
            role: isAamir ? 'owner' : 'architect',
            designation: isAamir ? 'Managing Owner & Principal Architect' : 'Project Architect',
            phone: cred.user.phoneNumber || '+91 98100 12345',
            avatar: cred.user.photoURL || undefined,
            companyOrAffiliation: 'The Casabuild Group',
            assignedProjects: ['ALL'],
            permissions: ['Executive Full Control', 'Financials & BOQ', 'Site Operations'],
            status: 'Active',
            lastLogin: new Date().toISOString().replace('T', ' ').slice(0, 16)
          };
          setUsers(prev => [newU, ...prev]);
          setCurrentUser(newU);
          setRoleState(newU.role);
          writeDocumentToCloud('users', newU.id, newU);
        }
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setCloudSyncStatus('error');
      setCloudSyncError(err.message || 'Google authentication failed');
      throw err;
    }
  };

  const signOutGoogle = async () => {
    try {
      await signOut(auth);
      setFirebaseUser(null);
      setCloudSyncStatus('needs_login');
    } catch (err: any) {
      console.error('Google Sign-Out failed:', err);
    }
  };

  const syncAllToCloud = async (): Promise<{ success: boolean; message: string }> => {
    if (!auth.currentUser) {
      return { success: false, message: 'Please sign in with Google first to authorize cloud synchronization.' };
    }
    setCloudSyncStatus('syncing');
    try {
      const currentState: CasabuildCloudState = {
        projects,
        workers,
        attendance,
        dailyReports,
        materials,
        transactions,
        expenses,
        vendors,
        quotes,
        selections,
        sitePhotos,
        users
      };
      const res = await uploadAllToCloud(currentState);
      setLastCloudSyncTime(new Date().toLocaleTimeString());
      setCloudSyncStatus('synced');
      return { success: true, message: `Successfully synchronized ${res.count} records to Firebase Firestore Cloud!` };
    } catch (err: any) {
      console.error('Cloud upload error:', err);
      setCloudSyncStatus('error');
      setCloudSyncError(err.message || 'Failed to sync to cloud');
      return { success: false, message: err.message || 'Failed to sync records to cloud' };
    }
  };

  const fetchLatestFromCloud = async () => {
    if (!auth.currentUser) return;
    setCloudSyncStatus('syncing');
    try {
      const cloudData = await fetchFullCloudSnapshot();
      if (cloudData.projects && cloudData.projects.length) setProjects(cloudData.projects);
      if (cloudData.workers && cloudData.workers.length) setWorkers(cloudData.workers);
      if (cloudData.attendance && cloudData.attendance.length) setAttendance(cloudData.attendance);
      if (cloudData.dailyReports && cloudData.dailyReports.length) setDailyReports(cloudData.dailyReports);
      if (cloudData.materials && cloudData.materials.length) setMaterials(cloudData.materials);
      if (cloudData.transactions && cloudData.transactions.length) setTransactions(cloudData.transactions);
      if (cloudData.expenses && cloudData.expenses.length) setExpenses(cloudData.expenses);
      if (cloudData.vendors && cloudData.vendors.length) setVendors(cloudData.vendors);
      if (cloudData.quotes && cloudData.quotes.length) setQuotes(cloudData.quotes);
      if (cloudData.selections && cloudData.selections.length) setSelections(cloudData.selections);
      if (cloudData.sitePhotos && cloudData.sitePhotos.length) setSitePhotos(cloudData.sitePhotos);
      if (cloudData.users && cloudData.users.length) setUsers(normalizeOwnerRules(cloudData.users));

      setLastCloudSyncTime(new Date().toLocaleTimeString());
      setCloudSyncStatus('synced');
    } catch (err: any) {
      setCloudSyncStatus('error');
      setCloudSyncError(err.message || 'Fetch failed');
      throw err;
    }
  };

  // Authentication & Profile Services
  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.trim().toLowerCase() === cleanEmail);

    if (!user) {
      return {
        success: false,
        error: `No registered Casabuild ERP profile found for "${email.trim()}". Please verify your email or register a new profile.`
      };
    }

    if (user.disabled || user.status === 'Disabled') {
      return {
        success: false,
        error: 'This account has been disabled by Managing Owner Ar. Aamir Khan. Access to Casabuild ERP is currently suspended.'
      };
    }

    if (user.password && user.password !== password) {
      return {
        success: false,
        error: 'Incorrect password. Please verify your credentials or select a predefined demo account.'
      };
    }

    const updatedUser: UserProfile = {
      ...user,
      lastLogin: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    setRoleState(updatedUser.role);
    return { success: true };
  };

  const registerUser = (newUser: Omit<UserProfile, 'id'>): { success: boolean; error?: string } => {
    const cleanEmail = newUser.email.trim().toLowerCase();
    const existing = users.find(u => u.email.trim().toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, error: 'A user profile with this email address already exists in the system.' };
    }

    // Only Ar. Aamir Khan can hold owner role
    const assignedRole: UserRole = (cleanEmail === 'ar.khanaamir@gmail.com') 
      ? 'owner' 
      : (newUser.role === 'owner' ? 'architect' : newUser.role);

    const defaultPermissionsMap: Record<UserRole, string[]> = {
      owner: [
        'Full Administrative & Master ERP Access',
        'Contract Approvals & Financial Authorizations',
        'Vendor Disbursements & Payment Approvals',
        'User Provisioning & Role Governance',
        'Auditing & Statutory Compliance'
      ],
      architect: [
        'Architectural & Interior Drawings Management',
        'BOQ & Construction Cost Estimation',
        'Interior Selection & Finish Specifications',
        'Client Design Reviews & Presentations',
        'Site Photo Journal & Quality Inspection',
        'Executive Progress Reporting'
      ],
      supervisor: [
        'Daily Site Reports (DSR) Logging',
        'Workforce Muster Roll & Biometric Attendance',
        'Material Inward Gate Entry & Consumption Logs',
        'Site Progress Photo Documentation',
        'Safety & Quality Checklists'
      ],
      accountant: [
        'Vendor Ledger & Outstanding Aging',
        'Worker Wage & Advance Settlement',
        'NEFT, RTGS & UPI Disbursements',
        'GST Invoice Audit & Input Tax Credit',
        'Project Budget Overrun Tracking'
      ],
      contractor: [
        'Assigned Workforce Attendance Verification',
        'Daily Structural Concrete & Brickwork Logs',
        'Subcontractor Task Completion Updates',
        'Material Indent Submission'
      ],
      client: [
        'View Real-Time Project Milestone Progress',
        'Inspect HD Site Photo Timeline & Video Feeds',
        'Approve / Request Revisions on Interior Selections',
        'Download Verified Payment Receipts & Milestone Certificates'
      ]
    };

    const userToSave: UserProfile = {
      ...newUser,
      role: assignedRole,
      id: `usr-${Date.now()}`,
      email: newUser.email.trim(),
      permissions: newUser.permissions && newUser.permissions.length > 0 
        ? newUser.permissions 
        : defaultPermissionsMap[assignedRole] || ['Standard Workspace Access'],
      assignedProjects: newUser.assignedProjects && newUser.assignedProjects.length > 0
        ? newUser.assignedProjects
        : ['ALL'],
      lastLogin: new Date().toISOString().replace('T', ' ').slice(0, 16),
      disabled: false,
      status: 'Active'
    };

    setUsers(prev => [userToSave, ...prev]);
    setCurrentUser(userToSave);
    setRoleState(userToSave.role);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(`${STORAGE_KEY}_currentUser`);
  };

  const updateUserProfile = (id: string, updates: Partial<UserProfile>) => {
    const target = users.find(u => u.id === id);
    let safeUpdates = { ...updates };

    // Prevent granting owner role to anyone other than Ar. Aamir Khan
    if (safeUpdates.role === 'owner') {
      const emailToCheck = safeUpdates.email || target?.email || '';
      if (emailToCheck.trim().toLowerCase() !== 'ar.khanaamir@gmail.com') {
        safeUpdates.role = 'architect';
      }
    }

    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...safeUpdates } : u)));
    if (currentUser && currentUser.id === id) {
      const updated = { ...currentUser, ...safeUpdates };
      setCurrentUser(updated);
      if (safeUpdates.role) {
        setRoleState(safeUpdates.role);
      }
    }
  };

  const toggleUserDisabled = (id: string) => {
    const target = users.find(u => u.id === id);
    if (target && target.email.trim().toLowerCase() === 'ar.khanaamir@gmail.com') {
      return; // Cannot disable the Managing Owner
    }
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const nextDisabled = !u.disabled;
        return {
          ...u,
          disabled: nextDisabled,
          status: nextDisabled ? 'Disabled' : 'Active'
        };
      }
      return u;
    }));
  };

  const addUser = (u: Omit<UserProfile, 'id'>) => {
    registerUser(u);
  };

  const deleteUser = (id: string) => {
    const target = users.find(u => u.id === id);
    if (target && target.email.trim().toLowerCase() === 'ar.khanaamir@gmail.com') {
      return; // Cannot delete the Managing Owner
    }
    setUsers(prev => prev.filter(u => u.id !== id));
    if (currentUser && currentUser.id === id) {
      logout();
    }
  };

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || INITIAL_PROJECTS[0];

  const addProject = (p: Partial<Project>) => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: p.name || 'New Casabuild Project',
      code: p.code || `CB-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`,
      clientName: p.clientName || 'Private Client',
      clientPhone: p.clientPhone || '',
      clientEmail: p.clientEmail || '',
      location: p.location || 'Gurugram',
      type: p.type || 'Turnkey',
      status: p.status || 'Active',
      startDate: p.startDate || new Date().toISOString().split('T')[0],
      expectedCompletion: p.expectedCompletion || '',
      contractValue: Number(p.contractValue) || 5000000,
      budget: Number(p.budget) || 4500000,
      totalSpent: 0,
      overallProgress: 0,
      areaSqFt: Number(p.areaSqFt) || 2500,
      coverImage: p.coverImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      milestones: p.milestones || [
        { id: `m-${Date.now()}-1`, title: 'Mobilization & Layout Marking', phase: 'Planning', startDate: new Date().toISOString().split('T')[0], endDate: '', progress: 0, status: 'Upcoming' },
        { id: `m-${Date.now()}-2`, title: 'Structural Works', phase: 'Structure', startDate: '', endDate: '', progress: 0, status: 'Upcoming' },
        { id: `m-${Date.now()}-3`, title: 'Services & Finishes', phase: 'Finishes', startDate: '', endDate: '', progress: 0, status: 'Upcoming' },
      ],
      drawings: [],
      boq: []
    };
    setProjects(prev => [newProj, ...prev]);
    setActiveProjectId(newProj.id);
    writeDocumentToCloud('projects', newProj.id, newProj);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      const updated = next.find(p => p.id === id);
      if (updated) writeDocumentToCloud('projects', id, updated);
      return next;
    });
  };

  const addWorker = (w: Partial<Worker>) => {
    const newWorker: Worker = {
      id: `w-${Date.now()}`,
      name: w.name || 'Worker Name',
      trade: w.trade || 'Mason',
      phone: w.phone || '+91 98000 00000',
      photo: w.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      dailyWage: Number(w.dailyWage) || 850,
      totalDaysWorked: 0,
      advanceReceived: 0,
      pendingWage: 0,
      status: 'Active'
    };
    setWorkers(prev => [...prev, newWorker]);
    writeDocumentToCloud('workers', newWorker.id, newWorker);
  };

  const updateWorker = (id: string, updates: Partial<Worker>) => {
    setWorkers(prev => {
      const next = prev.map(w => w.id === id ? { ...w, ...updates } : w);
      const updated = next.find(w => w.id === id);
      if (updated) writeDocumentToCloud('workers', id, updated);
      return next;
    });
  };

  const deleteWorker = (id: string) => {
    setWorkers(prev => prev.filter(w => w.id !== id));
    deleteDocumentFromCloud('workers', id);
  };

  const toggleWorkerBlacklist = (id: string, reason?: string) => {
    setWorkers(prev => {
      const next = prev.map(w => {
        if (w.id === id) {
          const nextBlacklisted = !w.isBlacklisted;
          return {
            ...w,
            isBlacklisted: nextBlacklisted,
            blacklistReason: nextBlacklisted ? (reason || 'Flagged and blacklisted by Managing Owner Ar. Aamir Khan.') : undefined,
            status: nextBlacklisted ? 'Inactive' : 'Active',
            disabled: nextBlacklisted ? true : w.disabled
          };
        }
        return w;
      });
      const updated = next.find(w => w.id === id);
      if (updated) writeDocumentToCloud('workers', id, updated);
      return next;
    });
  };

  const toggleWorkerDisabled = (id: string) => {
    setWorkers(prev => {
      const next = prev.map(w => {
        if (w.id === id) {
          const nextDisabled = !w.disabled;
          return {
            ...w,
            disabled: nextDisabled,
            status: nextDisabled ? 'Inactive' : 'Active'
          };
        }
        return w;
      });
      const updated = next.find(w => w.id === id);
      if (updated) writeDocumentToCloud('workers', id, updated);
      return next;
    });
  };

  const markAttendance = (workerId: string, status: 'Present' | 'Half Day' | 'Absent', workAssigned: string) => {
    const today = new Date().toISOString().split('T')[0];
    const worker = workers.find(w => w.id === workerId);
    if (!worker) return;

    const rate = worker.dailyWage;
    const payable = status === 'Present' ? rate : status === 'Half Day' ? Math.round(rate / 2) : 0;

    // Check if existing record today
    let finalRecord: AttendanceRecord;
    setAttendance(prev => {
      const existingIdx = prev.findIndex(a => a.workerId === workerId && a.date === today);
      const newRec: AttendanceRecord = {
        id: existingIdx >= 0 ? prev[existingIdx].id : `att-${Date.now()}-${workerId}`,
        workerId,
        workerName: worker.name,
        trade: worker.trade,
        date: today,
        status,
        workAssigned,
        dailyWage: rate,
        payableAmount: payable,
        projectId: activeProjectId
      };
      finalRecord = newRec;

      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newRec;
        return copy;
      }
      return [newRec, ...prev];
    });

    writeDocumentToCloud('attendance', finalRecord!.id, finalRecord!);

    // Update worker totals
    setWorkers(prev => {
      const next = prev.map(w => {
        if (w.id === workerId) {
          const addedDays = status === 'Present' ? 1 : status === 'Half Day' ? 0.5 : 0;
          return {
            ...w,
            totalDaysWorked: Math.max(0, w.totalDaysWorked + (addedDays > 0 ? 1 : 0)),
            pendingWage: Math.max(0, w.pendingWage + payable)
          };
        }
        return w;
      });
      const updatedWorker = next.find(w => w.id === workerId);
      if (updatedWorker) writeDocumentToCloud('workers', workerId, updatedWorker);
      return next;
    });
  };

  const addDailyReport = (r: Partial<DailySiteReport>) => {
    const newDSR: DailySiteReport = {
      id: `dsr-${Date.now()}`,
      projectId: r.projectId || activeProjectId,
      projectName: activeProject.name,
      date: r.date || new Date().toISOString().split('T')[0],
      weather: r.weather || 'Sunny',
      temperature: r.temperature || '28°C',
      workersCount: Number(r.workersCount) || attendance.filter(a => a.status === 'Present').length || 20,
      todaysWork: r.todaysWork || '',
      progressPercentage: Number(r.progressPercentage) || activeProject.overallProgress,
      issues: r.issues || 'None reported.',
      issueSeverity: r.issueSeverity || 'None',
      tomorrowPlan: r.tomorrowPlan || '',
      photos: r.photos || [],
      supervisorName: r.supervisorName || 'Site Supervisor',
      status: 'Submitted'
    };

    setDailyReports(prev => [newDSR, ...prev]);
    writeDocumentToCloud('dailyReports', newDSR.id, newDSR);

    // Update overall project progress
    if (r.progressPercentage !== undefined) {
      updateProject(activeProjectId, { overallProgress: Number(r.progressPercentage) });
    }
  };

  const addMaterial = (m: Partial<MaterialItem>) => {
    const newMat: MaterialItem = {
      id: `mat-${Date.now()}`,
      name: m.name || 'New Material',
      category: m.category || 'Cement & Aggregates',
      currentBalance: Number(m.currentBalance) || 0,
      unit: m.unit || 'Nos',
      minThreshold: Number(m.minThreshold) || 10,
      status: (Number(m.currentBalance) || 0) <= (Number(m.minThreshold) || 10) ? 'Low Stock' : 'In Stock',
      supplierName: m.supplierName || 'General Supplier',
      unitCost: Number(m.unitCost) || 0,
      lastRestockedDate: new Date().toISOString().split('T')[0]
    };
    setMaterials(prev => [...prev, newMat]);
    writeDocumentToCloud('materials', newMat.id, newMat);
  };

  const receiveMaterial = (materialId: string, qty: number, vendor: string, po: string, notes?: string) => {
    const mat = materials.find(m => m.id === materialId);
    if (!mat) return;

    const newBalance = mat.currentBalance + qty;
    const newStatus = newBalance <= mat.minThreshold ? (newBalance <= mat.minThreshold / 2 ? 'Critical' : 'Low Stock') : 'In Stock';

    const updatedMat = {
      ...mat,
      currentBalance: newBalance,
      status: newStatus,
      lastRestockedDate: new Date().toISOString().split('T')[0]
    };
    setMaterials(prev => prev.map(m => m.id === materialId ? updatedMat : m));
    writeDocumentToCloud('materials', materialId, updatedMat);

    const newTx: MaterialTransaction = {
      id: `tx-${Date.now()}`,
      materialId,
      materialName: mat.name,
      type: 'INWARD',
      quantity: qty,
      unit: mat.unit,
      date: new Date().toISOString().split('T')[0],
      vendorName: vendor,
      poNumber: po,
      notes
    };
    setTransactions(prev => [newTx, ...prev]);
    writeDocumentToCloud('materialTransactions', newTx.id, newTx);

    // Add expense record automatically
    const totalCost = qty * mat.unitCost;
    if (totalCost > 0) {
      addExpense({
        projectId: activeProjectId,
        category: 'Material Purchase',
        vendorPayee: vendor || mat.supplierName,
        amount: totalCost,
        paymentMode: 'Bank Transfer / NEFT',
        receiptNumber: po || `RCV-${Date.now()}`,
        status: 'Submitted',
        paidBy: 'Site Engineer',
        notes: `Inward receipt of ${qty} ${mat.unit} of ${mat.name}`
      });
    }
  };

  const consumeMaterial = (materialId: string, qty: number, projectId: string, notes?: string) => {
    const mat = materials.find(m => m.id === materialId);
    if (!mat) return;

    const newBalance = Math.max(0, mat.currentBalance - qty);
    const newStatus = newBalance <= mat.minThreshold ? (newBalance <= mat.minThreshold / 2 ? 'Critical' : 'Low Stock') : 'In Stock';

    const updatedMat = {
      ...mat,
      currentBalance: newBalance,
      status: newStatus
    };
    setMaterials(prev => prev.map(m => m.id === materialId ? updatedMat : m));
    writeDocumentToCloud('materials', materialId, updatedMat);

    const newTx: MaterialTransaction = {
      id: `tx-${Date.now()}`,
      materialId,
      materialName: mat.name,
      type: 'CONSUMPTION',
      quantity: qty,
      unit: mat.unit,
      date: new Date().toISOString().split('T')[0],
      projectId,
      notes
    };
    setTransactions(prev => [newTx, ...prev]);
    writeDocumentToCloud('materialTransactions', newTx.id, newTx);
  };

  const addExpense = (e: Partial<ExpenseRecord>) => {
    const newExp: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      projectId: e.projectId || activeProjectId,
      projectName: activeProject.name,
      date: e.date || new Date().toISOString().split('T')[0],
      category: e.category || 'Material Purchase',
      vendorPayee: e.vendorPayee || 'Vendor Name',
      amount: Number(e.amount) || 0,
      paymentMode: e.paymentMode || 'UPI',
      receiptNumber: e.receiptNumber || `RCP-${Math.floor(1000 + Math.random() * 9000)}`,
      status: e.status || 'Paid',
      paidBy: e.paidBy || 'Finance Dept',
      receiptImage: e.receiptImage,
      notes: e.notes
    };
    setExpenses(prev => [newExp, ...prev]);
    writeDocumentToCloud('expenses', newExp.id, newExp);

    // Update active project's totalSpent
    if (e.projectId === activeProjectId || !e.projectId) {
      updateProject(activeProjectId, {
        totalSpent: activeProject.totalSpent + (Number(e.amount) || 0)
      });
    }
  };

  const addVendor = (v: Partial<Vendor>) => {
    const newVendor: Vendor = {
      id: `v-${Date.now()}`,
      name: v.name || 'New Vendor',
      category: v.category || 'Material Supplier',
      contactPerson: v.contactPerson || '',
      phone: v.phone || '',
      email: v.email,
      address: v.address,
      gstin: v.gstin,
      totalBilled: Number(v.totalBilled) || 0,
      totalPaid: Number(v.totalPaid) || 0,
      balanceOutstanding: Number(v.balanceOutstanding) || 0,
      status: 'Active',
      isBlacklisted: false,
      disabled: false
    };
    setVendors(prev => [...prev, newVendor]);
    writeDocumentToCloud('vendors', newVendor.id, newVendor);
  };

  const updateVendor = (id: string, updates: Partial<Vendor>) => {
    setVendors(prev => {
      const next = prev.map(v => v.id === id ? { ...v, ...updates } : v);
      const updated = next.find(v => v.id === id);
      if (updated) writeDocumentToCloud('vendors', id, updated);
      return next;
    });
  };

  const deleteVendor = (id: string) => {
    setVendors(prev => prev.filter(v => v.id !== id));
    deleteDocumentFromCloud('vendors', id);
  };

  const toggleVendorBlacklist = (id: string, reason?: string) => {
    setVendors(prev => {
      const next = prev.map(v => {
        if (v.id === id) {
          const nextBlacklisted = !v.isBlacklisted;
          return {
            ...v,
            isBlacklisted: nextBlacklisted,
            blacklistReason: nextBlacklisted ? (reason || 'Disqualified and blacklisted by Managing Owner Ar. Aamir Khan.') : undefined,
            disabled: nextBlacklisted ? true : v.disabled
          };
        }
        return v;
      });
      const updated = next.find(v => v.id === id);
      if (updated) writeDocumentToCloud('vendors', id, updated);
      return next;
    });
  };

  const toggleVendorDisabled = (id: string) => {
    setVendors(prev => {
      const next = prev.map(v => {
        if (v.id === id) {
          const nextDisabled = !v.disabled;
          return {
            ...v,
            disabled: nextDisabled
          };
        }
        return v;
      });
      const updated = next.find(v => v.id === id);
      if (updated) writeDocumentToCloud('vendors', id, updated);
      return next;
    });
  };

  const recordVendorPayment = (vendorId: string, amount: number, paymentMode: string) => {
    setVendors(prev => {
      const next = prev.map(v => {
        if (v.id === vendorId) {
          const newPaid = v.totalPaid + amount;
          const newBal = Math.max(0, v.balanceOutstanding - amount);
          return {
            ...v,
            totalPaid: newPaid,
            balanceOutstanding: newBal,
            status: newBal === 0 ? 'Active' : 'Pending Settlement'
          };
        }
        return v;
      });
      const updated = next.find(v => v.id === vendorId);
      if (updated) writeDocumentToCloud('vendors', vendorId, updated);
      return next;
    });

    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) {
      addExpense({
        projectId: activeProjectId,
        category: 'Subcontractor',
        vendorPayee: vendor.name,
        amount,
        paymentMode: paymentMode as any || 'Bank Transfer / NEFT',
        receiptNumber: `PAY-${Date.now()}`,
        status: 'Paid',
        paidBy: 'Accountant',
        notes: `Vendor ledger settlement for ${vendor.name}`
      });
    }
  };

  const addQuote = (q: QuoteEstimate) => {
    setQuotes(prev => [q, ...prev]);
    writeDocumentToCloud('quotes', q.id, q);
  };

  const updateSelectionStatus = (id: string, status: 'Approved' | 'Pending' | 'Rejected') => {
    setSelections(prev => {
      const next = prev.map(s => s.id === id ? {
        ...s,
        status,
        clientApprovedDate: status === 'Approved' ? new Date().toISOString().split('T')[0] : undefined
      } : s);
      const updated = next.find(s => s.id === id);
      if (updated) writeDocumentToCloud('interiorSelections', id, updated);
      return next;
    });
  };

  const updateInteriorSelection = (id: string, updates: Partial<InteriorSelectionItem>) => {
    setSelections(prev => {
      const next = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      const updated = next.find(s => s.id === id);
      if (updated) writeDocumentToCloud('interiorSelections', id, updated);
      return next;
    });
  };

  const addSitePhoto = (p: Partial<SitePhotoItem>) => {
    const newPhoto: SitePhotoItem = {
      id: `photo-${Date.now()}`,
      projectId: p.projectId || activeProjectId,
      date: p.date || new Date().toISOString().split('T')[0],
      locationTag: p.locationTag || 'General Site',
      activityTag: p.activityTag || 'Construction Progress',
      imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
      caption: p.caption || 'Daily site activity snapshot',
      uploadedBy: p.uploadedBy || 'Supervisor',
      phase: p.phase || 'Civil'
    };
    setSitePhotos(prev => [newPhoto, ...prev]);
    writeDocumentToCloud('sitePhotos', newPhoto.id, newPhoto);
  };

  const resetToDefaults = () => {
    localStorage.clear();
    setProjects(INITIAL_PROJECTS);
    setWorkers(INITIAL_WORKERS);
    setAttendance(INITIAL_ATTENDANCE);
    setDailyReports(INITIAL_DAILY_REPORTS);
    setMaterials(INITIAL_MATERIALS);
    setTransactions(INITIAL_TRANSACTIONS);
    setExpenses(INITIAL_EXPENSES);
    setVendors(INITIAL_VENDORS);
    setQuotes(INITIAL_QUOTES);
    setSelections(INITIAL_SELECTIONS);
    setSitePhotos(INITIAL_PHOTOS);
    setUsers(INITIAL_USERS);
    setCurrentUser(null);
    setRoleState('architect');
  };

  return (
    <CasabuildContext.Provider
      value={{
        currentUser,
        users,
        login,
        registerUser,
        logout,
        updateUserProfile,
        addUser,
        deleteUser,
        toggleUserDisabled,
        currentRole,
        setRole,
        activeProjectId,
        setActiveProjectId,
        activeProject,
        projects,
        addProject,
        updateProject,
        workers,
        addWorker,
        updateWorker,
        deleteWorker,
        toggleWorkerBlacklist,
        toggleWorkerDisabled,
        attendance,
        markAttendance,
        dailyReports,
        addDailyReport,
        materials,
        transactions,
        addMaterial,
        receiveMaterial,
        consumeMaterial,
        expenses,
        addExpense,
        vendors,
        addVendor,
        updateVendor,
        deleteVendor,
        toggleVendorBlacklist,
        toggleVendorDisabled,
        recordVendorPayment,
        settleVendorPayment: (id, amt, mode) => recordVendorPayment(id, amt, mode || 'UPI'),
        quotes,
        addQuote,
        selections,
        interiorSelections: selections,
        updateSelectionStatus,
        updateInteriorSelection,
        sitePhotos,
        addSitePhoto,
        resetToDefaults,
        cloudSyncStatus,
        firebaseUser,
        signInWithGoogle,
        signOutGoogle,
        syncAllToCloud,
        fetchLatestFromCloud,
        lastCloudSyncTime,
        cloudSyncError,
      }}
    >
      {children}
    </CasabuildContext.Provider>
  );
};

export const useCasabuild = () => {
  const context = useContext(CasabuildContext);
  if (!context) {
    throw new Error('useCasabuild must be used within a CasabuildProvider');
  }
  return context;
};

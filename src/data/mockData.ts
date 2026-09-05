import {
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
} from '../types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'The Grand Crest Villa',
    code: 'CB-2025-01',
    clientName: 'Vikram & Radhika Singhania',
    clientPhone: '+91 98112 34567',
    clientEmail: 'vikram.singhania@crestholdings.com',
    location: 'Plot 42, Golf Course Ext Road, Gurugram',
    type: 'Turnkey',
    status: 'Active',
    startDate: '2025-03-15',
    expectedCompletion: '2026-02-28',
    contractValue: 14500000,
    budget: 13200000,
    totalSpent: 9140000,
    overallProgress: 68,
    areaSqFt: 4500,
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    milestones: [
      { id: 'm1', title: 'Excavation & Raft Foundation', phase: 'Structure', startDate: '2025-03-15', endDate: '2025-04-30', progress: 100, status: 'Completed', assignedTo: 'Civil Team' },
      { id: 'm2', title: 'RCC Frame & Slab Casting (G+2)', phase: 'Structure', startDate: '2025-05-01', endDate: '2025-07-20', progress: 100, status: 'Completed', assignedTo: 'Civil Team' },
      { id: 'm3', title: 'AAC Blockwork & External Plaster', phase: 'Masonry', startDate: '2025-07-25', endDate: '2025-09-10', progress: 100, status: 'Completed', assignedTo: 'Contractor Farooq' },
      { id: 'm4', title: 'Concealed MEP Rough-ins (Plumbing & Electrics)', phase: 'Services', startDate: '2025-09-15', endDate: '2025-10-30', progress: 90, status: 'In Progress', assignedTo: 'Apex Electricals' },
      { id: 'm5', title: 'Italian Marble Flooring & Wall Paneling', phase: 'Finishes', startDate: '2025-11-01', endDate: '2025-12-20', progress: 55, status: 'In Progress', assignedTo: 'Flooring Masters' },
      { id: 'm6', title: 'Custom Joinery, Wardrobes & Modular Kitchen', phase: 'Interiors', startDate: '2025-12-15', endDate: '2026-01-25', progress: 20, status: 'Upcoming', assignedTo: 'Casabuild Millwork' },
      { id: 'm7', title: 'Painting, Lighting & Testing/Handover', phase: 'Handover', startDate: '2026-01-26', endDate: '2026-02-28', progress: 0, status: 'Upcoming', assignedTo: 'Executive Handover' }
    ],
    drawings: [
      { id: 'd1', title: 'Ground & First Floor Architectural Layout', type: 'Architectural', revision: 'R3', uploadDate: '2025-08-12', approvedBy: 'Ar. Aamir Khan', status: 'Approved', fileUrl: '#' },
      { id: 'd2', title: 'RCC Beam & Column Reinforcement Details', type: 'Structural', revision: 'R2', uploadDate: '2025-05-10', approvedBy: 'Er. V. Sharma (SE)', status: 'Approved', fileUrl: '#' },
      { id: 'd3', title: 'Master Suite & Walk-in Closet Interior Elevations', type: 'Interior', revision: 'R4', uploadDate: '2025-10-04', approvedBy: 'Radhika Singhania', status: 'Approved', fileUrl: '#' },
      { id: 'd4', title: 'HVAC Ducting & Home Automation Schematics', type: 'MEP & Services', revision: 'R1', uploadDate: '2025-10-22', approvedBy: 'Tech Living', status: 'In Review', fileUrl: '#' }
    ],
    boq: [
      { id: 'b1', category: 'Masonry', item: 'AAC Block Masonry in 1:4 Cement Mortar', unit: 'Cum', quantity: 185, unitRate: 5800, amount: 1073000, completedPercent: 100, billedAmount: 1073000, notes: 'Completed as per structural drawings' },
      { id: 'b2', category: 'Plastering', item: 'Internal Gypsum Plaster & External Sand-face Plaster', unit: 'Sq.Ft', quantity: 14200, unitRate: 48, amount: 681600, completedPercent: 92, billedAmount: 627072 },
      { id: 'b3', category: 'Flooring', item: 'Imported Botticino Italian Marble with Mirror Polish', unit: 'Sq.Ft', quantity: 3200, unitRate: 680, amount: 2176000, completedPercent: 60, billedAmount: 1305600 },
      { id: 'b4', category: 'Electrical', item: 'Concealed FRLS Copper Wiring with Schneider Modular Switches', unit: 'Points', quantity: 340, unitRate: 1450, amount: 493000, completedPercent: 75, billedAmount: 369750 },
      { id: 'b5', category: 'Woodwork', item: 'HDHMR & BWP Marine Ply Modular Wardrobes in PU Paint', unit: 'Sq.Ft', quantity: 820, unitRate: 1950, amount: 1599000, completedPercent: 20, billedAmount: 319800 }
    ]
  },
  {
    id: 'proj-2',
    name: 'Aura Penthouse Sector 54',
    code: 'CB-2025-04',
    clientName: 'Devansh & Priyal Bansal',
    clientPhone: '+91 99201 88421',
    clientEmail: 'devansh.bansal@aura-tech.in',
    location: 'Penthouse B-2401, DLF Camellias, Gurugram',
    type: 'Interiors',
    status: 'Active',
    startDate: '2025-06-01',
    expectedCompletion: '2025-12-15',
    contractValue: 7800000,
    budget: 7200000,
    totalSpent: 4120000,
    overallProgress: 52,
    areaSqFt: 3200,
    coverImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    milestones: [
      { id: 'm21', title: 'Civil Demolition & Wall Repositioning', phase: 'Civil', startDate: '2025-06-01', endDate: '2025-06-25', progress: 100, status: 'Completed' },
      { id: 'm22', title: 'Acoustic False Ceiling & Cove Lighting', phase: 'Ceilings', startDate: '2025-06-28', endDate: '2025-08-15', progress: 100, status: 'Completed' },
      { id: 'm23', title: 'Italian Bathroom Renovation & Grohe Fittings', phase: 'Sanitary', startDate: '2025-08-16', endDate: '2025-10-10', progress: 85, status: 'In Progress' },
      { id: 'm24', title: 'Modular Kitchen with Miele Appliances', phase: 'Kitchen', startDate: '2025-10-12', endDate: '2025-11-20', progress: 30, status: 'In Progress' }
    ],
    drawings: [
      { id: 'd21', title: 'Living Lounge & Bar Counter Joinery', type: 'Interior', revision: 'R2', uploadDate: '2025-09-02', approvedBy: 'Devansh Bansal', status: 'Approved' }
    ],
    boq: [
      { id: 'b21', category: 'Ceilings', item: 'Saint Gobain Gyproc False Ceiling with Magnetic Track Light Slots', unit: 'Sq.Ft', quantity: 2800, unitRate: 165, amount: 462000, completedPercent: 100, billedAmount: 462000 }
    ]
  },
  {
    id: 'proj-3',
    name: 'Zion Architectural Studio & Gallery',
    code: 'CB-2025-02',
    clientName: 'Karan Mehra',
    clientPhone: '+91 97110 55432',
    clientEmail: 'karan@ziondesigns.com',
    location: 'Phase 2, Udyog Vihar, Gurugram',
    type: 'Architecture',
    status: 'Active',
    startDate: '2025-01-10',
    expectedCompletion: '2025-11-30',
    contractValue: 18000000,
    budget: 16500000,
    totalSpent: 14800000,
    overallProgress: 88,
    areaSqFt: 5800,
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    milestones: [
      { id: 'm31', title: 'Full Glass & Corten Steel Façade Installation', phase: 'Façade', startDate: '2025-07-01', endDate: '2025-09-30', progress: 100, status: 'Completed' },
      { id: 'm32', title: 'Exposed Concrete Floor Polishing & Microtopping', phase: 'Flooring', startDate: '2025-10-01', endDate: '2025-11-15', progress: 80, status: 'In Progress' }
    ],
    drawings: [],
    boq: []
  }
];

export const INITIAL_WORKERS: Worker[] = [
  { id: 'w1', name: 'Shahid Ansari', trade: 'Mason', phone: '+91 98110 88211', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', dailyWage: 950, totalDaysWorked: 26, advanceReceived: 4000, pendingWage: 20700, status: 'Active', isBlacklisted: false, disabled: false },
  { id: 'w2', name: 'Imran Khan', trade: 'Mason', phone: '+91 98223 11452', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', dailyWage: 900, totalDaysWorked: 24, advanceReceived: 3500, pendingWage: 18100, status: 'Active', isBlacklisted: false, disabled: false },
  { id: 'w3', name: 'Raju Paswan', trade: 'Helper', phone: '+91 97188 23901', photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80', dailyWage: 650, totalDaysWorked: 27, advanceReceived: 2000, pendingWage: 15550, status: 'Active', isBlacklisted: false, disabled: false },
  { id: 'w4', name: 'Dinesh Sharma', trade: 'Carpenter', phone: '+91 98912 66731', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', dailyWage: 1100, totalDaysWorked: 22, advanceReceived: 5000, pendingWage: 19200, status: 'Active', isBlacklisted: false, disabled: false },
  { id: 'w5', name: 'Mukesh Pal', trade: 'Carpenter', phone: '+91 99104 55122', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80', dailyWage: 1050, totalDaysWorked: 21, advanceReceived: 4500, pendingWage: 17550, status: 'Active', isBlacklisted: false, disabled: false },
  { id: 'w6', name: 'Zameer Alam', trade: 'Electrician', phone: '+91 98109 43220', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80', dailyWage: 1000, totalDaysWorked: 25, advanceReceived: 3000, pendingWage: 22000, status: 'Active', isBlacklisted: false, disabled: false },
  { id: 'w7', name: 'Bablu Yadav', trade: 'Plumber', phone: '+91 98711 67439', photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80', dailyWage: 1000, totalDaysWorked: 23, advanceReceived: 2500, pendingWage: 20500, status: 'Active', isBlacklisted: false, disabled: false },
  { id: 'w8', name: 'Suraj Chauhan', trade: 'Tile Specialist', phone: '+91 98114 99128', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80', dailyWage: 1150, totalDaysWorked: 24, advanceReceived: 6000, pendingWage: 21600, status: 'Active', isBlacklisted: false, disabled: false },
  { id: 'w9', name: 'Ramkishan Lodhi', trade: 'Helper', phone: '+91 97112 00411', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80', dailyWage: 650, totalDaysWorked: 26, advanceReceived: 1500, pendingWage: 15400, status: 'Active', isBlacklisted: false, disabled: false },
  { id: 'w10', name: 'Santosh Kumar', trade: 'Painter', phone: '+91 98991 33215', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80', dailyWage: 950, totalDaysWorked: 18, advanceReceived: 3000, pendingWage: 14100, status: 'Active', isBlacklisted: false, disabled: false },
  { id: 'w11', name: 'Rameshwar Barman', trade: 'Mason', phone: '+91 98199 44012', photo: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=200&q=80', dailyWage: 900, totalDaysWorked: 12, advanceReceived: 8000, pendingWage: 2800, status: 'Inactive', isBlacklisted: true, blacklistReason: 'Severe site safety violation: Refused harness on scaffolding and repeated unauthorized absences.', disabled: true }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att-1', workerId: 'w1', workerName: 'Shahid Ansari', trade: 'Mason', date: new Date().toISOString().split('T')[0], status: 'Present', workAssigned: 'Brickwork Bedroom 2 and balcony parapet', dailyWage: 950, payableAmount: 950, projectId: 'proj-1' },
  { id: 'att-2', workerId: 'w2', workerName: 'Imran Khan', trade: 'Mason', date: new Date().toISOString().split('T')[0], status: 'Half Day', workAssigned: 'Material Shifting & lintel level preparation', dailyWage: 900, payableAmount: 450, projectId: 'proj-1' },
  { id: 'att-3', workerId: 'w3', workerName: 'Raju Paswan', trade: 'Helper', date: new Date().toISOString().split('T')[0], status: 'Present', workAssigned: 'Mortar mixing and concrete curing at terrace', dailyWage: 650, payableAmount: 650, projectId: 'proj-1' },
  { id: 'att-4', workerId: 'w4', workerName: 'Dinesh Sharma', trade: 'Carpenter', date: new Date().toISOString().split('T')[0], status: 'Present', workAssigned: 'Wardrobe carcass assembly in master bedroom', dailyWage: 1100, payableAmount: 1100, projectId: 'proj-1' },
  { id: 'att-5', workerId: 'w5', workerName: 'Mukesh Pal', trade: 'Carpenter', date: new Date().toISOString().split('T')[0], status: 'Present', workAssigned: 'Door frame fixing and veneer sizing', dailyWage: 1050, payableAmount: 1050, projectId: 'proj-1' },
  { id: 'att-6', workerId: 'w6', workerName: 'Zameer Alam', trade: 'Electrician', date: new Date().toISOString().split('T')[0], status: 'Present', workAssigned: 'Living room cove light point conduits & distribution box', dailyWage: 1000, payableAmount: 1000, projectId: 'proj-1' },
  { id: 'att-7', workerId: 'w7', workerName: 'Bablu Yadav', trade: 'Plumber', date: new Date().toISOString().split('T')[0], status: 'Absent', workAssigned: 'Personal leave', dailyWage: 1000, payableAmount: 0, projectId: 'proj-1' },
  { id: 'att-8', workerId: 'w8', workerName: 'Suraj Chauhan', trade: 'Tile Specialist', date: new Date().toISOString().split('T')[0], status: 'Present', workAssigned: 'Master bathroom Italian marble dry-lay & leveling', dailyWage: 1150, payableAmount: 1150, projectId: 'proj-1' },
  { id: 'att-9', workerId: 'w9', workerName: 'Ramkishan Lodhi', trade: 'Helper', date: new Date().toISOString().split('T')[0], status: 'Present', workAssigned: 'Tile cutting assistance & debris clearing', dailyWage: 650, payableAmount: 650, projectId: 'proj-1' },
  { id: 'att-10', workerId: 'w10', workerName: 'Santosh Kumar', trade: 'Painter', date: new Date().toISOString().split('T')[0], status: 'Half Day', workAssigned: '1st floor corridor 2nd coat primer application', dailyWage: 950, payableAmount: 475, projectId: 'proj-1' }
];

export const INITIAL_DAILY_REPORTS: DailySiteReport[] = [
  {
    id: 'dsr-101',
    projectId: 'proj-1',
    projectName: 'The Grand Crest Villa',
    date: new Date().toISOString().split('T')[0],
    weather: 'Sunny',
    temperature: '28°C',
    workersCount: 24,
    todaysWork: 'Master bedroom wardrobe frame assembly completed. Living room Italian marble laser leveling 85% done. Conduit wiring pulled for AC and smart sensors in guest suite.',
    progressPercentage: 68,
    issues: 'Delayed arrival of 20 boxes Botticino marble slabs due to transport restriction at border.',
    issueSeverity: 'Moderate',
    tomorrowPlan: 'Epoxy grouting of marble in Master Suite, pressure testing of bathroom CPVC lines with municipal pressure gauge.',
    photos: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80'
    ],
    supervisorName: 'Tariq Mehmood',
    status: 'Approved'
  },
  {
    id: 'dsr-100',
    projectId: 'proj-1',
    projectName: 'The Grand Crest Villa',
    date: '2025-10-24',
    weather: 'Clear',
    temperature: '26°C',
    workersCount: 22,
    todaysWork: 'AAC blockwork in first floor service balcony completed. Curing completed. Plumber finished overhead tank manifold connection.',
    progressPercentage: 67,
    issues: 'None. Smooth work progress.',
    issueSeverity: 'None',
    tomorrowPlan: 'Begin bathroom waterproofing coat 2.',
    photos: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
    ],
    supervisorName: 'Tariq Mehmood',
    status: 'Approved'
  }
];

export const INITIAL_MATERIALS: MaterialItem[] = [
  { id: 'mat-1', name: 'UltraTech Super Cement (53 Grade)', category: 'Cement & Aggregates', currentBalance: 140, unit: 'Bags', minThreshold: 50, status: 'In Stock', supplierName: 'Shree Cement & Building Supply', unitCost: 410, lastRestockedDate: '2025-10-20' },
  { id: 'mat-2', name: 'Tata Tiscon TMT Steel Rebars (16mm Fe550D)', category: 'Steel & Metals', currentBalance: 580, unit: 'Kg', minThreshold: 300, status: 'In Stock', supplierName: 'Apex Steels & Alloys Corp', unitCost: 64, lastRestockedDate: '2025-10-14' },
  { id: 'mat-3', name: 'Siporex AAC Lightweight Blocks (600x200x150)', category: 'Bricks & Masonry', currentBalance: 120, unit: 'Nos', minThreshold: 250, status: 'Low Stock', supplierName: 'EcoLite Masonry Works', unitCost: 68, lastRestockedDate: '2025-10-05' },
  { id: 'mat-4', name: 'River Sand (Washed Coarse Sand)', category: 'Cement & Aggregates', currentBalance: 2, unit: 'Brass', minThreshold: 4, status: 'Low Stock', supplierName: 'Yamuna River Aggregate Fleet', unitCost: 7500, lastRestockedDate: '2025-09-28' },
  { id: 'mat-5', name: 'Finolex FRLS FR Electrical Conduit Wire (2.5 sq.mm)', category: 'Plumbing & Electrical', currentBalance: 18, unit: 'Nos', minThreshold: 10, status: 'In Stock', supplierName: 'Havells Electrical Syndicate', unitCost: 2450, lastRestockedDate: '2025-10-18' },
  { id: 'mat-6', name: 'Greenply 710 Club BWP Marine Grade Plywood (19mm)', category: 'Wood & Hardware', currentBalance: 42, unit: 'Nos', minThreshold: 15, status: 'In Stock', supplierName: 'Royal Timber & Hardware', unitCost: 3150, lastRestockedDate: '2025-10-12' },
  { id: 'mat-7', name: 'Asian Paints Royale Luxury Emulsion (Brilliant White)', category: 'Finishes & Paint', currentBalance: 8, unit: 'Nos', minThreshold: 15, status: 'Critical', supplierName: 'Colour World Paint Galleria', unitCost: 5600, lastRestockedDate: '2025-09-18' },
  { id: 'mat-8', name: 'Astral CPVC Pro Piping (1 inch SDR 11)', category: 'Plumbing & Electrical', currentBalance: 65, unit: 'Meters', minThreshold: 40, status: 'In Stock', supplierName: 'Kohler Bath & Pipe Gallery', unitCost: 195, lastRestockedDate: '2025-10-15' }
];

export const INITIAL_TRANSACTIONS: MaterialTransaction[] = [
  { id: 'tx-1', materialId: 'mat-1', materialName: 'UltraTech Super Cement (53 Grade)', type: 'INWARD', quantity: 100, unit: 'Bags', date: '2025-10-20', vendorName: 'Shree Cement & Building Supply', poNumber: 'PO-CB-849', notes: 'Delivered directly to site batch 4' },
  { id: 'tx-2', materialId: 'mat-1', materialName: 'UltraTech Super Cement (53 Grade)', type: 'CONSUMPTION', quantity: 24, unit: 'Bags', date: '2025-10-24', projectId: 'proj-1', notes: 'Mortar for 1st floor brickwork' },
  { id: 'tx-3', materialId: 'mat-3', materialName: 'Siporex AAC Lightweight Blocks', type: 'CONSUMPTION', quantity: 180, unit: 'Nos', date: '2025-10-23', projectId: 'proj-1', notes: 'Service balcony wall erection' }
];

export const INITIAL_EXPENSES: ExpenseRecord[] = [
  { id: 'exp-1', projectId: 'proj-1', projectName: 'The Grand Crest Villa', date: new Date().toISOString().split('T')[0], category: 'Labour Wages', vendorPayee: 'Farooq Labour Contractor', amount: 38450, paymentMode: 'UPI', receiptNumber: 'UPI-49021882', status: 'Paid', paidBy: 'Casabuild Finance', notes: 'Weekly wage settlement for 24 workers' },
  { id: 'exp-2', projectId: 'proj-1', projectName: 'The Grand Crest Villa', date: '2025-10-22', category: 'Material Purchase', vendorPayee: 'Shree Cement & Building Supply', amount: 41000, paymentMode: 'Bank Transfer / NEFT', receiptNumber: 'INV-SC-9021', status: 'Paid', paidBy: 'Owner (Ar. Aamir Khan)', notes: '100 bags 53 grade cement batch' },
  { id: 'exp-3', projectId: 'proj-1', projectName: 'The Grand Crest Villa', date: '2025-10-20', category: 'Subcontractor', vendorPayee: 'Flooring Masters Ltd', amount: 75000, paymentMode: 'Bank Transfer / NEFT', receiptNumber: 'INV-FM-342', status: 'Approved', paidBy: 'Accountant', notes: 'Advance for Italian marble dry laying' },
  { id: 'exp-4', projectId: 'proj-2', projectName: 'Aura Penthouse Sector 54', date: '2025-10-18', category: 'Design & Approvals', vendorPayee: 'DLF Estates Facility Office', amount: 12500, paymentMode: 'Cheque', receiptNumber: 'CHQ-882103', status: 'Paid', paidBy: 'Site Supervisor', notes: 'Weekend work permission & debris chute fee' },
  { id: 'exp-5', projectId: 'proj-1', projectName: 'The Grand Crest Villa', date: '2025-10-16', category: 'Machinery & Equipment', vendorPayee: 'BuildWell Crane & Mixer Rental', amount: 18000, paymentMode: 'UPI', receiptNumber: 'UPI-991204', status: 'Paid', paidBy: 'Site Supervisor', notes: 'Concrete hoist rental for 6 days' }
];

export const INITIAL_VENDORS: Vendor[] = [
  { 
    id: 'v-1', 
    name: 'Shree Cement & Building Supply', 
    category: 'Material Supplier', 
    contactPerson: 'Ramesh Agarwal', 
    phone: '+91 98101 22934', 
    email: 'ramesh@shreecementdealers.in',
    address: 'Plot 44, Udyog Vihar Phase 1, Gurugram',
    gstin: '07AAACS1829K1Z4',
    totalBilled: 680000, 
    totalPaid: 590000, 
    balanceOutstanding: 90000, 
    status: 'Active',
    isBlacklisted: false,
    disabled: false
  },
  { 
    id: 'v-2', 
    name: 'Apex Steels & Alloys Corp', 
    category: 'Material Supplier', 
    contactPerson: 'Sunil Mittal', 
    phone: '+91 98200 44912', 
    email: 'smittal@apexsteelcorp.com',
    address: 'Warehouse 12, Transport Nagar, Delhi',
    gstin: '07AABCA9918M1ZQ',
    totalBilled: 1420000, 
    totalPaid: 1250000, 
    balanceOutstanding: 170000, 
    status: 'Active',
    isBlacklisted: false,
    disabled: false
  },
  { 
    id: 'v-3', 
    name: 'Farooq Labour Contractor', 
    category: 'Subcontractor', 
    contactPerson: 'Farooq Sheikh', 
    phone: '+91 98711 55320', 
    email: 'farooq.civillabour@gmail.com',
    address: 'Sector 53 Labour Colony, Gurugram',
    gstin: 'Unregistered Small Enterprise',
    totalBilled: 940000, 
    totalPaid: 901550, 
    balanceOutstanding: 38450, 
    status: 'Pending Settlement',
    isBlacklisted: false,
    disabled: false
  },
  { 
    id: 'v-4', 
    name: 'Flooring Masters & Italian Marble Co', 
    category: 'Subcontractor', 
    contactPerson: 'Giacomo / Satish', 
    phone: '+91 98114 88200', 
    email: 'contact@flooringmastersdelhi.com',
    address: 'Marble Market, Rajouri Garden, New Delhi',
    gstin: '07AAFFM4412B1Z8',
    totalBilled: 1200000, 
    totalPaid: 850000, 
    balanceOutstanding: 350000, 
    status: 'Active',
    isBlacklisted: false,
    disabled: false
  },
  { 
    id: 'v-5', 
    name: 'Havells & Polycab Electrical Syndicate', 
    category: 'Material Supplier', 
    contactPerson: 'Rajiv Chawla', 
    phone: '+91 99100 77412', 
    email: 'chawla.electrics@yahoo.com',
    address: 'Bhagirath Palace, Chandni Chowk, Delhi',
    gstin: '07AAGPH8172D1ZK',
    totalBilled: 410000, 
    totalPaid: 370000, 
    balanceOutstanding: 40000, 
    status: 'Active',
    isBlacklisted: false,
    disabled: false
  },
  {
    id: 'v-6',
    name: 'Vanguard Structural Steels & Rebar Ltd',
    category: 'Material Supplier',
    contactPerson: 'Mukesh Goel',
    phone: '+91 98109 00192',
    email: 'mgoel@vanguardrebar.in',
    address: 'Industrial Area Phase 2, Mayapuri, Delhi',
    gstin: '07AABCV8912P1ZN',
    totalBilled: 850000,
    totalPaid: 500000,
    balanceOutstanding: 350000,
    status: 'Pending Settlement',
    isBlacklisted: true,
    blacklistReason: 'Delivered substandard rebar batch with non-conforming yield strength certificate. Blacklisted by Ar. Aamir Khan.',
    disabled: true
  }
];

export const INITIAL_QUOTES: QuoteEstimate[] = [
  {
    id: 'q-101',
    quoteNumber: 'CB-Q-2025-88',
    clientName: 'Dr. Sameer & Ananya Kulkarni',
    clientPhone: '+91 98113 44556',
    clientEmail: 'sameer.kulkarni@medcity.org',
    projectType: 'Turnkey Luxury Villa & Architecture',
    areaSqFt: 4200,
    tier: 'Ultra-Luxury',
    date: '2025-10-15',
    items: [
      { category: 'Architecture & Engineering', item: 'Master Architectural Design, 3D Renderings & Structural Engineering Certifications', unit: 'Sq.Ft', quantity: 4200, unitRate: 150, amount: 630000, notes: 'Complete turnkey architectural drawings, MEP and approval sets' },
      { category: 'Civil & RCC Structure', item: 'Excavation, Raft Foundation, Fe550D TMT Reinforcement & M25 Ready Mix Concrete', unit: 'Sq.Ft', quantity: 4200, unitRate: 1850, amount: 7770000, notes: 'Structural guarantee with anti-termite and integral waterproofing' },
      { category: 'MEP Infrastructure', item: 'Concealed CPVC Plumbing, Soundproof Drainage & Polycab FR Wiring with Smart DB', unit: 'Sq.Ft', quantity: 4200, unitRate: 520, amount: 2184000, notes: 'Includes hot water solar line and home automation conduit provisions' },
      { category: 'Italian Marble & Cladding', item: 'First-choice Imported Statuario / Botticino Italian Marble with Laser Calibration', unit: 'Sq.Ft', quantity: 3400, unitRate: 750, amount: 2550000, notes: 'Sub-base screed, diamond mirror polishing and Italian stain sealer' },
      { category: 'Custom Millwork & Kitchen', item: 'Marine Grade Modular Kitchen with Quartz Island & Acrylic/Veneer Wardrobes', unit: 'Lumpsum', quantity: 1, unitRate: 2800000, amount: 2800000, notes: 'Blum soft close fittings, Hafele accessories, built-in appliance cabinetry' },
      { category: 'Premium Paints & Textures', item: 'Asian Paints Royale Aspira with Italian Stucco Accent Walls & Water Repellent External Coat', unit: 'Sq.Ft', quantity: 11000, unitRate: 115, amount: 1265000, notes: 'Anti-fungal base with 5-year finish warranty' }
    ],
    subtotal: 17199000,
    contingency: 859950,
    taxPercent: 18,
    taxAmount: 3250611,
    grandTotal: 21309561,
    timelineEstimateWeeks: 38,
    executiveSummary: 'Turnkey luxury residence proposal engineered to ultra-high standards. Incorporates architectural drawings, high-strength RCC skeleton, imported Italian stone, bespoke joinery, and smart home provisions.',
    status: 'Sent'
  }
];

export const INITIAL_SELECTIONS: InteriorSelectionItem[] = [
  { id: 'sel-1', projectId: 'proj-1', room: 'Kitchen & Pantry', category: 'Kitchen Tiles', itemName: 'Porcelanosa Calacatta Gold Large Slab (120x240cm)', brandOrCode: 'Porcelanosa Spain #CG-991', photo: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80', specDetails: 'Seamless bookmatched porcelain slab, stain-proof and heat resistant to 800°C', costImpact: 'Within Budget', status: 'Approved', clientApprovedDate: '2025-10-10' },
  { id: 'sel-2', projectId: 'proj-1', room: 'Master Bedroom', category: 'Wardrobe Laminate', itemName: 'Smoked Oak Fluted Veneer with Matte Brass Profiles', brandOrCode: 'DecoVeneer Italia #VK-440', photo: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80', specDetails: 'Natural quarter-cut European oak veneer treated with waterborne poly lacquer', costImpact: '+ ₹35,000 upgrade', status: 'Pending' },
  { id: 'sel-3', projectId: 'proj-1', room: 'Living & Dining Hall', category: 'Wall Paint', itemName: 'Asian Paints Royale Italian Stucco (Warm Sand / Travertine Texture)', brandOrCode: 'Royale Play #ST-201', photo: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80', specDetails: 'Venetian lime plaster hand-troweled for authentic stone depth', costImpact: 'Within Budget', status: 'Approved', clientApprovedDate: '2025-10-18' },
  { id: 'sel-4', projectId: 'proj-1', room: 'Master Bathroom', category: 'Sanitary Fittings', itemName: 'Grohe Allure Brilliant Thermostatic Shower System & Concealed Mixer', brandOrCode: 'Grohe Germany #34479000', photo: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80', specDetails: 'Brushed Warm Sunset finish with integrated body jets & rain head', costImpact: '+ ₹42,000 upgrade', status: 'Approved', clientApprovedDate: '2025-10-20' },
  { id: 'sel-5', projectId: 'proj-1', room: 'Double Height Lobby', category: 'Lighting', itemName: 'Custom 24-Ring Kinetic Brass & Crystal Chandelier', brandOrCode: 'Klove Studio Bespoke', photo: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80', specDetails: 'Hand-blown Bohemian crystal with dimmable 2700K Dali automated drivers', costImpact: 'Pending Quote', status: 'Pending' }
];

export const INITIAL_PHOTOS: SitePhotoItem[] = [
  { id: 'p-1', projectId: 'proj-1', date: '2025-10-25', locationTag: 'Master Suite (2nd Floor)', activityTag: 'Italian Marble Dry-Lay & Leveling', imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80', caption: 'Laser leveling completed for Botticino marble slabs prior to epoxy bedding.', uploadedBy: 'Tariq (Supervisor)', phase: 'Finishes' },
  { id: 'p-2', projectId: 'proj-1', date: '2025-10-24', locationTag: 'Formal Living Room', activityTag: 'Acoustic Ceiling Framing', imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80', caption: 'Saint Gobain heavy-duty perimeter channels hung with vibration isolators.', uploadedBy: 'Tariq (Supervisor)', phase: 'Interiors' },
  { id: 'p-3', projectId: 'proj-1', date: '2025-10-22', locationTag: 'East Courtyard & Facade', activityTag: 'Stone Cladding & Waterproofing', imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80', caption: 'Curing and protective sealant application on external Dholpur sandstone brackets.', uploadedBy: 'Ar. Aamir Khan', phase: 'Façade' },
  { id: 'p-4', projectId: 'proj-2', date: '2025-10-20', locationTag: 'Penthouse Dining Area', activityTag: 'Concealed Electrical Distribution', imageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80', caption: 'Automation bus conduits wired and labeled for Lutron home lighting.', uploadedBy: 'Devansh (Site Eng)', phase: 'Services' }
];

export const ALL_MASTER_PERMISSIONS = [
  'Full Administrative & Master ERP Access (Owner in Every Role)',
  'Architectural & Interior Drawings Management (Architect)',
  'BOQ & Construction Cost Estimation (Architect)',
  'Interior Selection & Finish Specifications (Architect)',
  'Client Design Reviews & Presentations (Architect)',
  'Daily Site Reports (DSR) Logging & Sign-Off (Supervisor)',
  'Workforce Muster Roll & Biometric Attendance (Supervisor)',
  'Material Inward Gate Entry & Consumption Logs (Supervisor)',
  'Site Progress Photo Documentation & Quality (Supervisor)',
  'Vendor Ledger & Outstanding Aging (Accountant)',
  'Worker Wage & Advance Settlement (Accountant)',
  'NEFT, RTGS & UPI Disbursements (Accountant)',
  'GST Invoice Audit & Input Tax Credit (Accountant)',
  'Subcontractor Task Completion Updates (Contractor)',
  'Turnkey Workforce Verification (Contractor)',
  'Client Approvals & Payment Milestone Disbursements (Client)',
  'Employee Directory & Contact Details Governance',
  'Vendor & Contractor Blacklisting Controls',
  'Excel Data Exports & Statutory Auditing'
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-1',
    name: 'Ar. Aamir Khan',
    email: 'Ar.khanaamir@gmail.com',
    password: 'password123',
    role: 'owner',
    designation: 'Managing Owner & Principal Architect (Master in Every Role)',
    phone: '+91 98101 23456',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    companyOrAffiliation: 'The Casabuild Design & Turnkey Studio',
    licenseNumber: 'COA Reg. CA/2018/98421',
    assignedProjects: ['ALL'],
    permissions: ALL_MASTER_PERMISSIONS,
    lastLogin: '2026-09-05 08:45',
    disabled: false,
    status: 'Active'
  },
  {
    id: 'usr-2',
    name: 'Vikramaditya Singhania',
    email: 'vikram@thecasabuild.com',
    password: 'password123',
    role: 'architect',
    designation: 'Co-Director & Senior Project Architect',
    phone: '+91 98200 11223',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    companyOrAffiliation: 'The Casabuild Group Ltd.',
    licenseNumber: 'CIN U45201DL2019PTC345678',
    assignedProjects: ['ALL'],
    permissions: [
      'Architectural & Interior Drawings Management',
      'BOQ & Construction Cost Estimation',
      'Interior Selection & Finish Specifications',
      'Client Design Reviews & Presentations',
      'Site Photo Journal & Quality Inspection',
      'Executive Progress Reporting'
    ],
    lastLogin: '2026-09-04 10:15',
    disabled: false,
    status: 'Active'
  },
  {
    id: 'usr-3',
    name: 'Er. Rajesh Sharma',
    email: 'rajesh.site@thecasabuild.com',
    password: 'password123',
    role: 'supervisor',
    designation: 'Senior Project Site Engineer',
    phone: '+91 97112 45890',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    companyOrAffiliation: 'Casabuild Construction Operations',
    licenseNumber: 'IEI Reg. M-154982',
    assignedProjects: ['proj-1', 'proj-2', 'proj-3'],
    permissions: [
      'Daily Site Reports (DSR) Logging',
      'Workforce Muster Roll & Biometric Attendance',
      'Material Inward Gate Entry & Consumption Logs',
      'Site Progress Photo Documentation',
      'Safety & Quality Checklists'
    ],
    lastLogin: '2026-09-04 08:30',
    disabled: false,
    status: 'Active'
  },
  {
    id: 'usr-4',
    name: 'CA Priya Mehta',
    email: 'priya.finance@thecasabuild.com',
    password: 'password123',
    role: 'accountant',
    designation: 'Chief Financial Officer & Controller',
    phone: '+91 98118 76543',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    companyOrAffiliation: 'Casabuild Corporate Finance',
    licenseNumber: 'ICAI Reg. 514238',
    assignedProjects: ['ALL'],
    permissions: [
      'Vendor Ledger & Outstanding Aging',
      'Worker Wage & Advance Settlement',
      'NEFT, RTGS & UPI Disbursements',
      'GST Invoice Audit & Input Tax Credit',
      'Project Budget Overrun Tracking'
    ],
    lastLogin: '2026-09-03 18:20',
    disabled: false,
    status: 'Active'
  },
  {
    id: 'usr-5',
    name: 'Gurpreet Singh',
    email: 'gurpreet.civil@casabuildcontracts.in',
    password: 'password123',
    role: 'contractor',
    designation: 'Head Turnkey Civil Contractor',
    phone: '+91 98140 99881',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    companyOrAffiliation: 'Singh Civil Infrastructure Pvt. Ltd.',
    licenseNumber: 'PWD Contractor Reg. CL-8912',
    assignedProjects: ['proj-1', 'proj-3'],
    permissions: [
      'Assigned Workforce Attendance Verification',
      'Daily Structural Concrete & Brickwork Logs',
      'Subcontractor Task Completion Updates',
      'Material Indent Submission'
    ],
    lastLogin: '2026-09-04 07:45',
    disabled: false,
    status: 'Active'
  },
  {
    id: 'usr-6',
    name: 'Rahul Oberoi',
    email: 'roberoi@oberoiholdings.in',
    password: 'password123',
    role: 'client',
    designation: 'Property Owner (The Grand Crest Villa)',
    phone: '+91 99100 88221',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    companyOrAffiliation: 'Oberoi Family Trust',
    licenseNumber: 'Client ID CB-CLI-042',
    assignedProjects: ['proj-1'],
    permissions: [
      'View Real-Time Project Milestone Progress',
      'Inspect HD Site Photo Timeline & Video Feeds',
      'Approve / Request Revisions on Interior Selections',
      'Download Verified Payment Receipts & Milestone Certificates'
    ],
    lastLogin: '2026-09-02 16:10',
    disabled: false,
    status: 'Active'
  }
];


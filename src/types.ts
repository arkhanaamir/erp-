export type UserRole = 
  | 'owner'          // Everything (full access)
  | 'architect'      // Drawings, BOQ, client meetings
  | 'supervisor'     // Attendance, progress, photos
  | 'accountant'     // Payments, invoices, vendors, expenses
  | 'contractor'     // Own labour and work updates only
  | 'client';        // View progress, photos, approvals (restricted)

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  designation: string;
  phone: string;
  avatar?: string;
  companyOrAffiliation: string;
  licenseNumber?: string;
  assignedProjects: string[]; // project IDs or ['ALL']
  permissions: string[];
  lastLogin?: string;
  disabled?: boolean;
  status?: 'Active' | 'Disabled';
}

export interface ProjectMilestone {
  id: string;
  title: string;
  phase: string;
  startDate: string;
  endDate: string;
  progress: number; // 0-100
  status: 'Completed' | 'In Progress' | 'Upcoming' | 'Delayed';
  assignedTo?: string;
}

export interface DrawingItem {
  id: string;
  title: string;
  type: 'Architectural' | 'Structural' | 'Interior' | 'MEP & Services';
  revision: string; // e.g. R3
  uploadDate: string;
  approvedBy?: string;
  status: 'Approved' | 'In Review' | 'Revision Required';
  fileUrl?: string;
}

export interface BOQItem {
  id: string;
  category: string;
  item: string;
  unit: string;
  quantity: number;
  unitRate: number;
  amount: number;
  completedPercent: number;
  billedAmount: number;
  notes?: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  location: string;
  type: 'Architecture' | 'Interiors' | 'Construction' | 'Turnkey';
  status: 'Active' | 'On Hold' | 'Completed';
  startDate: string;
  expectedCompletion: string;
  contractValue: number;
  budget: number;
  totalSpent: number;
  overallProgress: number; // 0-100
  areaSqFt: number;
  coverImage: string;
  milestones: ProjectMilestone[];
  drawings: DrawingItem[];
  boq: BOQItem[];
}

export interface DailySiteReport {
  id: string;
  projectId: string;
  projectName: string;
  date: string;
  weather: 'Sunny' | 'Rainy' | 'Windy' | 'Cloudy' | 'Extreme Heat' | 'Clear';
  temperature?: string;
  workersCount: number;
  todaysWork: string;
  progressPercentage: number;
  issues: string;
  issueSeverity: 'Low' | 'Moderate' | 'Critical' | 'None';
  tomorrowPlan: string;
  photos: string[];
  supervisorName: string;
  status: 'Submitted' | 'Reviewed' | 'Approved';
}

export interface Worker {
  id: string;
  name: string;
  trade: 'Mason' | 'Carpenter' | 'Electrician' | 'Plumber' | 'Helper' | 'Painter' | 'Tile Specialist' | 'Welder';
  phone: string;
  photo: string;
  dailyWage: number;
  totalDaysWorked: number;
  advanceReceived: number;
  pendingWage: number;
  status: 'Active' | 'Inactive';
  isBlacklisted?: boolean;
  blacklistReason?: string;
  disabled?: boolean;
}

export interface AttendanceRecord {
  id: string;
  workerId: string;
  workerName: string;
  trade: string;
  date: string;
  status: 'Present' | 'Half Day' | 'Absent';
  workAssigned: string;
  dailyWage: number;
  payableAmount: number;
  projectId: string;
}

export interface MaterialItem {
  id: string;
  name: string;
  category: 'Cement & Aggregates' | 'Steel & Metals' | 'Bricks & Masonry' | 'Plumbing & Electrical' | 'Wood & Hardware' | 'Finishes & Paint';
  currentBalance: number;
  unit: 'Bags' | 'Kg' | 'Nos' | 'Sq.Ft' | 'Ton' | 'Meters' | 'Brass';
  minThreshold: number;
  status: 'In Stock' | 'Low Stock' | 'Critical';
  supplierName: string;
  unitCost: number;
  lastRestockedDate: string;
}

export interface MaterialTransaction {
  id: string;
  materialId: string;
  materialName: string;
  type: 'INWARD' | 'CONSUMPTION';
  quantity: number;
  unit: string;
  date: string;
  projectId?: string;
  vendorName?: string;
  poNumber?: string;
  notes?: string;
}

export interface ExpenseRecord {
  id: string;
  projectId: string;
  projectName: string;
  date: string;
  category: 'Material Purchase' | 'Labour Wages' | 'Machinery & Equipment' | 'Site Utilities & Fuel' | 'Subcontractor' | 'Design & Approvals' | string;
  vendorPayee: string;
  amount: number;
  paymentMode: 'UPI' | 'Bank Transfer / NEFT' | 'Cheque' | 'Cash' | string;
  receiptNumber: string;
  status: 'Submitted' | 'Approved' | 'Paid';
  paidBy: string;
  receiptImage?: string;
  notes?: string;
  title?: string;
  paidTo?: string;
  invoiceNumber?: string;
  vendorId?: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: 'Material Supplier' | 'Subcontractor' | 'Equipment Rental' | string;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  gstin?: string;
  gstNumber?: string;
  totalBilled: number;
  totalPaid: number;
  balanceOutstanding: number;
  status: 'Active' | 'Pending Settlement' | 'Disputed' | 'Blocked' | 'Disabled';
  isBlacklisted?: boolean;
  blacklistReason?: string;
  disabled?: boolean;
  paidAmount?: number;
  pendingAmount?: number;
}

export interface QuoteEstimate {
  id: string;
  quoteNumber: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  projectType: string;
  areaSqFt: number;
  tier: 'Standard' | 'Premium' | 'Ultra-Luxury';
  date: string;
  items: {
    category: string;
    item: string;
    unit: string;
    quantity: number;
    unitRate: number;
    amount: number;
    notes?: string;
  }[];
  subtotal: number;
  contingency: number;
  taxPercent: number;
  taxAmount: number;
  grandTotal: number;
  timelineEstimateWeeks: number;
  executiveSummary: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected';
}

export interface InteriorSelectionItem {
  id: string;
  projectId: string;
  room?: string;
  category: string;
  itemName?: string;
  item?: string;
  brandOrCode?: string;
  brand?: string;
  photo?: string;
  imageUrl?: string;
  specDetails?: string;
  specifications?: string;
  costImpact?: string; // e.g. "Within Budget" or "+ ₹18,000 upgrade"
  status: 'Approved' | 'Pending' | 'Rejected' | 'Revision Requested' | 'Ordered';
  clientApprovedDate?: string;
  clientFeedback?: string;
}

export interface SitePhotoItem {
  id: string;
  projectId: string;
  date: string;
  locationTag?: string;
  activityTag?: string;
  imageUrl: string;
  caption: string;
  uploadedBy: string;
  phase?: string;
  location?: string;
  activity?: string;
}

export type VendorItem = Vendor;

export interface QuoteEstimateRequest {
  projectTitle: string;
  clientName: string;
  builtUpAreaSqFt: number;
  qualityTier: string;
  scopeDescription: string;
  location?: string;
}

export interface QuoteEstimateResponse {
  projectTitle: string;
  clientName: string;
  estimatedTimelineMonths: number;
  totalEstimate: number;
  subtotal: number;
  gstAmount: number;
  contingencyAmount: number;
  items: {
    category: string;
    item: string;
    quantity: number;
    unit: string;
    rate: number;
    amount: number;
  }[];
  paymentMilestones: {
    milestone: string;
    percentage: number;
    amount: number;
  }[];
  disclaimer: string;
}

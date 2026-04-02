import { create } from 'zustand';
import { Lead, Employee, Customer, LeadStatus, initialLeads, initialCustomers, initialEmployees, generateCode, calcShippingFee } from '@/data/mockData';

interface AppState {
  leads: Lead[];
  customers: Customer[];
  employees: Employee[];
  leadCounter: number;
  settings: {
    shippingTiers: { min: number; max: number; price: number }[];
    surchargePerPkg: number;
    maxKgPerPkg: number;
    boxFees: { min: number; max: number; fee: number }[];
    monthlySalesKPI: number;
  };
  updateSettings: (updates: Partial<AppState['settings']>) => void;
  addLead: (lead: Omit<Lead, 'id' | 'code' | 'status' | 'totalFee' | 'createdAt' | 'statusHistory'> & { source: Lead['source'] }) => void;
  updateLeadStatus: (id: string, newStatus: LeadStatus, note?: string) => void;
  moveLead: (id: string, newStatus: LeadStatus) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  addEmployee: (emp: Omit<Employee, 'id' | 'ordersHandled'>) => void;
}

export const useStore = create<AppState>((set, get) => ({
  leads: initialLeads,
  customers: initialCustomers,
  employees: initialEmployees,
  leadCounter: 100, // Boosted to avoid any collisions with mock data
  settings: {
    shippingTiers: [
      { min: 5, max: 10, price: 130000 },
      { min: 11, max: 20, price: 124000 },
      { min: 21, max: 30, price: 120000 },
    ],
    surchargePerPkg: 40000,
    maxKgPerPkg: 30,
    boxFees: [
      { min: 5, max: 14, fee: 15000 },
      { min: 15, max: 24, fee: 20000 },
      { min: 25, max: 30, fee: 30000 },
    ],
    monthlySalesKPI: 500000000,
  },
  updateSettings: (updates) => {
    set((s) => ({ settings: { ...s.settings, ...updates } }));
  },
  addLead: (data) => {
    const state = get();
    const counter = state.leadCounter;
    const code = generateCode(data.source, counter);
    const fee = calcShippingFee(data.weightKg, data.dimL, data.dimW, data.dimH, 0, 0, state.settings.surchargePerPkg, state.settings.maxKgPerPkg);
    const now = new Date().toISOString().slice(0, 10);
    const newLead: Lead = {
      ...data,
      id: String(counter),
      code,
      status: 'cho_xac_nhan',
      totalFee: fee.total,
      createdAt: now,
      statusHistory: [{ status: 'cho_xac_nhan', date: now }],
    };
    set({ leads: [...state.leads, newLead], leadCounter: counter + 1 });
  },
  updateLeadStatus: (id, newStatus, note) => {
    set((s) => ({
      leads: s.leads.map((l) =>
        l.id === id
          ? { ...l, status: newStatus, statusHistory: [...l.statusHistory, { status: newStatus, date: new Date().toISOString().slice(0, 10), note }] }
          : l
      ),
    }));
  },
  moveLead: (id, newStatus) => {
    set((s) => ({
      leads: s.leads.map((l) =>
        l.id === id
          ? { ...l, status: newStatus, statusHistory: [...l.statusHistory, { status: newStatus, date: new Date().toISOString().slice(0, 10), note: 'Kéo thả' }] }
          : l
      ),
    }));
  },
  updateLead: (id, updates) => {
    set((s) => ({
      leads: s.leads.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }));
  },
  addEmployee: (emp) => {
    set((s) => ({
      employees: [...s.employees, { ...emp, id: `e${s.employees.length + 1}`, ordersHandled: 0 }],
    }));
  },
}));

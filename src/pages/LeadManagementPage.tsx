import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Lead, LeadStatus, STATUS_LABELS, STATUS_COLORS, formatVND } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';
import AddLeadModal from '@/components/AddLeadModal';
import LeadDetailModal from '@/components/LeadDetailModal';

const ROUND1_COLUMNS: LeadStatus[] = ['lead_moi'];
const ROUND2_COLUMNS: LeadStatus[] = ['dang_cham_soc', 'da_chot_don', 'van_chuyen_noi_dia', 'dang_bay', 'su_co', 'hoan_thanh'];

function KanbanColumn({ status, leads, onCardClick }: { status: LeadStatus; leads: Lead[]; onCardClick: (l: Lead) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-1 min-w-[160px] flex-col rounded-lg border bg-secondary/50 transition-colors ${isOver ? 'ring-2 ring-accent' : ''}`}
    >
      <div className="flex items-center justify-between border-b px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Badge className={`${STATUS_COLORS[status]} text-primary-foreground text-xs`}>{STATUS_LABELS[status]}</Badge>
        </div>
        <span className="text-xs text-muted-foreground">{leads.length}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2 scrollbar-thin" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {leads.map((lead) => (
          <KanbanCard key={lead.id} lead={lead} onClick={() => onCardClick(lead)} />
        ))}
      </div>
    </div>
  );
}

function KanbanCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id });
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      onClick={onClick}
      className={`cursor-grab rounded-md border bg-card p-3 shadow-sm transition-shadow hover:shadow-md ${isDragging ? 'opacity-50' : ''}`}
    >
      <p className="font-mono text-xs text-muted-foreground">{lead.code}</p>
      <p className="mt-1 text-sm font-medium">{lead.senderName}</p>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span>{lead.weightKg} kg</span>
        <span className="font-medium">{formatVND(lead.totalFee)}</span>
      </div>
    </div>
  );
}

export default function LeadManagementPage() {
  const leads = useStore((s) => s.leads);
  const settings = useStore((s) => s.settings);
  const moveLead = useStore((s) => s.moveLead);
  const [addOpen, setAddOpen] = useState(false);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [consultFilter, setConsultFilter] = useState('all');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    if (e.over) {
      const leadId = String(e.active.id);
      const newStatus = e.over.id as LeadStatus;
      const lead = leads.find((l) => l.id === leadId);
      if (lead && lead.status !== newStatus) {
        moveLead(leadId, newStatus);
      }
    }
  };

  const filteredLeads = leads.filter((l) => {
    const q = searchQuery.toLowerCase();
    return (
      l.senderName.toLowerCase().includes(q) ||
      l.senderPhone.includes(q) ||
      l.code.toLowerCase().includes(q)
    );
  });

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 py-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên, SĐT hoặc mã đơn..."
            className="pl-9 h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90 h-10 shrink-0">
          <Plus size={16} className="mr-1" /> Thêm Lead mới
        </Button>
      </div>

      <Tabs defaultValue="round1" className="w-full">
        <TabsList className="mb-4 bg-muted/50 w-full justify-start rounded-lg h-12 p-1">
          <TabsTrigger value="round1" className="font-bold text-sm uppercase tracking-wider h-full px-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">Round 1 (Tư vấn)</TabsTrigger>
          <TabsTrigger value="round2" className="font-bold text-sm uppercase tracking-wider h-full px-8 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md transition-all">Round 2 (Vận hành)</TabsTrigger>
        </TabsList>
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <TabsContent value="round1" className="mt-0 outline-none">
            <div className="mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-muted-foreground">Lọc theo Tư vấn:</span>
              <Select value={consultFilter} onValueChange={setConsultFilter}>
                <SelectTrigger className="w-[200px] h-9 bg-white">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {settings.consultStatuses?.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              {ROUND1_COLUMNS.map((status) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  leads={filteredLeads.filter((l) => l.status === status && (consultFilter === 'all' || l.consultStatus === consultFilter))}
                  onCardClick={setDetailLead}
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="round2" className="mt-0 outline-none overflow-x-auto pb-4">
            <div className="flex gap-2">
              {ROUND2_COLUMNS.map((status) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  leads={filteredLeads.filter((l) => l.status === status)}
                  onCardClick={setDetailLead}
                />
              ))}
            </div>
          </TabsContent>
          <DragOverlay>
            {activeLead && (
              <div className="w-[240px] rounded-md border bg-card p-3 shadow-lg">
                <p className="font-mono text-xs text-muted-foreground">{activeLead.code}</p>
                <p className="mt-1 text-sm font-medium">{activeLead.senderName}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </Tabs>

      <AddLeadModal open={addOpen} onClose={() => setAddOpen(false)} />
      {detailLead && (
        <LeadDetailModal lead={detailLead} onClose={() => setDetailLead(null)} />
      )}
    </div>
  );
}

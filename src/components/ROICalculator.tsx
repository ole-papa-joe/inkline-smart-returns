import React, { useState, useEffect, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { AuthForm } from './auth/AuthForm';
import { AdminDashboard } from './admin/AdminDashboard';
import { ScenarioSidebar, type Scenario } from './roi/ScenarioSidebar';
import { ScenarioInputs } from './roi/ScenarioInputs';
import { ScenarioResults } from './roi/ScenarioResults';
import { Button } from './ui/button';
import { Shield } from 'lucide-react';
import inklineIcon from '@/assets/inkline-icon.png';

export const ROICalculator: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const { toast } = useToast();
  const { role, loading: roleLoading, isAdmin } = useUserRole(user);

  // Form state
  const [name, setName] = useState("New Scenario");
  const [currentOutreach, setCurrentOutreach] = useState("1000");
  const [bookingPct, setBookingPct] = useState("8");
  const [closePct, setClosePct] = useState("30");
  const [avgCustomerValue, setAvgCustomerValue] = useState("8000");
  const [projectedOutreach, setProjectedOutreach] = useState("2000");
  const [inklineInvestment, setInklineInvestment] = useState("24000");

  const activeScenario = useMemo(() => 
    scenarios.find(s => s.id === activeId) || null, 
    [scenarios, activeId]
  );

  // Auth setup
  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (!session) {
          setScenarios([]);
          setActiveId(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load scenarios when user changes
  useEffect(() => {
    if (!user) {
      setScenarios([]);
      setActiveId(null);
      return;
    }

    const loadScenarios = async () => {
      const { data, error } = await supabase
        .from("scenarios")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error loading scenarios:", error);
        toast({
          variant: "destructive",
          title: "Error loading scenarios",
          description: error.message,
        });
        return;
      }

      setScenarios((data as Scenario[]) || []);
      if (data && data.length > 0 && !activeId) {
        setActiveId(data[0].id);
      }
    };

    loadScenarios();
  }, [user, toast, activeId]);

  // Update form when active scenario changes
  useEffect(() => {
    if (!activeScenario) return;

    setName(activeScenario.name);
    setCurrentOutreach(String(activeScenario.current_outreach ?? 0));
    setBookingPct(String((activeScenario.booking_pct * 100).toFixed(1)));
    setClosePct(String((activeScenario.close_pct * 100).toFixed(1)));
    setAvgCustomerValue(String(activeScenario.avg_customer_value ?? 0));
    setProjectedOutreach(String(activeScenario.projected_outreach ?? 0));
    setInklineInvestment(String(activeScenario.inkline_investment ?? 0));
  }, [activeScenario]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  const gatherPayload = () => ({
    name: name.trim() || "Untitled Scenario",
    current_outreach: Number(currentOutreach) || 0,
    booking_pct: Number(bookingPct) / 100 || 0,
    close_pct: Number(closePct) / 100 || 0,
    avg_customer_value: Number(avgCustomerValue) || 0,
    projected_outreach: Number(projectedOutreach) || 0,
    inkline_investment: Number(inklineInvestment) || 0,
  });

  const handleSave = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to save scenarios.",
      });
      return;
    }

    setSaving(true);
    const payload = gatherPayload();

    try {
      if (activeId) {
        // Update existing scenario
        const { data, error } = await supabase
          .from("scenarios")
          .update(payload)
          .eq("id", activeId)
          .select("*")
          .single();

        if (error) throw error;

        setScenarios(prev => prev.map(s => s.id === activeId ? (data as Scenario) : s));
        toast({
          title: "Scenario updated",
          description: "Your scenario has been saved successfully.",
        });
      } else {
        // Create new scenario
        const { data, error } = await supabase
          .from("scenarios")
          .insert([{ ...payload, owner_id: user.id }])
          .select("*")
          .single();

        if (error) throw error;

        setScenarios(prev => [data as Scenario, ...prev]);
        setActiveId((data as Scenario).id);
        toast({
          title: "Scenario created",
          description: "Your new scenario has been saved successfully.",
        });
      }
    } catch (error: any) {
      console.error("Error saving scenario:", error);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: error.message || "Failed to save scenario",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!activeId) return;

    if (!confirm("Delete this scenario? This cannot be undone.")) return;

    try {
      const { error } = await supabase.from("scenarios").delete().eq("id", activeId);
      if (error) throw error;

      setScenarios(prev => prev.filter(s => s.id !== activeId));
      const remainingScenarios = scenarios.filter(s => s.id !== activeId);
      setActiveId(remainingScenarios[0]?.id ?? null);
      
      toast({
        title: "Scenario deleted",
        description: "The scenario has been removed successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting scenario:", error);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message || "Failed to delete scenario",
      });
    }
  };

  const handleNewScenario = () => {
    setActiveId(null);
    setName("New Scenario");
    setCurrentOutreach("1000");
    setBookingPct("8");
    setClosePct("30");
    setAvgCustomerValue("8000");
    setProjectedOutreach("2000");
    setInklineInvestment("24000");
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthStateChange={() => {}} />;
  }

  if (showAdminDashboard && isAdmin) {
    return (
      <AdminDashboard 
        user={user} 
        onBackToApp={() => setShowAdminDashboard(false)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <div className="text-center py-8 px-4">
        <div className="flex items-center justify-center gap-4 mb-4">
          <img 
            src={inklineIcon} 
            alt="inkline Digital Marketing" 
            className="h-12 w-12 object-contain"
          />
          <h1 className="text-3xl md:text-5xl font-bold text-foreground">
            ROI CALCULATOR
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Calculate and save multiple ROI scenarios to compare different investment strategies
        </p>
        
        {/* Admin Access Button */}
        {isAdmin && (
          <div className="mt-4">
            <Button
              onClick={() => setShowAdminDashboard(true)}
              variant="outline"
              className="flex items-center gap-2 bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive/20"
            >
              <Shield className="w-4 h-4" />
              Admin Dashboard
            </Button>
          </div>
        )}
      </div>

      {/* Main App Layout */}
      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-12 gap-6 h-[800px]">
          {/* Sidebar */}
          <div className="col-span-3">
            <ScenarioSidebar
              scenarios={scenarios}
              activeId={activeId}
              onScenarioSelect={setActiveId}
              onNewScenario={handleNewScenario}
              onSignOut={handleSignOut}
              userEmail={user.email}
            />
          </div>

          {/* Inputs */}
          <div className="col-span-4">
            <ScenarioInputs
              name={name}
              currentOutreach={currentOutreach}
              bookingPct={bookingPct}
              closePct={closePct}
              avgCustomerValue={avgCustomerValue}
              projectedOutreach={projectedOutreach}
              inklineInvestment={inklineInvestment}
              onNameChange={setName}
              onCurrentOutreachChange={setCurrentOutreach}
              onBookingPctChange={setBookingPct}
              onClosePctChange={setClosePct}
              onAvgCustomerValueChange={setAvgCustomerValue}
              onProjectedOutreachChange={setProjectedOutreach}
              onInklineInvestmentChange={setInklineInvestment}
              onSave={handleSave}
              onDelete={activeId ? handleDelete : undefined}
              activeId={activeId}
              loading={saving}
            />
          </div>

          {/* Results */}
          <div className="col-span-5">
            <ScenarioResults scenario={activeScenario} />
          </div>
        </div>
      </div>
    </div>
  );
};
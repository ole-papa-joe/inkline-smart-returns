import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, Calculator } from 'lucide-react';
import type { Scenario } from '../roi/ScenarioSidebar';

interface ScenarioWithUser extends Scenario {
  user_email?: string;
}

export const ScenarioManagement: React.FC = () => {
  const [scenarios, setScenarios] = useState<ScenarioWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      // Get all scenarios with user information
      const { data: scenariosData, error: scenariosError } = await supabase
        .from('scenarios')
        .select('*')
        .order('updated_at', { ascending: false });

      if (scenariosError) throw scenariosError;

      // Get user profiles to map emails
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email');

      if (profilesError) throw profilesError;

      // Combine scenarios with user emails
      const scenariosWithUsers = scenariosData?.map(scenario => ({
        ...scenario,
        user_email: profiles?.find(p => p.user_id === scenario.owner_id)?.email
      })) || [];

      setScenarios(scenariosWithUsers);
    } catch (error: any) {
      console.error('Error loading scenarios:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading scenarios',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteScenario = async (scenarioId: string, scenarioName: string) => {
    if (!confirm(`Are you sure you want to delete scenario "${scenarioName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('scenarios')
        .delete()
        .eq('id', scenarioId);

      if (error) throw error;

      // Remove from local state
      setScenarios(prev => prev.filter(scenario => scenario.id !== scenarioId));

      toast({
        title: 'Scenario deleted',
        description: `Scenario "${scenarioName}" has been deleted successfully`,
      });
    } catch (error: any) {
      console.error('Error deleting scenario:', error);
      toast({
        variant: 'destructive',
        title: 'Error deleting scenario',
        description: error.message,
      });
    }
  };

  const formatCurrency = (value: number | null | undefined): string => {
    if (value == null || isNaN(value)) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number | null | undefined): string => {
    if (value == null || isNaN(value)) return "—";
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card bg-gradient-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Calculator className="w-5 h-5" />
          Scenario Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scenario Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Investment</TableHead>
                <TableHead>ROI</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scenarios.map((scenario) => (
                <TableRow key={scenario.id}>
                  <TableCell className="font-medium text-foreground">
                    {scenario.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {scenario.user_email || 'Unknown'}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {formatCurrency(scenario.inkline_investment)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        scenario.roi === null ? 'secondary' : 
                        scenario.roi >= 0 ? 'default' : 'destructive'
                      }
                    >
                      {formatPercent(scenario.roi)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(scenario.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-2"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteScenario(scenario.id, scenario.name)}
                        className="px-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {scenarios.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No scenarios found
          </div>
        )}
      </CardContent>
    </Card>
  );
};
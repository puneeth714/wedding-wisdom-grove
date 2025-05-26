
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../integrations/supabase/client';
import { Button } from '../../ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import StaffDashboardLayout from '../StaffDashboardLayout';
import { useAuth } from '../../../hooks/useAuthContext';

interface PortfolioItem {
  portfolio_id: string;
  portfolio_type: string;
  title: string;
  description: string;
  image_urls: string[];
  video_urls: string[];
  generic_attributes: Record<string, any>;
}

const StaffPortfolioForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/staff/login', { replace: true });
      return;
    }

    fetchPortfolios();
  }, [user, authLoading, navigate]);

  const fetchPortfolios = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const { data: staffData, error: staffError } = await supabase
        .from('vendor_staff')
        .select('staff_id, vendor_id')
        .eq('supabase_auth_uid', user.id)
        .single();

      if (staffError) throw staffError;
      if (!staffData) {
        setError('Staff profile not found.');
        setLoading(false);
        return;
      }

      const { data, error: portfolioError } = await supabase
        .from('staff_portfolios')
        .select('*')
        .eq('staff_id', staffData.staff_id);

      if (portfolioError) throw portfolioError;
      
      const formattedData = (data || []).map(item => ({
        ...item,
        generic_attributes: typeof item.generic_attributes === 'string' 
          ? JSON.parse(item.generic_attributes) 
          : item.generic_attributes || {}
      }));
      
      setPortfolios(formattedData);

    } catch (err: any) {
      console.error('Error fetching portfolios:', err);
      setError(err.message || 'Failed to load portfolios.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading || authLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-sanskara-red" />
          <p className="mt-4 text-lg text-muted-foreground">Loading portfolios...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center">
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      );
    }

    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-700">Staff Portfolio</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your portfolio items and showcase your work.
          </p>
        </CardHeader>
        <CardContent>
          {portfolios.length > 0 ? (
            <div className="space-y-4">
              {portfolios.map(portfolio => (
                <div key={portfolio.portfolio_id} className="p-4 border rounded-lg">
                  <h3 className="font-semibold">{portfolio.title || 'Untitled'}</h3>
                  <p className="text-sm text-gray-600 mb-2">{portfolio.portfolio_type}</p>
                  <p className="text-sm">{portfolio.description || 'No description'}</p>
                  {portfolio.image_urls && portfolio.image_urls.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">{portfolio.image_urls.length} image(s)</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No portfolio items found.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Create your first portfolio item to showcase your work.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <StaffDashboardLayout>
      {renderContent()}
    </StaffDashboardLayout>
  );
};

export default StaffPortfolioForm;

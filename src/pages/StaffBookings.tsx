
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Loader2, BookOpen } from 'lucide-react';
import StaffDashboardLayout from '../components/staff/StaffDashboardLayout';
import { useAuth } from '@/hooks/useAuthContext';
import { Badge } from '@/components/ui/badge';

interface Booking {
  booking_id: string;
  event_date: string;
  booking_status: string;
  total_amount: number;
  notes_for_vendor: string;
  created_at: string;
  users: {
    display_name: string;
    email: string;
  };
}

const StaffBookings: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/staff/login', { replace: true });
      return;
    }

    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: staffData, error: staffError } = await supabase
          .from('vendor_staff')
          .select('vendor_id')
          .eq('supabase_auth_uid', user.id)
          .single();

        if (staffError) throw staffError;
        if (!staffData || !staffData.vendor_id) {
          setError('Staff profile not found or not associated with a vendor.');
          setLoading(false);
          return;
        }

        const { data, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            booking_id,
            event_date,
            booking_status,
            total_amount,
            notes_for_vendor,
            created_at,
            users (
              display_name,
              email
            )
          `)
          .eq('vendor_id', staffData.vendor_id)
          .order('event_date', { ascending: true });

        if (bookingsError) throw bookingsError;
        setBookings(data as unknown as Booking[] || []);

      } catch (err: any) {
        console.error('Error fetching bookings:', err);
        setError(err.message || 'Failed to load bookings.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, authLoading, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-sanskara-green/20 text-sanskara-green';
      case 'pending_confirmation': return 'bg-sanskara-amber/20 text-sanskara-amber';
      case 'cancelled': return 'bg-sanskara-red/20 text-sanskara-red';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderContent = () => {
    if (loading || authLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-sanskara-red" />
          <p className="mt-4 text-lg text-muted-foreground">Loading bookings...</p>
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
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-sanskara-blue" />
            <h1 className="text-2xl font-semibold text-gray-700">Vendor Bookings</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            All bookings for your vendor. Manage and track booking status.
          </p>
        </CardHeader>
        <CardContent>
          {bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map(booking => (
                    <tr key={booking.booking_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.users?.display_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">{booking.users?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(booking.event_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`${getStatusColor(booking.booking_status)} text-xs`}>
                          {booking.booking_status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.total_amount ? `₹${booking.total_amount.toLocaleString()}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={booking.notes_for_vendor || undefined}>
                        {booking.notes_for_vendor || 'No notes'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No bookings found for your vendor.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Bookings will appear here once customers start booking your services.
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

export default StaffBookings;

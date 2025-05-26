
import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Loader2, Calendar, MapPin, Clock, User, Phone, Mail, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuthContext';
import { toast } from '../hooks/use-toast';
import StaffDashboardLayout from '../components/staff/StaffDashboardLayout';

interface Booking {
  booking_id: string;
  user_id: string;
  event_date: string;
  booking_status: string;
  notes_for_vendor: string | null;
  total_amount: number | null;
  advance_amount_due: number | null;
  paid_amount: number | null;
  created_at: string;
  notes_for_user: string | null;
}

const StaffBookings: React.FC = () => {
  const { user, staffProfile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    notes_for_user: '',
    booking_status: ''
  });

  useEffect(() => {
    if (user && staffProfile) {
      fetchBookings();
    }
  }, [user, staffProfile]);

  const fetchBookings = async () => {
    if (!staffProfile?.vendor_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('vendor_id', staffProfile.vendor_id)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bookings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking.booking_id);
    setEditForm({
      notes_for_user: booking.notes_for_user || '',
      booking_status: booking.booking_status
    });
  };

  const handleSaveBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          notes_for_user: editForm.notes_for_user,
          booking_status: editForm.booking_status
        })
        .eq('booking_id', bookingId);

      if (error) throw error;

      setBookings(prev => prev.map(booking => 
        booking.booking_id === bookingId 
          ? { ...booking, notes_for_user: editForm.notes_for_user, booking_status: editForm.booking_status }
          : booking
      ));

      setEditingBooking(null);
      toast({
        title: 'Success',
        description: 'Booking updated successfully'
      });
    } catch (error: any) {
      console.error('Error updating booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to update booking',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending_confirmation': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <StaffDashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading bookings...</span>
        </div>
      </StaffDashboardLayout>
    );
  }

  return (
    <StaffDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Bookings Management</h1>
          <p className="text-muted-foreground">Manage and track all vendor bookings</p>
        </div>

        <div className="grid gap-6">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Bookings Found</h3>
                <p className="text-muted-foreground text-center">
                  Your vendor doesn't have any bookings yet. They'll appear here when customers book your services.
                </p>
              </CardContent>
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.booking_id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Booking #{booking.booking_id.substring(0, 8)}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(booking.event_date)}
                        </span>
                        <Badge className={getStatusColor(booking.booking_status)}>
                          {booking.booking_status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    {editingBooking === booking.booking_id ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSaveBooking(booking.booking_id)}>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingBooking(null)}>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => handleEditBooking(booking)}>
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Customer Information</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Customer ID: {booking.user_id.substring(0, 8)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Financial Details</h4>
                      <div className="space-y-1 text-sm">
                        {booking.total_amount && (
                          <div>Total Amount: ₹{booking.total_amount.toLocaleString()}</div>
                        )}
                        {booking.advance_amount_due && (
                          <div>Advance Due: ₹{booking.advance_amount_due.toLocaleString()}</div>
                        )}
                        {booking.paid_amount && (
                          <div>Paid Amount: ₹{booking.paid_amount.toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {booking.notes_for_vendor && (
                    <div>
                      <h4 className="font-medium mb-2">Customer Notes</h4>
                      <p className="text-sm bg-gray-50 p-3 rounded-md">{booking.notes_for_vendor}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">Status & Notes</h4>
                    {editingBooking === booking.booking_id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">Status</label>
                          <select
                            value={editForm.booking_status}
                            onChange={(e) => setEditForm(prev => ({ ...prev, booking_status: e.target.value }))}
                            className="w-full mt-1 border rounded-md px-3 py-2"
                          >
                            <option value="pending_confirmation">Pending Confirmation</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Notes for Customer</label>
                          <Textarea
                            value={editForm.notes_for_user}
                            onChange={(e) => setEditForm(prev => ({ ...prev, notes_for_user: e.target.value }))}
                            placeholder="Add notes for the customer..."
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        {booking.notes_for_user ? (
                          <p className="text-sm bg-blue-50 p-3 rounded-md">{booking.notes_for_user}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No notes for customer</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </StaffDashboardLayout>
  );
};

export default StaffBookings;

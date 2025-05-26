
import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { Loader2, Plus, Calendar, Edit3, Save, X, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuthContext';
import { toast } from '../hooks/use-toast';
import StaffDashboardLayout from '../components/staff/StaffDashboardLayout';

interface VendorTask {
  vendor_task_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: string;
  status: string;
  is_complete: boolean;
  category: string | null;
  booking_id: string;
  created_at: string;
}

const StaffTasks: React.FC = () => {
  const { user, staffProfile } = useAuth();
  const [tasks, setTasks] = useState<VendorTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    category: '',
    booking_id: ''
  });

  useEffect(() => {
    if (user && staffProfile) {
      fetchTasks();
    }
  }, [user, staffProfile]);

  const fetchTasks = async () => {
    if (!staffProfile?.staff_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendor_tasks')
        .select('*')
        .eq('assigned_staff_id', staffProfile.staff_id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tasks',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!staffProfile?.vendor_id || !editForm.title) return;

    try {
      const { error } = await supabase
        .from('vendor_tasks')
        .insert({
          vendor_id: staffProfile.vendor_id,
          assigned_staff_id: staffProfile.staff_id,
          title: editForm.title,
          description: editForm.description || null,
          due_date: editForm.due_date || null,
          priority: editForm.priority,
          category: editForm.category || null,
          booking_id: editForm.booking_id
        });

      if (error) throw error;

      await fetchTasks();
      setShowCreateForm(false);
      setEditForm({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        category: '',
        booking_id: ''
      });

      toast({
        title: 'Success',
        description: 'Task created successfully'
      });
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive'
      });
    }
  };

  const handleEditTask = (task: VendorTask) => {
    setEditingTask(task.vendor_task_id);
    setEditForm({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date || '',
      priority: task.priority,
      category: task.category || '',
      booking_id: task.booking_id
    });
  };

  const handleSaveTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('vendor_tasks')
        .update({
          title: editForm.title,
          description: editForm.description || null,
          due_date: editForm.due_date || null,
          priority: editForm.priority,
          category: editForm.category || null
        })
        .eq('vendor_task_id', taskId);

      if (error) throw error;

      await fetchTasks();
      setEditingTask(null);
      toast({
        title: 'Success',
        description: 'Task updated successfully'
      });
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive'
      });
    }
  };

  const handleToggleComplete = async (taskId: string, isComplete: boolean) => {
    try {
      const { error } = await supabase
        .from('vendor_tasks')
        .update({
          is_complete: !isComplete,
          status: !isComplete ? 'Completed' : 'To Do'
        })
        .eq('vendor_task_id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.vendor_task_id === taskId 
          ? { ...task, is_complete: !isComplete, status: !isComplete ? 'Completed' : 'To Do' }
          : task
      ));

      toast({
        title: 'Success',
        description: `Task marked as ${!isComplete ? 'completed' : 'incomplete'}`
      });
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const { error } = await supabase
        .from('vendor_tasks')
        .delete()
        .eq('vendor_task_id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.vendor_task_id !== taskId));
      toast({
        title: 'Success',
        description: 'Task deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive'
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <StaffDashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading tasks...</span>
        </div>
      </StaffDashboardLayout>
    );
  }

  return (
    <StaffDashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">My Tasks</h1>
            <p className="text-muted-foreground">Manage your assigned tasks and workload</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>

        {/* Create Task Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Task</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Task title"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="date"
                    value={editForm.due_date}
                    onChange={(e) => setEditForm(prev => ({ ...prev, due_date: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full mt-1 border rounded-md px-3 py-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    value={editForm.category}
                    onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Task category"
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Task description"
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreateTask}>Create Task</Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tasks List */}
        <div className="grid gap-4">
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Tasks Found</h3>
                <p className="text-muted-foreground text-center">
                  You don't have any tasks assigned yet. Create your first task to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            tasks.map((task) => (
              <Card key={task.vendor_task_id} className={task.is_complete ? 'opacity-60' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Checkbox
                        checked={task.is_complete}
                        onCheckedChange={() => handleToggleComplete(task.vendor_task_id, task.is_complete)}
                        className="mt-1"
                      />
                      
                      <div className="flex-1">
                        {editingTask === task.vendor_task_id ? (
                          <div className="space-y-3">
                            <Input
                              value={editForm.title}
                              onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                              className="font-medium"
                            />
                            <Textarea
                              value={editForm.description}
                              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Task description"
                              rows={2}
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                type="date"
                                value={editForm.due_date}
                                onChange={(e) => setEditForm(prev => ({ ...prev, due_date: e.target.value }))}
                              />
                              <select
                                value={editForm.priority}
                                onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value }))}
                                className="border rounded-md px-3 py-2"
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                              </select>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h3 className={`font-medium ${task.is_complete ? 'line-through' : ''}`}>
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                              {task.due_date && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(task.due_date)}
                                </span>
                              )}
                              {task.category && (
                                <Badge variant="outline">{task.category}</Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-1 ml-4">
                      {editingTask === task.vendor_task_id ? (
                        <>
                          <Button size="sm" onClick={() => handleSaveTask(task.vendor_task_id)}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingTask(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleEditTask(task)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteTask(task.vendor_task_id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
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

export default StaffTasks;

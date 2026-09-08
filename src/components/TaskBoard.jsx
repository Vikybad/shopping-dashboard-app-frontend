import { useEffect, useState } from 'react';
import { AddRounded, DeleteOutlineRounded, TaskAltRounded } from '@mui/icons-material';
import { Alert, Box, Button, Card, Checkbox, IconButton, List, ListItem, ListItemText, Stack, TextField, Typography } from '@mui/material';
import api, { getErrorMessage } from '../api/client';

const TaskBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks').then(({ data }) => setTasks(data.data)).catch((requestError) => setError(getErrorMessage(requestError))).finally(() => setLoading(false));
  }, []);

  const addTask = async (event) => {
    event.preventDefault();
    if (newTask.trim().length < 2) return;
    try {
      const { data } = await api.post('/tasks', { taskName: newTask.trim() });
      setTasks((current) => [data.data, ...current]);
      setNewTask('');
    } catch (requestError) { setError(getErrorMessage(requestError, 'Unable to add the task.')); }
  };

  const toggle = async (task) => {
    const completed = !task.completed;
    setTasks((current) => current.map((item) => item._id === task._id ? { ...item, completed } : item));
    try { await api.patch(`/tasks/${task._id}`, { completed }); }
    catch (requestError) { setTasks((current) => current.map((item) => item._id === task._id ? task : item)); setError(getErrorMessage(requestError, 'Unable to update the task.')); }
  };

  const remove = async (task) => {
    const previous = tasks;
    setTasks((current) => current.filter((item) => item._id !== task._id));
    try { await api.delete(`/tasks/${task._id}`); }
    catch (requestError) { setTasks(previous); setError(getErrorMessage(requestError, 'Unable to delete the task.')); }
  };

  const completed = tasks.filter((task) => task.completed).length;
  return (
    <Box>
      <Box mb={3}><Typography variant="h4">Operations tasks</Typography><Typography color="text.secondary" mt={0.5}>{completed} of {tasks.length} completed</Typography></Box>
      <Card sx={{ maxWidth: 850 }}>
        <Box component="form" onSubmit={addTask} sx={{ p: 3, borderBottom: '1px solid #eceef4' }}><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}><TextField placeholder="Add an operational task…" value={newTask} onChange={(event) => setNewTask(event.target.value)} fullWidth inputProps={{ maxLength: 160 }} /><Button type="submit" variant="contained" startIcon={<AddRounded />} disabled={newTask.trim().length < 2}>Add task</Button></Stack></Box>
        {error && <Alert severity="error" onClose={() => setError('')} sx={{ m: 2 }}>{error}</Alert>}
        {loading ? <Typography color="text.secondary" py={7} align="center">Loading tasks…</Typography> : tasks.length === 0 ? <Box py={8} textAlign="center"><TaskAltRounded color="disabled" sx={{ fontSize: 42 }} /><Typography variant="h6" mt={1}>Nothing on your list</Typography><Typography color="text.secondary">Add the next action for your store.</Typography></Box> : <List disablePadding>{tasks.map((task) => <ListItem key={task._id} divider secondaryAction={<IconButton edge="end" aria-label="Delete task" onClick={() => remove(task)}><DeleteOutlineRounded /></IconButton>} sx={{ px: 2.5, py: 1.2 }}><Checkbox checked={task.completed} onChange={() => toggle(task)} /><ListItemText primary={task.taskName} primaryTypographyProps={{ fontWeight: 600, color: task.completed ? 'text.secondary' : 'text.primary', sx: { textDecoration: task.completed ? 'line-through' : 'none' } }} secondary={task.completed ? 'Completed' : 'Open'} /></ListItem>)}</List>}
      </Card>
    </Box>
  );
};

export default TaskBoard;

import React, { useState, useEffect } from 'react';
import { ref, onValue, push, remove, update } from 'firebase/database';
import { database } from '../../firebase';
import EventTable from './EventTable';
import CreateEventForm from './CreateEventForm';
import UpdateEventForm from './UpdateEventForm';
import Toast from '../common/Toast';
import ConfirmModal from '../common/ConfirmModal';

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, event: null });

  // Fetch all events
  useEffect(() => {
    const eventsRef = ref(database, 'events');
    
    const unsubscribe = onValue(eventsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const eventsArray = Object.entries(data).map(([id, event]) => ({
          id,
          ...event
        }));
        setEvents(eventsArray);
      } else {
        setEvents([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Reset form state
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setLocation('');
    setMaxParticipants('');
    setEditingId(null);
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // Add new event
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const eventsRef = ref(database, 'events');
      await push(eventsRef, {
        title,
        description,
        date,
        time,
        location,
        maxParticipants: parseInt(maxParticipants),
        currentParticipants: 0,
        createdAt: new Date().toISOString(),
        status: 'active'
      });

      resetForm();
      showToast('Event created successfully!');
    } catch (error) {
      console.error('Error adding event:', error);
      showToast('Failed to create event', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete event
  const handleDelete = async (event) => {
    setDeleteConfirm({ show: true, event });
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      const event = deleteConfirm.event;
      const eventRef = ref(database, `events/${event.id}`);
      await remove(eventRef);
      showToast('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      showToast('Failed to delete event', 'error');
    } finally {
      setDeleteConfirm({ show: false, event: null });
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirm({ show: false, event: null });
  };

  // Update event
  const handleUpdate = async (id) => {
    setIsSubmitting(true);
    try {
      const eventRef = ref(database, `events/${id}`);
      await update(eventRef, {
        title,
        description,
        date,
        time,
        location,
        maxParticipants: parseInt(maxParticipants),
        updatedAt: new Date().toISOString()
      });

      resetForm();
      showToast('Event updated successfully!');
    } catch (error) {
      console.error('Error updating event:', error);
      showToast('Failed to update event', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set event for editing and open modal
  const handleEdit = (event) => {
    setTitle(event.title);
    setDescription(event.description);
    setDate(event.date);
    setTime(event.time);
    setLocation(event.location);
    setMaxParticipants(event.maxParticipants.toString());
    setEditingId(event.id);
    document.getElementById('update_event_modal').showModal();
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Event Management</h2>
          
          <CreateEventForm
            title={title}
            description={description}
            date={date}
            time={time}
            location={location}
            maxParticipants={maxParticipants}
            isSubmitting={isSubmitting}
            onTitleChange={(e) => setTitle(e.target.value)}
            onDescriptionChange={(e) => setDescription(e.target.value)}
            onDateChange={(e) => setDate(e.target.value)}
            onTimeChange={(e) => setTime(e.target.value)}
            onLocationChange={(e) => setLocation(e.target.value)}
            onMaxParticipantsChange={(e) => setMaxParticipants(e.target.value)}
            onSubmit={handleSubmit}
            onClose={resetForm}
          />

          <UpdateEventForm
            title={title}
            description={description}
            date={date}
            time={time}
            location={location}
            maxParticipants={maxParticipants}
            isSubmitting={isSubmitting}
            onTitleChange={(e) => setTitle(e.target.value)}
            onDescriptionChange={(e) => setDescription(e.target.value)}
            onDateChange={(e) => setDate(e.target.value)}
            onTimeChange={(e) => setTime(e.target.value)}
            onLocationChange={(e) => setLocation(e.target.value)}
            onMaxParticipantsChange={(e) => setMaxParticipants(e.target.value)}
            onUpdate={() => handleUpdate(editingId)}
            onClose={resetForm}
          />

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <EventTable
                events={events}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <ConfirmModal
        isOpen={deleteConfirm.show}
        title="Delete Event"
        message={`Are you sure you want to delete "${deleteConfirm.event?.title}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default EventManagement; 
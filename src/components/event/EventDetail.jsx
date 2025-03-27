import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../../firebase';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import Toast from '../common/Toast';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const fetchEvent = () => {
      const eventRef = ref(database, `events/${id}`);
      
      return onValue(eventRef, (snapshot) => {
        setLoading(true);
        try {
          const data = snapshot.val();
          if (data) {
            setEvent({ id, ...data });
            setError(null);
          } else {
            setError('Event not found');
            setEvent(null);
          }
        } catch (err) {
          setError('Error loading event');
          setEvent(null);
        } finally {
          setLoading(false);
        }
      }, (error) => {
        setError('Error loading event');
        setLoading(false);
      });
    };

    const unsubscribe = fetchEvent();
    return () => unsubscribe();
  }, [id]);

  const handleRegister = async () => {
    if (!event) return;

    setRegistering(true);
    try {
      // Check if event is full
      if (event.currentParticipants >= event.maxParticipants) {
        throw new Error('Event is already full');
      }

      // Update participant count
      const eventRef = ref(database, `events/${id}`);
      await update(eventRef, {
        currentParticipants: (event.currentParticipants || 0) + 1
      });

      setToast({
        show: true,
        message: 'Successfully registered for the event!',
        type: 'success'
      });
    } catch (error) {
      setToast({
        show: true,
        message: error.message || 'Failed to register for the event',
        type: 'error'
      });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex justify-center items-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-200 flex flex-col justify-center items-center gap-4">
        <div className="text-error text-xl">{error}</div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/events')}
        >
          Back to Events
        </button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-base-200 flex flex-col justify-center items-center gap-4">
        <div className="text-xl">Event not found</div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/events')}
        >
          Back to Events
        </button>
      </div>
    );
  }

  const isEventFull = event.currentParticipants >= event.maxParticipants;
  const eventDate = new Date(event.date);
  const isPastEvent = eventDate < new Date();

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-start">
                <h2 className="card-title text-3xl mb-4">{event.title}</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/events')}
                >
                  Back to Events
                </button>
              </div>

              <div className="space-y-6">
                {/* Description */}
                <div className="prose max-w-none">
                  <p>{event.description}</p>
                </div>

                {/* Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-primary" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaClock className="text-primary" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-primary" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaUsers className="text-primary" />
                    <span>{event.currentParticipants || 0}/{event.maxParticipants} participants</span>
                  </div>
                </div>

                {/* Registration Status */}
                <div className="card bg-base-200">
                  <div className="card-body">
                    <h3 className="card-title">Registration Status</h3>
                    <div className="flex flex-col gap-2">
                      <div className="text-lg">
                        {isEventFull ? (
                          <span className="text-error">Event is full</span>
                        ) : isPastEvent ? (
                          <span className="text-warning">Event has ended</span>
                        ) : (
                          <span className="text-success">
                            {event.maxParticipants - (event.currentParticipants || 0)} spots remaining
                          </span>
                        )}
                      </div>
                      <button
                        className="btn btn-primary w-full md:w-auto"
                        onClick={handleRegister}
                        disabled={isEventFull || isPastEvent || registering}
                      >
                        {registering ? (
                          <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Registering...
                          </>
                        ) : isEventFull ? (
                          'Event Full'
                        ) : isPastEvent ? (
                          'Event Ended'
                        ) : (
                          'Register Now'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
    </div>
  );
};

export default EventDetail; 
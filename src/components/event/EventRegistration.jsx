import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../../firebase';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaArrowLeft } from 'react-icons/fa';
import Toast from '../common/Toast';

const EventRegistration = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    numberOfGuests: 1
  });
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!event) return;

    setRegistering(true);
    try {
      // Check if event is full
      if (event.currentParticipants >= event.maxParticipants) {
        throw new Error('Event is already full');
      }

      // Check if requested number of guests exceeds available spots
      const availableSpots = event.maxParticipants - (event.currentParticipants || 0);
      if (formData.numberOfGuests > availableSpots) {
        throw new Error(`Only ${availableSpots} spots remaining`);
      }

      // Update participant count
      const eventRef = ref(database, `events/${id}`);
      await update(eventRef, {
        currentParticipants: (event.currentParticipants || 0) + formData.numberOfGuests
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        numberOfGuests: 1
      });

      setToast({
        show: true,
        message: `Successfully registered ${formData.numberOfGuests} guest(s) for the event!`,
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
          onClick={() => navigate('/')}
        >
          Back to Home
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
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
      </div>
    );
  }

  const isEventFull = event.currentParticipants >= event.maxParticipants;
  const eventDate = new Date(event.date);
  const isPastEvent = eventDate < new Date();
  const availableSpots = event.maxParticipants - (event.currentParticipants || 0);

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <button 
            className="btn btn-ghost mb-6"
            onClick={() => navigate('/')}
          >
            <FaArrowLeft className="mr-2" />
            Back to Home
          </button>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-3xl mb-4">{event.title}</h2>

              <div className="space-y-6">
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

                {/* Description */}
                <div className="prose max-w-none">
                  <p>{event.description}</p>
                </div>

                {/* Registration Form */}
                <div className="card bg-base-200">
                  <div className="card-body">
                    <h3 className="card-title">Register for Event</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Name</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          className="input input-bordered"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          disabled={isEventFull || isPastEvent || registering}
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Email</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          className="input input-bordered"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          disabled={isEventFull || isPastEvent || registering}
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Phone Number</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          className="input input-bordered"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          disabled={isEventFull || isPastEvent || registering}
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Number of Guests</span>
                        </label>
                        <input
                          type="number"
                          name="numberOfGuests"
                          className="input input-bordered"
                          value={formData.numberOfGuests}
                          onChange={handleInputChange}
                          min="1"
                          max={availableSpots}
                          required
                          disabled={isEventFull || isPastEvent || registering}
                        />
                      </div>

                      <div className="text-sm text-gray-500">
                        {isEventFull ? (
                          <span className="text-error">Event is full</span>
                        ) : isPastEvent ? (
                          <span className="text-warning">Event has ended</span>
                        ) : (
                          <span className="text-success">
                            {availableSpots} spots remaining
                          </span>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary w-full"
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
                    </form>
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

export default EventRegistration; 
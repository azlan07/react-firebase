import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue, remove, update } from 'firebase/database';
import { ref as storageRef, deleteObject } from 'firebase/storage';
import { database, storage } from '../../firebase';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaEye, FaPencilAlt, FaTrash } from 'react-icons/fa';
import Toast from '../common/Toast';
import { useAuth } from '../../context/AuthContext';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  useEffect(() => {
    const fetchEventAndRegistrations = () => {
      const eventRef = ref(database, `events/${id}`);
      const registrationsRef = ref(database, `eventRegistrations/${id}`);
      
      const unsubscribeEvent = onValue(eventRef, (snapshot) => {
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
      });

      const unsubscribeRegistrations = onValue(registrationsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const registrationsList = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value
          }));
          setRegistrations(registrationsList);
        } else {
          setRegistrations([]);
        }
      });

      return () => {
        unsubscribeEvent();
        unsubscribeRegistrations();
      };
    };

    const unsubscribe = fetchEventAndRegistrations();
    return () => unsubscribe();
  }, [id]);

  const handleViewRegistration = (registration) => {
    setSelectedRegistration(registration);
    document.getElementById('view_registration_modal').showModal();
  };

  const handleDeleteRegistration = async (registration) => {
    try {
      await remove(ref(database, `eventRegistrations/${id}/${registration.id}`));
      setToast({
        show: true,
        message: 'Registration deleted successfully',
        type: 'success'
      });
    } catch (error) {
      setToast({
        show: true,
        message: error.message || 'Failed to delete registration',
        type: 'error'
      });
    }
  };

  const handleDeleteAttendancePhoto = async (registration) => {
    try {
      // Delete photo from storage
      const photoRef = storageRef(storage, `attendance-photos/${id}/${registration.id}`);
      await deleteObject(photoRef);

      // Update registration to remove photo URL and reset attendance
      const registrationRef = ref(database, `eventRegistrations/${id}/${registration.id}`);
      await update(registrationRef, {
        attendancePhotoUrl: null,
        attended: false,
        attendedAt: null
      });

      setToast({
        show: true,
        message: 'Attendance photo deleted successfully',
        type: 'success'
      });
    } catch (error) {
      setToast({
        show: true,
        message: error.message || 'Failed to delete attendance photo',
        type: 'error'
      });
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

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-start mb-6">
                <h2 className="card-title text-3xl">{event.title}</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/events')}
                >
                  Back to Events
                </button>
              </div>

              <div className="grid gap-8">
                {/* Event Details */}
                <div className="grid gap-6">
                  <div className="prose max-w-none">
                    <h3 className="text-xl font-semibold mb-2">Description</h3>
                    <p>{event.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card bg-base-200">
                      <div className="card-body">
                        <h3 className="card-title text-lg">Date & Time</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-primary" />
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaClock className="text-primary" />
                            <span>{event.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card bg-base-200">
                      <div className="card-body">
                        <h3 className="card-title text-lg">Location & Capacity</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-primary" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaUsers className="text-primary" />
                            <span>
                              {event.currentParticipants || 0}/{event.maxParticipants} participants
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Registrations Table */}
                  <div className="card bg-base-200">
                    <div className="card-body">
                      <h3 className="card-title text-lg mb-4">Registered Participants</h3>
                      <div className="overflow-x-auto">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Email</th>
                              <th>WhatsApp</th>
                              <th>Guests</th>
                              <th>Payment</th>
                              <th>Attendance</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {registrations.map((registration) => (
                              <tr key={registration.id}>
                                <td>{registration.name}</td>
                                <td>{registration.email}</td>
                                <td>{registration.whatsapp}</td>
                                <td>{registration.numberOfGuests}</td>
                                <td>
                                  <span className={`badge ${registration.isPaid ? 'badge-success' : 'badge-warning'}`}>
                                    {registration.isPaid ? 'Paid' : 'Unpaid'}
                                  </span>
                                </td>
                                <td>
                                  <span className={`badge ${registration.attended ? 'badge-success' : 'badge-ghost'}`}>
                                    {registration.attended ? 'Present' : 'Not Confirmed'}
                                  </span>
                                </td>
                                <td>
                                  <div className="flex gap-2">
                                    <button
                                      className="btn btn-ghost btn-sm tooltip"
                                      data-tip="View Details"
                                      onClick={() => handleViewRegistration(registration)}
                                    >
                                      <FaEye />
                                    </button>
                                    {currentUser && registration.userId === currentUser.uid && (
                                      <button
                                        className="btn btn-ghost btn-sm tooltip text-error"
                                        data-tip="Delete Registration"
                                        onClick={() => handleDeleteRegistration(registration)}
                                      >
                                        <FaTrash />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Registration Modal */}
      <dialog id="view_registration_modal" className="modal">
        {selectedRegistration && (
          <div className="modal-box w-11/12 max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Registration Details</h3>
            <div className="space-y-4">
              <div>
                <label className="font-semibold">Name:</label>
                <p>{selectedRegistration.name}</p>
              </div>
              <div>
                <label className="font-semibold">Email:</label>
                <p>{selectedRegistration.email}</p>
              </div>
              <div>
                <label className="font-semibold">WhatsApp:</label>
                <p>{selectedRegistration.whatsapp}</p>
              </div>
              <div>
                <label className="font-semibold">Number of Guests:</label>
                <p>{selectedRegistration.numberOfGuests}</p>
              </div>
              <div>
                <label className="font-semibold">Payment Status:</label>
                <p>
                  <span className={`badge ${selectedRegistration.isPaid ? 'badge-success' : 'badge-warning'}`}>
                    {selectedRegistration.isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                </p>
              </div>
              {selectedRegistration.isPaid && selectedRegistration.paymentProofUrl && (
                <div>
                  <label className="font-semibold">Payment Proof:</label>
                  <div className="mt-2">
                    <img
                      src={selectedRegistration.paymentProofUrl}
                      alt="Payment proof"
                      className="max-w-sm rounded-lg shadow-lg"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="font-semibold">Attendance Status:</label>
                <p>
                  <span className={`badge ${selectedRegistration.attended ? 'badge-success' : 'badge-ghost'}`}>
                    {selectedRegistration.attended ? 'Present' : 'Not Confirmed'}
                  </span>
                  {selectedRegistration.attendedAt && (
                    <span className="ml-2 text-sm text-gray-500">
                      at {new Date(selectedRegistration.attendedAt).toLocaleString()}
                    </span>
                  )}
                </p>
              </div>
              {selectedRegistration.attended && (
                <div>
                  <label className="font-semibold">Attendance Photo:</label>
                  {selectedRegistration.attendancePhotoUrl ? (
                    <div className="mt-2 relative group">
                      <img
                        src={selectedRegistration.attendancePhotoUrl}
                        alt="Attendance photo"
                        className="max-w-sm rounded-lg shadow-lg"
                      />
                      {currentUser && selectedRegistration.userId === currentUser.uid && (
                        <button
                          className="btn btn-error btn-sm absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteAttendancePhoto(selectedRegistration)}
                        >
                          <FaTrash /> Delete Photo
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-error">Photo not available or was deleted</p>
                  )}
                </div>
              )}
              <div>
                <label className="font-semibold">Registration Date:</label>
                <p>{new Date(selectedRegistration.registeredAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="modal-action">
              <form method="dialog">
                <button className="btn">Close</button>
              </form>
            </div>
          </div>
        )}
      </dialog>

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
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue, update, push, remove } from 'firebase/database';
import { storage, database } from '../../firebase';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { FaArrowLeft, FaTrash } from 'react-icons/fa';
import Toast from '../common/Toast';
import EventDetails from './EventDetails';
import RegistrationForm from './RegistrationForm';
import CameraModal from './CameraModal';
import { useAuth } from '../../context/AuthContext';

const EventRegistration = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    numberOfGuests: 1,
    specialRequests: '',
    isPaid: false,
    paymentProof: null,
    paymentProofPreview: null
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);

  useEffect(() => {
    const fetchEventAndRegistrations = () => {
      const eventRef = ref(database, `events/${id}`);
      const registrationsRef = ref(database, `eventRegistrations/${id}`);
      
      const eventUnsubscribe = onValue(eventRef, (snapshot) => {
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

      const registrationsUnsubscribe = onValue(registrationsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const registrationsArray = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value
          }));
          setRegistrations(registrationsArray);
        } else {
          setRegistrations([]);
        }
      });

      return () => {
        eventUnsubscribe();
        registrationsUnsubscribe();
      };
    };

    const unsubscribe = fetchEventAndRegistrations();
    return () => unsubscribe();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        paymentProof: file,
        paymentProofPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!event) return;

    setRegistering(true);
    try {
      // Calculate new total participants
      const newTotalParticipants = event.currentParticipants + parseInt(formData.numberOfGuests);

      // Check if event is full or would exceed capacity
      if (newTotalParticipants > event.maxParticipants) {
        throw new Error(`Cannot register ${formData.numberOfGuests} guests. Only ${event.maxParticipants - event.currentParticipants} spots remaining.`);
      }

      let paymentProofUrl = null;
      if (formData.isPaid && formData.paymentProof) {
        // Upload payment proof if provided
        const fileRef = storageRef(storage, `payment-proofs/${id}/${currentUser.uid}-${Date.now()}`);
        await uploadBytes(fileRef, formData.paymentProof);
        paymentProofUrl = await getDownloadURL(fileRef);
      }

      // Add registration to eventRegistrations
      const registrationsRef = ref(database, `eventRegistrations/${id}`);
      await push(registrationsRef, {
        name: formData.name,
        email: currentUser.email,
        whatsapp: formData.whatsapp,
        numberOfGuests: parseInt(formData.numberOfGuests),
        specialRequests: formData.specialRequests,
        isPaid: formData.isPaid,
        paymentProofUrl,
        userId: currentUser.uid,
        registeredAt: new Date().toISOString()
      });

      // Update participant count with the new total
      const eventRef = ref(database, `events/${id}`);
      await update(eventRef, {
        currentParticipants: newTotalParticipants
      });

      // Reset form
      setFormData({
        name: '',
        whatsapp: '',
        numberOfGuests: 1,
        specialRequests: '',
        isPaid: false,
        paymentProof: null,
        paymentProofPreview: null
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

  const handleModalClose = () => {
    setFormData({
      name: '',
      whatsapp: '',
      numberOfGuests: 1,
      specialRequests: '',
      isPaid: false,
      paymentProof: null,
      paymentProofPreview: null
    });
  };

  const handleViewRegistration = (registration) => {
    // Show registration details in a modal
    document.getElementById('view_registration_modal').showModal();
    setSelectedRegistration(registration);
  };

  const handleEditRegistration = (registration) => {
    // Set form data for editing
    setFormData({
      name: registration.name,
      whatsapp: registration.whatsapp,
      numberOfGuests: registration.numberOfGuests,
      specialRequests: registration.specialRequests,
      isPaid: registration.isPaid,
      paymentProof: null,
      paymentProofPreview: registration.paymentProofUrl
    });
    setSelectedRegistration(registration);
    document.getElementById('registration_modal').showModal();
  };

  const handleDeleteRegistration = async (registration) => {
    try {
      // Calculate new total after removing guests
      const newTotalParticipants = event.currentParticipants - parseInt(registration.numberOfGuests);

      // Update event participants count
      const eventRef = ref(database, `events/${id}`);
      await update(eventRef, {
        currentParticipants: newTotalParticipants
      });

      // Delete registration
      const registrationRef = ref(database, `eventRegistrations/${id}/${registration.id}`);
      await remove(registrationRef);

      // Delete payment proof if exists
      if (registration.paymentProofUrl) {
        const fileRef = storageRef(storage, registration.paymentProofUrl);
        await deleteObject(fileRef);
      }

      setToast({
        show: true,
        message: 'Registration successfully deleted',
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

  const handleConfirmAttendance = async (registration) => {
    document.getElementById('camera_modal').showModal();
    setSelectedRegistration(registration);
  };

  const handlePhotoCapture = async (photoData) => {
    try {
      // Convert base64 to blob
      const response = await fetch(photoData);
      const blob = await response.blob();

      // Upload photo to storage
      const photoRef = storageRef(storage, `attendance-photos/${id}/${selectedRegistration.id}`);
      await uploadBytes(photoRef, blob);
      const photoUrl = await getDownloadURL(photoRef);

      // Update registration with attendance confirmation and photo
      const registrationRef = ref(database, `eventRegistrations/${id}/${selectedRegistration.id}`);
      await update(registrationRef, {
        attended: true,
        attendedAt: new Date().toISOString(),
        attendancePhotoUrl: photoUrl
      });

      setToast({
        show: true,
        message: 'Attendance confirmed successfully!',
        type: 'success'
      });
    } catch (error) {
      setToast({
        show: true,
        message: error.message || 'Failed to confirm attendance',
        type: 'error'
      });
    }
  };

  const handleDeleteAttendancePhoto = async (registration) => {
    try {
      setIsDeletingPhoto(true);
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

      // Close the modal
      document.getElementById('view_registration_modal').close();
    } catch (error) {
      setToast({
        show: true,
        message: error.message || 'Failed to delete attendance photo',
        type: 'error'
      });
    } finally {
      setIsDeletingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex justify-center items-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-base-200 flex flex-col justify-center items-center gap-4">
        <div className="text-error text-xl">{error || 'Event not found'}</div>
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
              
              <EventDetails 
                event={event}
                registrations={registrations}
                currentUser={currentUser}
                onViewRegistration={handleViewRegistration}
                onEditRegistration={handleEditRegistration}
                onDeleteRegistration={handleDeleteRegistration}
                onConfirmAttendance={handleConfirmAttendance}
              />

              <RegistrationForm 
                formData={formData}
                handleInputChange={handleInputChange}
                handleFileChange={handleFileChange}
                handleSubmit={handleSubmit}
                isEventFull={isEventFull}
                isPastEvent={isPastEvent}
                registering={registering}
                availableSpots={availableSpots}
                onClose={handleModalClose}
                currentUser={currentUser}
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
                <label className="font-semibold">Special Requests:</label>
                <p>{selectedRegistration.specialRequests || '-'}</p>
              </div>
              <div>
                <label className="font-semibold">Payment Status:</label>
                <p>
                  <span className={`badge ${selectedRegistration.isPaid ? 'badge-success' : 'badge-warning'}`}>
                    {selectedRegistration.isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                </p>
              </div>
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
                          disabled={isDeletingPhoto}
                        >
                          {isDeletingPhoto ? (
                            <>
                              <span className="loading loading-spinner loading-sm"></span>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <FaTrash /> Delete Photo
                            </>
                          )}
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

      <CameraModal 
        onCapture={handlePhotoCapture}
        onClose={() => document.getElementById('camera_modal').close()}
      />
    </div>
  );
};

export default EventRegistration;

import React from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaEye, FaPencilAlt, FaTrash, FaCheck } from 'react-icons/fa';

const EventDetails = ({ 
  event, 
  registrations, 
  currentUser,
  onViewRegistration,
  onEditRegistration,
  onDeleteRegistration,
  onConfirmAttendance
}) => {
  const isAttendanceTime = (eventDate, eventTime) => {
    const now = new Date();
    const [hours, minutes] = eventTime.split(':');
    const eventDateTime = new Date(eventDate);
    eventDateTime.setHours(parseInt(hours), parseInt(minutes));

    // Check if it's the same day
    const isSameDay = now.toDateString() === eventDateTime.toDateString();
    
    // Calculate 30 minutes before event
    const thirtyMinsBefore = new Date(eventDateTime);
    thirtyMinsBefore.setMinutes(thirtyMinsBefore.getMinutes() - 30);

    return isSameDay && now >= thirtyMinsBefore && now <= eventDateTime;
  };

  return (
    <div className="space-y-6">
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

      <div className="prose max-w-none">
        <p>{event.description}</p>
      </div>

      {registrations && registrations.length > 0 && (
        <div className="overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4">Registered Participants</h3>
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>WhatsApp</th>
                <th>Guests</th>
                <th>Payment Status</th>
                <th>Attendance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((registration) => (
                <tr key={registration.id}>
                  <td>{registration.name}</td>
                  <td>{registration.whatsapp}</td>
                  <td>{registration.numberOfGuests}</td>
                  <td>
                    <span className={`badge ${registration.isPaid ? 'badge-success' : 'badge-warning'}`}>
                      {registration.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td>
                    {isAttendanceTime(event.date, event.time) ? (
                      currentUser && registration.userId === currentUser.uid && !registration.attended ? (
                        <button
                          className="btn btn-success btn-sm tooltip"
                          data-tip="Confirm Attendance"
                          onClick={() => onConfirmAttendance(registration)}
                        >
                          <FaCheck /> Confirm
                        </button>
                      ) : (
                        <span className={`badge ${registration.attended ? 'badge-success' : 'badge-ghost'}`}>
                          {registration.attended ? 'Present' : 'Not Confirmed'}
                        </span>
                      )
                    ) : (
                      <span className="badge badge-ghost">
                        {registration.attended ? 'Present' : 'Not Time Yet'}
                      </span>
                    )}
                  </td>
                  <td>
                    {currentUser && registration.userId === currentUser.uid && (
                      <div className="flex gap-2">
                        <button
                          className="btn btn-ghost btn-sm tooltip"
                          data-tip="View Details"
                          onClick={() => onViewRegistration(registration)}
                        >
                          <FaEye className="text-info" />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm tooltip"
                          data-tip="Edit Registration"
                          onClick={() => onEditRegistration(registration)}
                        >
                          <FaPencilAlt className="text-warning" />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm tooltip"
                          data-tip="Delete Registration"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this registration?')) {
                              onDeleteRegistration(registration);
                            }
                          }}
                        >
                          <FaTrash className="text-error" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EventDetails;

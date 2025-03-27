import React, { useState } from 'react';
import { FaSearch, FaEye, FaEdit, FaTrash, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const EventTable = ({ events, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 10;

  // Filter events based on search term
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort events by date (newest first)
  const sortedEvents = [...filteredEvents].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Calculate pagination
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = sortedEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(sortedEvents.length / eventsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="space-y-4">
      {/* Search Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="form-control w-full md:w-96">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="input input-bordered w-full pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Showing {currentEvents.length} of {sortedEvents.length} events
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th className="w-1/4">Title</th>
              <th className="w-1/4">Date & Time</th>
              <th className="w-1/4">Location</th>
              <th className="w-1/4">Participants</th>
              <th className="w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentEvents.map((event) => (
              <tr key={event.id} className="hover:bg-base-200">
                <td>
                  <div className="font-medium">{event.title}</div>
                  <div className="text-sm text-gray-500 line-clamp-2">{event.description}</div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-gray-500" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FaClock className="text-gray-500" />
                    <span>{event.time}</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-gray-500" />
                    <span>{event.location}</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <FaUsers className="text-gray-500" />
                    <span>{event.currentParticipants}/{event.maxParticipants}</span>
                  </div>
                </td>
                <td>
                  <div className="flex gap-2">
                    <Link
                      to={`/events/${event.id}`}
                      className="btn btn-ghost btn-sm"
                      title="View Details"
                    >
                      <FaEye />
                    </Link>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => onEdit(event)}
                      title="Edit Event"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm text-error"
                      onClick={() => onDelete(event)}
                      title="Delete Event"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* No Results Message */}
      {currentEvents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No events found
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            className="btn btn-sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              className={`btn btn-sm ${currentPage === index + 1 ? 'btn-primary' : ''}`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button
            className="btn btn-sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default EventTable; 
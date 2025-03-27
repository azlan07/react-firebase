import React from 'react';
import { FaPlus } from 'react-icons/fa';

const CreateEventForm = ({
  title,
  description,
  date,
  time,
  location,
  maxParticipants,
  isSubmitting,
  onTitleChange,
  onDescriptionChange,
  onDateChange,
  onTimeChange,
  onLocationChange,
  onMaxParticipantsChange,
  onSubmit,
  onClose
}) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(e);
    document.getElementById('create_event_modal').close();
  };

  return (
    <div className="card bg-base-100 shadow-xl mb-8">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Create New Event</h3>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => document.getElementById('create_event_modal').showModal()}
            disabled={isSubmitting}
          >
            <FaPlus className="mr-2" />
            Create Event
          </button>
        </div>

        <dialog id="create_event_modal" className="modal">
          <div className="modal-box w-11/12 max-w-3xl">
            <h3 className="font-bold text-lg mb-4">Create New Event</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Title</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter event title"
                  className="input input-bordered w-full"
                  value={title}
                  onChange={onTitleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  placeholder="Enter event description"
                  className="textarea textarea-bordered h-32"
                  value={description}
                  onChange={onDescriptionChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Date</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={date}
                    onChange={onDateChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Time</span>
                  </label>
                  <input
                    type="time"
                    className="input input-bordered w-full"
                    value={time}
                    onChange={onTimeChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Location</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter event location"
                  className="input input-bordered w-full"
                  value={location}
                  onChange={onLocationChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Maximum Participants</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={maxParticipants}
                  onChange={onMaxParticipantsChange}
                  required
                  min="1"
                  disabled={isSubmitting}
                />
              </div>
              <div className="modal-action">
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-md mr-2"></span>
                      Creating...
                    </>
                  ) : (
                    'Create Event'
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn"
                  onClick={() => {
                    if (!isSubmitting) {
                      document.getElementById('create_event_modal').close();
                      onClose();
                    }
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </dialog>
      </div>
    </div>
  );
};

export default CreateEventForm; 
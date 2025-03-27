import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const RegistrationForm = ({ 
  formData, 
  handleInputChange,
  handleFileChange,
  handleSubmit, 
  isEventFull, 
  isPastEvent, 
  registering,
  availableSpots,
  onClose,
  currentUser
}) => {
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await handleSubmit(e);
    // Only close if not registering
    if (!registering) {
      document.getElementById('registration_modal').close();
      onClose();
    }
  };

  return (
    <>
      <button 
        className="btn btn-primary w-full mt-6"
        onClick={() => document.getElementById('registration_modal').showModal()}
        disabled={isEventFull || isPastEvent || registering}
      >
        {isEventFull ? 'Event Full' : isPastEvent ? 'Event Ended' : 'Register Now'}
      </button>

      <dialog id="registration_modal" className="modal">
        <div className="modal-box w-11/12 max-w-2xl">
          <h3 className="font-bold text-lg mb-4">Register for Event</h3>
          <form onSubmit={handleFormSubmit} className="space-y-4">
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
                disabled={registering}
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
                value={currentUser.email}
                disabled={true}
              />
              <label className="label">
                <span className="label-text-alt">Email will be taken from your account</span>
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">WhatsApp Number</span>
                <span className="label-text-alt">
                  <FaWhatsapp className="inline mr-1" />
                  Include country code
                </span>
              </label>
              <input
                type="tel"
                name="whatsapp"
                className="input input-bordered"
                value={formData.whatsapp}
                onChange={handleInputChange}
                placeholder="+62xxx"
                required
                disabled={registering}
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
                disabled={registering}
              />
              <label className="label">
                <span className="label-text-alt text-success">{availableSpots} spots remaining</span>
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Special Requests</span>
              </label>
              <textarea
                name="specialRequests"
                className="textarea textarea-bordered h-24"
                value={formData.specialRequests}
                onChange={handleInputChange}
                placeholder="Any dietary restrictions or special requirements?"
                disabled={registering}
              />
            </div>

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Payment Status</span>
                <input
                  type="checkbox"
                  name="isPaid"
                  className="toggle toggle-primary"
                  checked={formData.isPaid}
                  onChange={(e) => handleInputChange({
                    target: {
                      name: 'isPaid',
                      value: e.target.checked
                    }
                  })}
                  disabled={registering}
                />
              </label>
              <label className="label">
                <span className="label-text-alt">Toggle if you have completed the payment</span>
              </label>
            </div>

            {formData.isPaid && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Payment Proof</span>
                </label>
                <input
                  type="file"
                  name="paymentProof"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input file-input-bordered w-full"
                  required
                  disabled={registering}
                />
                {formData.paymentProofPreview && (
                  <div className="mt-2">
                    <img
                      src={formData.paymentProofPreview}
                      alt="Payment proof preview"
                      className="max-w-xs rounded-lg shadow-lg"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="modal-action">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={registering}
              >
                {registering ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Registering...
                  </>
                ) : (
                  'Register'
                )}
              </button>
              <button 
                type="button" 
                className="btn"
                onClick={() => {
                  document.getElementById('registration_modal').close();
                  onClose();
                }}
                disabled={registering}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
};

export default RegistrationForm;

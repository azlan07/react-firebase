import React, { useEffect } from 'react';

const UpdateBlogForm = ({ 
  title, 
  content, 
  imagePreview, 
  isUploading,
  onTitleChange, 
  onContentChange, 
  onImageChange, 
  onUpdate,
  onClose
}) => {
  // Open modal when component mounts
  useEffect(() => {
    document.getElementById('update_blog_modal').showModal();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onUpdate();
    // Only close if not uploading
    if (!isUploading) {
      document.getElementById('update_blog_modal').close();
      onClose();
    }
  };

  return (
    <dialog id="update_blog_modal" className="modal">
      <div className="modal-box w-11/12 max-w-3xl">
        <h3 className="font-bold text-lg mb-4">Edit Blog Post</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Title</span>
            </label>
            <input
              type="text"
              placeholder="Enter post title"
              className="input input-bordered w-full"
              value={title}
              onChange={onTitleChange}
              required
              disabled={isUploading}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Content</span>
            </label>
            <textarea
              placeholder="Enter post content"
              className="textarea textarea-bordered h-32"
              value={content}
              onChange={onContentChange}
              required
              disabled={isUploading}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Image</span>
            </label>
            <div className="flex gap-4 items-start">
              <input
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="file-input file-input-bordered w-full"
                disabled={isUploading}
              />
              {imagePreview && (
                <div className="flex-shrink-0">
                  <div className="avatar">
                    <div className="w-24 h-24 rounded-lg">
                      <img 
                        src={imagePreview} 
                        alt="Current Image" 
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="modal-action">
            <button 
              type="submit"
              className="btn btn-primary"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <span className="loading loading-spinner loading-md mr-2"></span>
                  Updating...
                </>
              ) : (
                'Update Post'
              )}
            </button>
            <button 
              type="button" 
              className="btn"
              onClick={() => {
                if (!isUploading) {
                  document.getElementById('update_blog_modal').close();
                  onClose();
                }
              }}
              disabled={isUploading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default UpdateBlogForm; 
import React from 'react';

const CreateBlogForm = ({ 
  title, 
  content, 
  imagePreview, 
  isUploading,
  onTitleChange, 
  onContentChange, 
  onImageChange, 
  onSubmit,
  onClose
}) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(e);
    // Only close if not uploading
    if (!isUploading) {
      document.getElementById('create_blog_modal').close();
      onClose();
    }
  };

  return (
    <>
      <button 
        className="btn btn-primary mb-8"
        onClick={() => document.getElementById('create_blog_modal').showModal()}
        disabled={isUploading}
      >
        Create New Blog Post
      </button>

      <dialog id="create_blog_modal" className="modal">
        <div className="modal-box w-11/12 max-w-3xl">
          <h3 className="font-bold text-lg mb-4">Create New Blog Post</h3>
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
              <input
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="file-input file-input-bordered w-full"
                disabled={isUploading}
              />
            </div>
            {imagePreview && (
              <div className="mt-2">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-w-xs rounded-lg shadow-lg"
                />
              </div>
            )}
            <div className="modal-action">
              <button 
                type="submit"
                className="btn btn-primary"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <span className="loading loading-spinner loading-md mr-2"></span>
                    Adding...
                  </>
                ) : (
                  'Add Post'
                )}
              </button>
              <button 
                type="button" 
                className="btn"
                onClick={() => {
                  if (!isUploading) {
                    document.getElementById('create_blog_modal').close();
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
    </>
  );
};

export default CreateBlogForm; 
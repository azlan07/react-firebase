import React, { useEffect } from 'react';

const BlogForm = ({ 
  title, 
  content, 
  imagePreview, 
  isUploading, 
  editingId,
  onTitleChange, 
  onContentChange, 
  onImageChange, 
  onSubmit, 
  onUpdate 
}) => {
  // Open modal when editingId is present
  useEffect(() => {
    if (editingId) {
      document.getElementById('blog_modal').showModal();
    }
  }, [editingId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      onUpdate();
    } else {
      onSubmit(e);
    }
    // Close the modal after submission
    document.getElementById('blog_modal').close();
  };

  return (
    <>
      <button 
        className="btn btn-primary mb-8"
        onClick={() => document.getElementById('blog_modal').showModal()}
      >
        Create New Blog Post
      </button>

      <dialog id="blog_modal" className="modal">
        <div className="modal-box w-11/12 max-w-3xl">
          <h3 className="font-bold text-lg mb-4">
            {editingId ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h3>
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
                />
                {editingId && imagePreview && (
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
            {!editingId && imagePreview && (
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
                {isUploading ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update Post' : 'Add Post')}
              </button>
              <button 
                type="button" 
                className="btn"
                onClick={() => document.getElementById('blog_modal').close()}
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

export default BlogForm; 
import React, { useState, useEffect } from 'react';
import { ref, onValue, push, remove, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { database, storage } from '../../firebase';
import BlogTable from './BlogTable';
import CreateBlogForm from './CreateBlogForm';
import UpdateBlogForm from './UpdateBlogForm';
import Toast from '../common/Toast';
import ConfirmModal from '../common/ConfirmModal';

const BlogManagement = () => {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, post: null });

  // Fetch all blog posts
  useEffect(() => {
    const postsRef = ref(database, 'blogPosts');
    
    const unsubscribe = onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postsArray = Object.entries(data).map(([id, post]) => ({
          id,
          ...post
        }));
        setPosts(postsArray);
      } else {
        setPosts([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to Firebase Storage
  const uploadImage = async (file) => {
    if (!file) return null;
    
    const timestamp = Date.now();
    const imageRef = storageRef(storage, `blog-images/${timestamp}-${file.name}`);
    
    try {
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  // Reset form state
  const resetForm = () => {
    setTitle('');
    setContent('');
    setImage(null);
    setImagePreview(null);
    setEditingId(null);
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // Add new blog post
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImage(image);
      }

      const postsRef = ref(database, 'blogPosts');
      await push(postsRef, {
        title,
        content,
        imageUrl,
        createdAt: new Date().toISOString()
      });

      resetForm();
      showToast('Blog post created successfully!');
    } catch (error) {
      console.error('Error adding post:', error);
      showToast('Failed to create blog post', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Delete blog post
  const handleDelete = async (post) => {
    setDeleteConfirm({ show: true, post });
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      const post = deleteConfirm.post;
      // Delete image from storage if exists
      if (post.imageUrl) {
        const imageRef = storageRef(storage, post.imageUrl);
        await deleteObject(imageRef);
      }

      // Delete post from database
      const postRef = ref(database, `blogPosts/${post.id}`);
      await remove(postRef);
      showToast('Blog post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      showToast('Failed to delete blog post', 'error');
    } finally {
      setDeleteConfirm({ show: false, post: null });
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirm({ show: false, post: null });
  };

  // Update blog post
  const handleUpdate = async (id) => {
    setIsUploading(true);
    try {
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImage(image);
      }

      const postRef = ref(database, `blogPosts/${id}`);
      await update(postRef, {
        title,
        content,
        imageUrl: imageUrl || posts.find(p => p.id === id)?.imageUrl,
        updatedAt: new Date().toISOString()
      });

      resetForm();
      showToast('Blog post updated successfully!');
    } catch (error) {
      console.error('Error updating post:', error);
      showToast('Failed to update blog post', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Set post for editing
  const handleEdit = (post) => {
    setTitle(post.title);
    setContent(post.content);
    setImagePreview(post.imageUrl);
    setEditingId(post.id);
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Blog Management</h2>
          
          <CreateBlogForm
            title={title}
            content={content}
            imagePreview={imagePreview}
            isUploading={isUploading}
            onTitleChange={(e) => setTitle(e.target.value)}
            onContentChange={(e) => setContent(e.target.value)}
            onImageChange={handleImageChange}
            onSubmit={handleSubmit}
            onClose={resetForm}
          />

          {editingId && (
            <UpdateBlogForm
              title={title}
              content={content}
              imagePreview={imagePreview}
              isUploading={isUploading}
              onTitleChange={(e) => setTitle(e.target.value)}
              onContentChange={(e) => setContent(e.target.value)}
              onImageChange={handleImageChange}
              onUpdate={() => handleUpdate(editingId)}
              onClose={resetForm}
            />
          )}

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <BlogTable
                posts={posts}
                onEdit={handleEdit}
                onDelete={handleDelete}
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

      <ConfirmModal
        isOpen={deleteConfirm.show}
        title="Delete Blog Post"
        message={`Are you sure you want to delete "${deleteConfirm.post?.title}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default BlogManagement; 
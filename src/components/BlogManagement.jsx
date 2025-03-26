import React, { useState, useEffect } from 'react';
import { ref, onValue, push, remove, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { database, storage } from '../firebase';

const BlogManagement = () => {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

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

      setTitle('');
      setContent('');
      setImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error adding post:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Delete blog post
  const handleDelete = async (post) => {
    try {
      // Delete image from storage if exists
      if (post.imageUrl) {
        const imageRef = storageRef(storage, post.imageUrl);
        await deleteObject(imageRef);
      }

      // Delete post from database
      const postRef = ref(database, `blogPosts/${post.id}`);
      await remove(postRef);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
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

      setTitle('');
      setContent('');
      setImage(null);
      setImagePreview(null);
      setEditingId(null);
    } catch (error) {
      console.error('Error updating post:', error);
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
          
          <div className="card bg-base-100 shadow-xl mb-8">
            <div className="card-body">
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
                    onChange={(e) => setTitle(e.target.value)}
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
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Image</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input file-input-bordered w-full"
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
                {editingId ? (
                  <button 
                    type="button" 
                    onClick={() => handleUpdate(editingId)}
                    className="btn btn-primary w-full"
                    disabled={isUploading}
                  >
                    {isUploading ? 'Updating...' : 'Update Post'}
                  </button>
                ) : (
                  <button 
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={isUploading}
                  >
                    {isUploading ? 'Adding...' : 'Add Post'}
                  </button>
                )}
              </form>
            </div>
          </div>

          <div className="grid gap-6">
            {posts.map((post) => (
              <div key={post.id} className="card bg-base-100 shadow-xl">
                {post.imageUrl && (
                  <figure>
                    <img 
                      src={post.imageUrl} 
                      alt={post.title}
                      className="w-full h-64 object-cover"
                    />
                  </figure>
                )}
                <div className="card-body">
                  <h3 className="card-title text-2xl">{post.title}</h3>
                  <p className="whitespace-pre-wrap">{post.content}</p>
                  <div className="card-actions justify-end mt-4">
                    <button 
                      onClick={() => handleEdit(post)}
                      className="btn btn-info btn-sm"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(post)}
                      className="btn btn-error btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogManagement; 
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const postRef = ref(database, `blogPosts/${id}`);
    
    const unsubscribe = onValue(postRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPost({ id, ...data });
      } else {
        setPost(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Post not found</h2>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold">{post.title}</h2>
                <button 
                  className="btn"
                  onClick={() => navigate('/')}
                >
                  Back to Home
                </button>
              </div>
              
              {post.imageUrl && (
                <figure className="mb-6">
                  <img 
                    src={post.imageUrl} 
                    alt={post.title}
                    className="w-full h-[400px] object-cover rounded-lg"
                  />
                </figure>
              )}

              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{post.content}</p>
              </div>

              <div className="divider"></div>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <div>
                  Created: {new Date(post.createdAt).toLocaleDateString()}
                  {post.updatedAt && (
                    <span className="ml-2">
                      (Updated: {new Date(post.updatedAt).toLocaleDateString()})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail; 
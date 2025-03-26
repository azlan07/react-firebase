import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';

const Home = () => {
  const [posts, setPosts] = useState([]);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Blog App</h1>
        <p className="text-lg text-gray-600">Discover amazing stories and insights</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <div key={post.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
            {post.imageUrl && (
              <figure>
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              </figure>
            )}
            <div className="card-body">
              <h3 className="card-title text-2xl">{post.title}</h3>
              <p className="whitespace-pre-wrap line-clamp-3">{post.content}</p>
              <div className="card-actions justify-end mt-4">
                <div className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home; 
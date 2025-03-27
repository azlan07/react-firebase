import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 8; // 4 cards per row, 2 rows = 8 posts

  // Events state
  const [events, setEvents] = useState([]);
  const [currentEventPage, setCurrentEventPage] = useState(1);
  const eventsPerPage = 4;

  useEffect(() => {
    const postsRef = ref(database, 'blogPosts');
    
    const unsubscribe = onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postsArray = Object.entries(data)
          .map(([id, post]) => ({
            id,
            ...post
          }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(postsArray);
      } else {
        setPosts([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch events
  useEffect(() => {
    const eventsRef = ref(database, 'events');
    
    return onValue(eventsRef, (snapshot) => {
      setLoading(true);
      try {
        const data = snapshot.val();
        if (data) {
          // Convert to array and sort by date (newest first)
          const eventsArray = Object.entries(data)
            .map(([id, event]) => ({ id, ...event }))
            .sort((a, b) => new Date(b.date) - new Date(a.date));

          setEvents(eventsArray);
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error('Error loading events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  // Calculate pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  // Events pagination
  const indexOfLastEvent = currentEventPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalEventPages = Math.ceil(events.length / eventsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEventPageChange = (pageNumber) => {
    setCurrentEventPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="container mx-auto px-4">
        {/* Latest Events Section */}
        <div className="max-w-7xl mx-auto mb-16">
          <h1 className="text-4xl font-bold text-center mb-8">Upcoming Bukber Events</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentEvents.map((event) => {
              const eventDate = new Date(event.date);
              const isPastEvent = eventDate < new Date();
              const isEventFull = event.currentParticipants >= event.maxParticipants;

              return (
                <div key={event.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                  <div className="card-body">
                    <h2 className="card-title text-xl line-clamp-2">{event.title}</h2>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <FaCalendarAlt className="text-primary" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FaClock className="text-primary" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FaMapMarkerAlt className="text-primary" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FaUsers className="text-primary" />
                        <span>{event.currentParticipants || 0}/{event.maxParticipants}</span>
                      </div>
                    </div>
                    <div className="card-actions justify-between items-center mt-4">
                      <div className="text-xs">
                        {isPastEvent ? (
                          <span className="text-warning">Event Ended</span>
                        ) : isEventFull ? (
                          <span className="text-error">Event Full</span>
                        ) : (
                          <span className="text-success">
                            {event.maxParticipants - (event.currentParticipants || 0)} spots left
                          </span>
                        )}
                      </div>
                      <div className="card-actions justify-end">
                        <Link 
                          to={`/events/${event.id}/register`}
                          className="btn btn-primary"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Events Pagination */}
          {totalEventPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="join">
                <button 
                  className="join-item btn"
                  onClick={() => handleEventPageChange(currentEventPage - 1)}
                  disabled={currentEventPage === 1}
                >
                  Previous
                </button>
                {[...Array(totalEventPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    className={`join-item btn ${currentEventPage === index + 1 ? 'btn-active' : ''}`}
                    onClick={() => handleEventPageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
                <button 
                  className="join-item btn"
                  onClick={() => handleEventPageChange(currentEventPage + 1)}
                  disabled={currentEventPage === totalEventPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Latest Blog Posts Section */}
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Latest Blog Posts</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentPosts.map((post) => (
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
                  <h2 className="card-title text-xl line-clamp-2">{post.title}</h2>
                  <p className="line-clamp-3 text-sm">{post.content}</p>
                  <div className="card-actions justify-between items-center mt-4">
                    <div className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                    <Link 
                      to={`/blog/${post.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Blog Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="join">
                <button 
                  className="join-item btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    className={`join-item btn ${currentPage === index + 1 ? 'btn-active' : ''}`}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
                <button 
                  className="join-item btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
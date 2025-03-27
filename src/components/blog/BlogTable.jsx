import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSearch, 
  FaEye, 
  FaEdit, 
  FaTrash,
  FaCalendarAlt,
  FaClock
} from 'react-icons/fa';

const BlogTable = ({ posts, onEdit, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const postsPerPage = 5;

  // Sort posts by date (newest first) and filter by search term
  const filteredPosts = posts
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Calculate pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // Handle page change
  const handlePageChange = async (pageNumber) => {
    setIsLoading(true);
    setCurrentPage(pageNumber);
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsLoading(false);
  };

  // Handle search
  const handleSearch = async (e) => {
    setIsLoading(true);
    setSearchTerm(e.target.value);
    setCurrentPage(1);
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 w-full md:w-96">
              <div className="form-control flex-1">
                <input
                  type="text"
                  placeholder="Search by title or content..."
                  className="input input-bordered w-full"
                  value={searchTerm}
                  onChange={handleSearch}
                  disabled={isLoading}
                />
              </div>
              <button className="btn btn-square" disabled={isLoading}>
                <FaSearch className="h-5 w-5" />
              </button>
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <FaSearch className="h-4 w-4" />
              <span>Showing {filteredPosts.length} posts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-0">
          <div className="overflow-x-auto relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-base-100 bg-opacity-50">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            )}
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th className="w-1/4">Title</th>
                  <th className="w-1/3">Content</th>
                  <th className="w-1/6">Created At</th>
                  <th className="w-1/4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPosts.map((post) => (
                  <tr key={post.id} className="hover">
                    <td>
                      <div className="flex items-center gap-3">
                        {post.imageUrl && (
                          <div className="avatar">
                            <div className="w-12 h-12 rounded-lg">
                              <img src={post.imageUrl} alt={post.title} className="object-cover" />
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{post.title}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            {post.updatedAt && (
                              <>
                                <FaClock className="h-3 w-3" />
                                <span>Updated: {new Date(post.updatedAt).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="line-clamp-2 text-sm">{post.content}</div>
                    </td>
                    <td>
                      <div className="text-sm flex items-center gap-2">
                        <FaCalendarAlt className="h-3 w-3" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <Link 
                          to={`/blog/${post.id}`}
                          className="btn btn-info btn-sm"
                          title="View Details"
                        >
                          <FaEye className="h-4 w-4" />
                        </Link>
                        <button 
                          className="btn btn-warning btn-sm"
                          onClick={() => onEdit(post)}
                          title="Edit Post"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button 
                          className="btn btn-error btn-sm"
                          onClick={() => onDelete(post)}
                          title="Delete Post"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="join">
            <button 
              className="join-item btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                className={`join-item btn ${currentPage === index + 1 ? 'btn-active' : ''}`}
                onClick={() => handlePageChange(index + 1)}
                disabled={isLoading}
              >
                {index + 1}
              </button>
            ))}
            <button 
              className="join-item btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* No Results Message */}
      {filteredPosts.length === 0 && !isLoading && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body text-center py-8">
            <p className="text-gray-500">No posts found matching your search.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogTable; 
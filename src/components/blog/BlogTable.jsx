import React from 'react';

const BlogTable = ({ posts, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Content</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id}>
              <td>
                {post.imageUrl && (
                  <div className="avatar">
                    <div className="w-16 h-16 rounded">
                      <img src={post.imageUrl} alt={post.title} />
                    </div>
                  </div>
                )}
              </td>
              <td className="font-medium">{post.title}</td>
              <td className="max-w-xs truncate">{post.content}</td>
              <td>{new Date(post.createdAt).toLocaleDateString()}</td>
              <td>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onEdit(post)}
                    className="btn btn-info btn-sm"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => onDelete(post)}
                    className="btn btn-error btn-sm"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BlogTable; 
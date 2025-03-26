import React from 'react';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About Us</h1>
          <p className="text-lg text-gray-600">Learn more about our blog platform</p>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Our Mission</h2>
            <p className="mb-6">
              We aim to provide a platform where writers can share their thoughts, ideas, and stories with the world. 
              Our blog management system makes it easy to create, edit, and manage content while providing readers 
              with a clean and engaging reading experience.
            </p>

            <h2 className="text-2xl font-bold mb-4">Features</h2>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li>Easy-to-use blog management system</li>
              <li>Real-time updates and content synchronization</li>
              <li>Responsive design for all devices</li>
              <li>Clean and modern user interface</li>
              <li>Secure data storage with Firebase</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">Technology Stack</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="card bg-base-200">
                <div className="card-body">
                  <h3 className="card-title">Frontend</h3>
                  <ul className="list-disc list-inside">
                    <li>React</li>
                    <li>Tailwind CSS</li>
                    <li>DaisyUI</li>
                  </ul>
                </div>
              </div>
              <div className="card bg-base-200">
                <div className="card-body">
                  <h3 className="card-title">Backend</h3>
                  <ul className="list-disc list-inside">
                    <li>Firebase</li>
                    <li>Realtime Database</li>
                  </ul>
                </div>
              </div>
              <div className="card bg-base-200">
                <div className="card-body">
                  <h3 className="card-title">Features</h3>
                  <ul className="list-disc list-inside">
                    <li>CRUD Operations</li>
                    <li>Real-time Updates</li>
                    <li>Responsive Design</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 
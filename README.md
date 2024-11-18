# Lego Collection Web Application

This web application is a platform for Lego enthusiasts to explore and manage their Lego set collections. It utilizes a combination of MongoDB and PostgreSQL to manage user data and Lego set information, respectively, ensuring a robust and scalable data management system.

## Skills Developed

### Technical Skills

- **Full-Stack Development**: Gained experience in handling both front-end and back-end aspects of web development.
- **Database Management**: Learned to integrate and manage complex databases using MongoDB for user data and PostgreSQL for Lego set data.
- **Authentication and Security**: Implemented user authentication and security features using bcrypt.js and client-sessions.
- **Web Frameworks**: Enhanced skills in using Node.js and Express.js for server-side development and EJS for templating.

### Soft Skills

- **Problem-Solving**: Tackled challenges in integrating multiple technologies and ensuring smooth data flow.
- **Project Management**: Gained experience in managing a full-scale project from conception to deployment.
- **Attention to Detail**: Ensured a consistent and error-free user experience across different pages and functionalities.

## Experience Gained

- **Database Integration**: Learned to connect and use multiple databases (MongoDB and PostgreSQL) in a single application, understanding the strengths and use-cases for each.
- **User Authentication**: Developed a secure user authentication system, gaining insights into security best practices.
- **Responsive Web Design**: Enhanced my skills in creating a responsive and user-friendly interface using Tailwind CSS.
- **Debugging and Testing**: Acquired experience in troubleshooting and testing web applications to ensure reliability and performance.
- **Version Control and Documentation**: Improved proficiency in using Git for version control and creating comprehensive documentation to guide future users and contributors.

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: EJS (Embedded JavaScript templates)
- **Database**: MongoDB (for user data), PostgreSQL (for Lego sets data)
- **Authentication**: bcrypt.js (for password hashing), client-sessions (for session management)
- **Other Libraries**: Mongoose (MongoDB object modeling), Sequelize (PostgreSQL ORM), dotenv (environment variables management)

## File Structure

- `data/` - Contains JSON data for the application
- `modules/` - Contains JavaScript modules for authentication and Lego sets
- `public/` - Contains static files for the application
- `server.js` - The main server file
- `tailwind.config.js` - Configuration file for Tailwind CSS

## Installation and Setup

1. **Clone the Repository**: Clone the project to your local machine.
2. **Install Dependencies**: Run `npm install` to install the required Node.js packages.
3. **Set Environment Variables**: Configure environment variables for database connections and other sensitive data.
4. **Database Setup**: Set up MongoDB and PostgreSQL databases as per the schemas defined in the project.
5. **Start the Server**: Run `node server.js` to start the application.

## Usage

Once the application is running, navigate to `http://localhost:8080` (or the configured port) in your web browser. You can create an account, log in, and start exploring and managing your Lego set collections.

## Contributing

If you have improvements or bug fixes, feel free to fork the repository and submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
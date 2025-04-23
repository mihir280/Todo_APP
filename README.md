# DevOps Todo App

A modern, interactive Todo application with a CI/CD pipeline and Docker support.

## Features

- ✅ **Modern UI with CSS Animations**: Smooth transitions and responsive design
- 🌓 **Dark/Light Mode Toggle**: Automatically respects system preferences
- 🎯 **Priority Levels**: Assign Low, Medium, or High priority to tasks
- 📅 **Due Dates**: Set and track deadlines for your todos
- ✓ **Task Completion**: Mark tasks as completed with visual feedback
- 🔍 **Filtering Options**: Filter tasks by status, priority, or due date
- 📊 **Progress Tracking**: Visual progress bar showing completion status
- 📱 **Fully Responsive**: Works on mobile, tablet, and desktop
- 🔄 **Offline Support**: Continue using the app when offline, with auto-sync when back online
- ⌨️ **Keyboard Accessibility**: Manage tasks using keyboard shortcuts

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Templating**: EJS
- **Container**: Docker
- **CI/CD**: Jenkins/Azure Pipelines

## Getting Started

### Prerequisites

- Node.js 14+ or Docker

### Installation

#### Using Node.js

```bash
# Clone the repository
git clone <repository-url>
cd devops-todo-app

# Install dependencies
npm install

# Start the server
npm start
```

#### Using Docker

```bash
# Build the Docker image
docker build -t devops-todo-app .

# Run the container
docker run -p 8000:8000 devops-todo-app
```

### Accessing the App

Open your browser and navigate to `http://localhost:8000`

## Development

### Project Structure

```
.
├── app.js                # Main application file
├── views/                # EJS templates
│   ├── todo.ejs          # Main todo list view
│   └── edititem.ejs      # Edit item view
├── public/               # Static files
│   ├── css/              # CSS styles
│   └── js/               # JavaScript files
├── Dockerfile            # Docker configuration
└── package.json          # Node.js dependencies
```

## Deployment

The application includes Docker support for easy deployment. The included CI/CD pipeline automates testing and deployment.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Original Todo application by riaan@entersekt.com
- Enhanced with modern UI and additional features 
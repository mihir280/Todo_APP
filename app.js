const express = require('express'),
    bodyParser = require('body-parser'),
    // In order to use PUT HTTP verb to edit item
    methodOverride = require('method-override'),
    // Mitigate XSS using sanitizer
    sanitizer = require('sanitizer'),
    app = express(),
    port = 8000

// Enable JSON body parsing for API endpoints
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// Serve static files from public directory
app.use(express.static('public'));

// https: //github.com/expressjs/method-override#custom-logic
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        let method = req.body._method;
        delete req.body._method;
        return method
    }
}));

// Enhanced todo item model with additional fields
let todolist = [];

/* The to do list and the form are displayed */
app.get('/todo', function (req, res) {
        res.render('todo.ejs', {
            todolist
        });
    })

    /* API endpoint to get todos as JSON */
    .get('/api/todos', function (req, res) {
        res.json(todolist);
    })

    /* Adding an item to the to do list */
    .post('/todo/add/', function (req, res) {
        // Escapes HTML special characters in attribute values as HTML entities
        let newTodo = sanitizer.escape(req.body.newtodo);
        let priority = req.body.priority || 'medium';
        let dueDate = req.body.dueDate || null;
        
        if (req.body.newtodo != '') {
            todolist.push({
                text: newTodo,
                priority: priority, 
                dueDate: dueDate,
                completed: false,
                id: Date.now().toString() // Simple unique ID
            });
        }
        res.redirect('/todo');
    })

    /* API endpoint for adding todos via JSON */
    .post('/api/todos', function (req, res) {
        const { text, priority, dueDate } = req.body;
        
        if (text && text.trim() !== '') {
            const newTodo = {
                text: sanitizer.escape(text),
                priority: priority || 'medium',
                dueDate: dueDate || null,
                completed: false,
                id: Date.now().toString()
            };
            
            todolist.push(newTodo);
            res.status(201).json(newTodo);
        } else {
            res.status(400).json({ error: 'Todo text is required' });
        }
    })

    /* Deletes an item from the to do list */
    .get('/todo/delete/:id', function (req, res) {
        if (req.params.id != '') {
            todolist.splice(req.params.id, 1);
        }
        res.redirect('/todo');
    })

    /* API endpoint for deleting todo */
    .delete('/api/todos/:id', function (req, res) {
        const todoId = req.params.id;
        const todoIndex = todolist.findIndex(item => item.id === todoId);
        
        if (todoIndex !== -1) {
            todolist.splice(todoIndex, 1);
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Todo not found' });
        }
    })

    // Get a single todo item and render edit page
    .get('/todo/:id', function (req, res) {
        let todoIdx = req.params.id;
        let todo = todolist[todoIdx];

        if (todo) {
            res.render('edititem.ejs', {
                todoIdx,
                todo
            });
        } else {
            res.redirect('/todo');
        }
    })

    // Edit item in the todo list 
    .put('/todo/edit/:id', function (req, res) {
        let todoIdx = req.params.id;
        // Escapes HTML special characters in attribute values as HTML entities
        let editTodo = sanitizer.escape(req.body.editTodo);
        if (todoIdx != '' && editTodo != '') {
            if (typeof todolist[todoIdx] === 'object') {
                todolist[todoIdx].text = editTodo;
            } else {
                todolist[todoIdx] = {
                    text: editTodo,
                    priority: 'medium',
                    dueDate: null,
                    completed: false,
                    id: Date.now().toString()
                };
            }
        }
        res.redirect('/todo');
    })

    /* API endpoint to update todo */
    .put('/api/todos/:id', function (req, res) {
        const todoId = req.params.id;
        const { text, priority, dueDate, completed } = req.body;
        const todoIndex = todolist.findIndex(item => item.id === todoId);
        
        if (todoIndex !== -1) {
            const updatedTodo = { ...todolist[todoIndex] };
            
            if (text !== undefined) {
                updatedTodo.text = sanitizer.escape(text);
            }
            
            if (priority !== undefined) {
                updatedTodo.priority = priority;
            }
            
            if (dueDate !== undefined) {
                updatedTodo.dueDate = dueDate;
            }
            
            if (completed !== undefined) {
                updatedTodo.completed = completed;
            }
            
            todolist[todoIndex] = updatedTodo;
            res.json(updatedTodo);
        } else {
            res.status(404).json({ error: 'Todo not found' });
        }
    })

    // Toggle todo item completion status
    .put('/todo/complete/:id', function (req, res) {
        const todoIdx = req.params.id;
        
        if (todoIdx !== '' && todolist[todoIdx]) {
            if (typeof todolist[todoIdx] === 'object') {
                todolist[todoIdx].completed = !todolist[todoIdx].completed;
                res.json({ success: true, completed: todolist[todoIdx].completed });
            } else {
                // Convert string todo to object if needed
                const text = todolist[todoIdx];
                todolist[todoIdx] = {
                    text,
                    priority: 'medium',
                    dueDate: null,
                    completed: true,
                    id: Date.now().toString()
                };
                res.json({ success: true, completed: true });
            }
        } else {
            res.status(404).json({ error: 'Todo not found' });
        }
    })

    // Update todo item priority
    .put('/todo/priority/:id', function (req, res) {
        const todoIdx = req.params.id;
        const priority = req.body.priority || 'medium';
        
        if (todoIdx !== '' && todolist[todoIdx]) {
            if (typeof todolist[todoIdx] === 'object') {
                todolist[todoIdx].priority = priority;
                res.json({ success: true, priority });
            } else {
                // Convert string todo to object if needed
                const text = todolist[todoIdx];
                todolist[todoIdx] = {
                    text,
                    priority,
                    dueDate: null,
                    completed: false,
                    id: Date.now().toString()
                };
                res.json({ success: true, priority });
            }
        } else {
            res.status(404).json({ error: 'Todo not found' });
        }
    })

    // Update todo due date
    .put('/todo/duedate/:id', function (req, res) {
        const todoIdx = req.params.id;
        const dueDate = req.body.dueDate || null;
        
        if (todoIdx !== '' && todolist[todoIdx]) {
            if (typeof todolist[todoIdx] === 'object') {
                todolist[todoIdx].dueDate = dueDate;
                res.json({ success: true, dueDate });
            } else {
                // Convert string todo to object if needed
                const text = todolist[todoIdx];
                todolist[todoIdx] = {
                    text,
                    priority: 'medium',
                    dueDate,
                    completed: false,
                    id: Date.now().toString()
                };
                res.json({ success: true, dueDate });
            }
        } else {
            res.status(404).json({ error: 'Todo not found' });
        }
    })

    /* Redirects to the to do list if the page requested is not found */
    .use(function (req, res, next) {
        res.redirect('/todo');
    })

    .listen(port, function () {
        // Logging to console
        console.log(`Todolist running on http://0.0.0.0:${port}`)
    });
// Export app
module.exports = app;

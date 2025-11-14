from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# In-memory storage (replace with database in production)
TODO_FILE = 'todos.json'

def load_todos():
    if os.path.exists(TODO_FILE):
        with open(TODO_FILE, 'r') as f:
            return json.load(f)
    return []

def save_todos(todos):
    with open(TODO_FILE, 'w') as f:
        json.dump(todos, f)

@app.route('/api/todos', methods=['GET'])
def get_todos():
    todos = load_todos()
    return jsonify(todos)

@app.route('/api/todos', methods=['POST'])
def add_todo():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'Todo text is required'}), 400
    
    todos = load_todos()
    new_todo = {
        'id': len(todos) + 1,
        'text': data['text'],
        'completed': False
    }
    todos.append(new_todo)
    save_todos(todos)
    
    return jsonify(new_todo), 201

@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    data = request.get_json()
    todos = load_todos()
    
    for todo in todos:
        if todo['id'] == todo_id:
            if 'text' in data:
                todo['text'] = data['text']
            if 'completed' in data:
                todo['completed'] = data['completed']
            save_todos(todos)
            return jsonify(todo)
    
    return jsonify({'error': 'Todo not found'}), 404

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    todos = load_todos()
    todo_to_delete = None
    
    for todo in todos:
        if todo['id'] == todo_id:
            todo_to_delete = todo
            break
    
    if todo_to_delete:
        todos.remove(todo_to_delete)
        save_todos(todos)
        return jsonify({'message': 'Todo deleted successfully'})
    
    return jsonify({'error': 'Todo not found'}), 404

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'todo-backend'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)  # Changed to port 8000
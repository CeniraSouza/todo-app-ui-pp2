const { log, clear, dir } = console;

//Creates random id
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// console.log(uuidv4());

/*************************************************************
 * PROGRAMMING - THE CLASS THAT CREATES THE DATA RECORDS
 **************************************************************/

class Todo {
  // Schema: id, title, description, duration, done?
  constructor(data) {
    const { id, title, description, duration, done = false } = data;
    // log(arguments);

    // Title checks
    if (!title) {
      throw new Error(`No title provided: Received ${title}`);
    }
    if (typeof title !== 'string') {
      throw new Error(
        `Title must be a string. Received ${title}(${typeof title})`,
      );
    }
    this.title = title;

    // Description checks
    if (!description) {
      throw new Error(`No description provided: Received ${description}`);
    }
    if (typeof description !== 'string') {
      throw new Error(
        `Title must be a string. Received ${description}(${typeof description})`,
      );
    }
    this.description = description;

    // Duration checks
    if (!duration) {
      throw new Error(`No duration provided: Received ${description}`);
    }
    if (typeof duration !== 'string') {
      throw new Error(
        `Duration must be a string. Received ${duration}(${typeof duration})`,
      );
    }
    this.duration = duration;

    // Handling ID (For update scenarios)
    if (id) {
      if (!(typeof id === 'string' || typeof id === 'number')) {
        throw new Error(`Id must be a string. Received ${id}(${typeof id})`);
      }
    }

    this._id = id ? String(id) : uuidv4();

    // Done (defaulted to false above)
    if (typeof done !== 'boolean') {
      throw new Error(
        `'Done' must be a boolean. Received ${done}(${typeof done})`,
      );
    }
    this.done = done; // this needs a check above it. See annotated app
  }
}

/*************************************************************
 * PROGRAMMING - THE CLASS THAT CREATES APPS THAT CAN CONTROL SETS OF THOSE RECORDS
 **************************************************************/

class TodosApp {
  #todos = []; // Now a private field, so you can't tamper with it from outside this class
  constructor(todosDataArray = []) {
    if (!Array.isArray(todosDataArray)) {
      throw new Error(`Todos must be an array. Received ${todos}`);
    }

    for (const todoData of todosDataArray) {
      this.#todos.push(new Todo(todoData));
    }
  }

  // GET a todo record's index (by id)
  getTodoIndex(id) {
    if (!id) {
      throw new Error(`An id must be provided to getTodoIndex`);
    }
    if (typeof id !== 'string') {
      throw new Error(
        `The id provided to getTodoIndex must be a string. Received ${id}(${typeof id})`,
      );
    }
    const index = this.#todos.findIndex((todo) => {
      return todo._id === id;
    });

    if (!~index) {
      log(`Todo with _id of ${id} not found`);
    }
    return index;
  }

  // GET a todo record
  getTodo(id) {
    const index = this.getTodoIndex(id);
    if (!~index) {
      return null;
    }
    const targetTodo = this.#todos[index];
    return { ...targetTodo }; // return a copy, so it can't be affected outside
  }

  // GET ALL todos
  getAllTodos() {
    return this.#todos.slice(); // return a copy, so it can't be affected outside
  }

  // CREATE a todo
  addTodo(todoData) {
    // Check if data provided
    if (!todoData) {
      throw new Error(`No data provided to addTodo: received ${todoData}`);
    }

    // Create a new todo
    const newTodo = new Todo(todoData);

    // push it into our internal array
    this.#todos.push(newTodo);

    // Return the finished product for reference
    return { ...newTodo };
  }

  // UPDATE a todo
  updateTodo(updates = {}) {
    // Check id is correct
    const { _id: id } = updates;
    if (!id) {
      throw new Error(
        'An id of the todo you want to change must be provided to updateTodo',
      );
    }
    if (typeof id !== 'string') {
      throw new Error(`id must be a string. Received ${id}(${typeof id})`);
    }

    // Get old todo
    const targetTodoIndex = this.getTodoIndex(id);
    const targetTodo = this.#todos[targetTodoIndex];

    // Notify if not found (This should not happen, hence the error rather than just returning...)
    if (!targetTodo) {
      throw new Error(`Todo not found`);
    }

    // Create a new Todo to validate
    const updatedTodo = new Todo(updates);

    // Remove the old and insert the new
    this.#todos.splice(targetTodoIndex, 1, updatedTodo);
    return { ...updatedTodo }; // before returning the new todo
  }

  // DELETE todo
  removeTodo(id) {
    if (!id) {
      throw new Error(`No id provided to removeTodo: received ${id}`);
    }
    const index = this.getTodoIndex(id);
    if (!~index) {
      return null; // throw err
    }
    return this.#todos.splice(index, 1);
  }
}

// Data
const rawData = [
  {
    title: 'Make Audit App',
    description: 'Make a lucid chart and integrate with Google chart',
    duration: '5hr',
    done: false,
    // _id: uuidv4(),
  },
  {
    title: 'Prepare work submission',
    description: 'Prepare report based on instructions, use screenshots',
    duration: '4hr',
    done: true,
  },
  {
    title: 'Organise social distancing meeting with neighbours',
    description: 'Send messages and emails',
    duration: '30mins',
    done: false,
  },
];

// Create an instance of the manager app to control out todos
const myTodosApp = new TodosApp(rawData); // with data
// const myTodosApp = new TodosApp(); // without data
log('myTodosApp', myTodosApp);

/*************************************************************
 * UI SECTION - LIST
 **************************************************************/

// Locate the place in the page that we want to insert the list
const listMount = document.getElementById('list-mount');

// This is the function that writes that list
function render(todos = [], ordered = false, insertionPoint = listMount) {
  let displayElement = null;

  // IF there are todos, the write the list
  if (todos.length) {
    log('rendering list');
    const listType = ordered ? 'ol' : 'ul';
    const list = document.createElement(listType);
    list.classList.add('list-group');

    for (const todo of todos) {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'todo-item');
      if (todo.done) {
        li.classList.add('done');
      }
      li.innerHTML = `
        <span class="title">${todo.title}</span>
        <span class="description">${todo.description}</span>
        <span class="duration">(${todo.duration})</span>
        <span class="duration">(${todo.done})</span>
        <div class="controls">
        <button class="update btn btn-warning" data-id="${todo._id}">
          <i class="far fa-edit"></i>
          <span class="sr-only">Update</span>
        </button>
        <button class="delete btn btn-danger" data-id="${todo._id}">
        <i class="fas fa-trash-alt"></i>
        <span class="sr-only">Delete</span>
        </button>
      </div>
      `;

      list.append(li);
    }
    displayElement = list;
  } else {
    // OTHERWISE add a placeholder message for the user
    log('rendering no todos message');
    const noTodosMessage = document.createElement('p');
    noTodosMessage.textContent = 'Your list is clean!!';
    displayElement = noTodosMessage;
  }

  insertionPoint.innerHTML = ''; // clear out HTML where we're going to insert
  insertionPoint.append(displayElement); // Insert new HTML
}

/*************************************************************
 * UI SECTION - LIST ITEM BUTTON CLICKS
 **************************************************************/

listMount.addEventListener('click', (e) => {
  // handle delegation (and icons)
  const { target: evtTarget } = e;
  const updateBtn = evtTarget.closest('button.update');
  const deleteBtn = evtTarget.closest('button.delete');

  if (deleteBtn) {
    // Get the id off the button
    const { id } = deleteBtn.dataset;
    log('delete id', id);

    // tell the app: call myTodosApp.removeTodo(id)
    myTodosApp.removeTodo(id);

    // Remove Item from UI or render empty list (to get the 'no items to display')
    const remainingTodos = myTodosApp.getAllTodos();
    if (remainingTodos.length) {
      const li = deleteBtn.closest('li.list-group-item');
      li.remove();
    } else {
      render(remainingTodos);
    }
    return; // stops rest of this fn. from running.
  }

  if (updateBtn) {
    /***************************************************************************
     * THIS ACTION IS ABOUT POPULATING THE FORM, NOT UPDATING THE TODO
     ***************************************************************************/

    // Get todo
    const { id } = updateBtn.dataset;
    const todo = myTodosApp.getTodo(id);
    log('todo to be updated', todo);

    // Populate form
    populate(editForm, todo);

    // Switch mode to update so users and system know what's going on...
    const updateModeStr = 'Update';
    editForm.dataset.mode = updateModeStr;
    for (const node of modeDisplayNodes) {
      node.textContent = updateModeStr;
    }
  }
});

/*************************************************************
 * UI SECTION - FORM SUBMISSION
 **************************************************************/
const editForm = document.forms['edit-form']; // The form
const modeDisplayNodes = document.querySelectorAll('.mode'); // Everything that needs its text changing from 'Add' <=> 'Update'

editForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Find out what mode we are in... Are we adding? Or updating?
  const { mode } = editForm.dataset;
  log('form mode', mode);

  // Get Data
  const formData = new FormData(editForm);
  if (mode === 'Add') {
    formData.delete('_id'); // this will be null because not created yet.
  }
  const data = Object.fromEntries(formData);
  data.done = !!data.done; // change to boolean

  // Send Data to App
  if (mode === 'Add') {
    myTodosApp.addTodo(data);
  } else if (mode === 'Update') {
    myTodosApp.updateTodo(data);
  } else {
    throw new Error('No mode given on form');
  }

  render(myTodosApp.getAllTodos());
  editForm.reset();

  // Reset the UI back to 'Add Mode'
  const updateModeStr = 'Add';
  editForm.dataset.mode = updateModeStr;
  for (const node of modeDisplayNodes) {
    node.textContent = updateModeStr;
  }
});

/*************************************************************
 * RUNNING ORDER
 **************************************************************/
// Call the render method initially to write out the list for the first time
render(myTodosApp.getAllTodos());

/*************************************************************
 * UTILITIES
 **************************************************************/

/**
 * Populate form fields from a JSON object.
 *
 * @param form object The form element containing your input fields.
 * @param data object that has the data in
 */

function populate(form, data) {
  // walk the object
  for (const key in data) {
    // if this is a system property then bail...
    if (!data.hasOwnProperty(key)) {
      continue;
    }

    // get key/value for inputs
    let name = key;
    let value = data[key];

    // Make any bad values an empty string
    if (!value && value !== 0) {
      value = '';
    }

    // try to find element in the form
    const element = form.elements[name];

    // If we can't then bail
    if (!element) {
      continue;
    }

    // see what type an element is to handle the process differently
    const type = element.type || element[0].type;

    switch (type) {
      case 'checkbox': {
        // Here, value is an array of values to be spread across the checkboxes that make up this input. It's the value of the input as a whole, NOT the value of one checkbox.
        const values = Array.isArray(value) ? value : [value];

        for (let j = 0, len = element.length; j < len; j += 1) {
          const thisCheckbox = element[j];
          if (values.includes(thisCheckbox.value)) {
            thisCheckbox.checked = true;
          }
        }
        break;
      }
      case 'select-multiple': {
        const values = Array.isArray(value) ? value : [value];

        for (let k = 0, len = element.options.length; k < len; k += 1) {
          const thisOption = element.options[k];
          if (values.includes(thisOption.value)) {
            thisOption.selected = true;
          }
        }
        break;
      }
      // case "select":
      // case "select-one":
      //   element.value = value.toString() || value;
      //   break;

      // case "date":
      //   element.value = new Date(value).toISOString().split("T")[0];
      //   break;

      // text boxes
      default:
        element.value = value;
        break;
    }
  }
}

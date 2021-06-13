export default class State {
  constructor(state) {
    if (state) {
      this.state = state;
    } else {
      this.state = {
        currentListId: 1,
        lists: [
          { id: 1, name: 'Initial list', removable: false },
          { id: 2, name: 'Second list', removable: true },
        ],
        tasks: [
          { id: 1, listId: 1, text: 'First', completed: false },
          { id: 2, listId: 1, text: 'Second', completed: false },
          { id: 3, listId: 2, text: 'Third', completed: false },
          { id: 4, listId: 2, text: 'Fourth', completed: false },
          { id: 5, listId: 2, text: 'Fifth', completed: false },
        ],
      };
    }
  }

  createTask(listId, text) {
    const task = {
      id: this.getNextTaskId(),
      listId: Number(listId),
      text,
      completed: false,
    };
    this.state.tasks.push(task);
    return task;
  }

  updateTask(id, newFields) {
    this.state.tasks = this.state.tasks.map((task) => {
      if (Number(id) === task.id) {
        return {
          ...task,
          ...newFields,
        };
      }
      return task;
    });
    return this.state.tasks.find((task) => task.id === Number(id));
  }

  deleteTask(id) {
    this.state.tasks = this.state.tasks.filter(
      (task) => Number(id) !== task.id
    );
  }

  creteList(name) {
    const list = {
      id: this.getNextListId(),
      name,
      removable: true,
    };
    this.state.lists.push(list);
    return list;
  }

  deleteList(id) {
    this.state.lists = this.state.lists.filter(
      (list) => Number(id) !== list.id
    );
  }

  getNextTaskId() {
    return this.state.tasks[this.state.tasks.length - 1].id + 1 || 1;
  }

  getNextListId() {
    return this.state.lists[this.state.lists.length - 1].id + 1 || 1;
  }

  valueOf() {
    return this.state;
  }
}

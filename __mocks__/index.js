/* eslint-disable */
import { rest } from 'msw';
import { setupServer } from 'msw/node';

class State {
  constructor(state) {
    this.state = state;
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

export const runServer = (initialState) => {
  const prefix = 'http://localhost/api/v1';

  const makeRoute = (...paths) => `${prefix}/${paths.join('/')}`;

  const state = new State(initialState);

  const handlers = [
    rest.post(makeRoute('lists'), (req, res, ctx) => {
      const list = state.creteList(req.body.name);
      ctx.delay();
      return res(ctx.json(list));
    }),

    rest.delete(makeRoute('lists', ':id'), (req, res, ctx) => {
      state.deleteList(req.params.id);
      ctx.delay();
      return res(ctx.status(204));
    }),

    rest.post(makeRoute('lists', ':id', 'tasks'), (req, res, ctx) => {
      const task = state.createTask(req.params.id, req.body.text);
      ctx.delay();
      return res(ctx.json(task));
    }),

    rest.patch(makeRoute('tasks', ':id'), (req, res, ctx) => {
      const task = state.updateTask(req.params.id, {
        completed: req.body.completed,
      });
      ctx.delay();
      return res(ctx.json(task));
    }),

    rest.delete(makeRoute('tasks', ':id'), (req, res, ctx) => {
      state.deleteTask(req.params.id);
      ctx.delay();
      return res(ctx.status(204));
    }),
  ];

  return setupServer(...handlers);
};

/* eslint-disable */
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import State from '../__fixtures__/State';

export const runServer = () => {
  const prefix = 'http://localhost/api/v1';

  const makeRoute = (...paths) => `${prefix}/${paths.join('/')}`;

  const state = new State();

  const handlers = [
    rest.post(makeRoute('lists'), (req, res, ctx) => {
      const list = state.creteList(req.body.name);
      return res(ctx.json(list));
    }),

    rest.delete(makeRoute('lists', ':id'), (req, res, ctx) => {
      state.deleteList(req.params.id);
      return res(ctx.status(204));
    }),

    rest.post(makeRoute('lists', ':id', 'tasks'), (req, res, ctx) => {
      const task = state.createTask(req.params.id, req.body.text);
      return res(ctx.json(task));
    }),

    rest.patch(makeRoute('tasks', ':id'), (req, res, ctx) => {
      const task = state.updateTask(req.params.id, {
        completed: req.body.completed,
      });
      return res(ctx.json(task));
    }),

    rest.delete(makeRoute('tasks', ':id'), (req, res, ctx) => {
      state.deleteTask(req.params.id);
      return res(ctx.status(204));
    }),
  ];

  return { server: setupServer(...handlers), initialState: state.valueOf() };
};

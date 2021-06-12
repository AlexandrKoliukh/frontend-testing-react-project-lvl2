import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { nanoid } from 'nanoid';

export const runServer = () => {
  const prefix = 'http://localhost/api/v1';

  const makeRoute = (...paths) => `${prefix}/${paths.join('/')}`;

  const handlers = [
    rest.post(makeRoute('lists'), (req, res, ctx) => {
      const list = { id: 2, name: req.body.name, removable: true };
      return res(ctx.json(list));
    }),

    rest.delete(makeRoute('lists', ':id'), (req, res, ctx) => {
      return res(ctx.status(204));
    }),

    rest.post(makeRoute('lists', ':id', 'tasks'), (req, res, ctx) => {
      const task = {
        id: nanoid(),
        listId: Number(req.params.id),
        text: req.body.text,
        completed: false,
      };

      return res(ctx.json(task));
    }),

    rest.patch(makeRoute('tasks', ':id'), (req, res, ctx) => {
      const task = {
        id: Number(req.params.id),
        listId: 1,
        text: req.body.text,
        completed: req.body.completed,
      };

      return res(ctx.json(task));
    }),

    rest.delete(makeRoute('tasks', ':id'), (req, res, ctx) =>
      res(ctx.status(204))
    ),
  ];

  return setupServer(...handlers);
};

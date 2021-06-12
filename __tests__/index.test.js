import { test, expect } from '@jest/globals';
import initApp from '@hexlet/react-todo-app-with-backend';
import {
  getByText,
  queryByText,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runServer } from '../__mocks__';

let server;
let Vdom;

beforeAll(() => {
  server = runServer();
  server.listen();
});

beforeEach(() => {
  const initialState = {
    currentListId: 1,
    lists: [{ id: 1, name: 'Initial list', removable: false }],
    tasks: [],
  };

  Vdom = initApp(initialState);
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

// const createList = async (name) => {
//   const form = screen.getByTestId('list-form');
//
//   userEvent.type(within(form).getByRole('textbox'), name);
//   userEvent.click(within(form).getByRole('button'));
// };

const createTask = async (name) => {
  const form = await screen.getByTestId('task-form');

  await userEvent.type(within(form).getByRole('textbox'), name);
  await userEvent.click(within(form).getByRole('button'));
};

test('index', () => {
  render(Vdom);
  expect(screen.getByText('Hexlet Todos')).toBeInTheDocument();
});

describe('Tasks', () => {
  it('Creating', async () => {
    await render(Vdom);

    await createTask('task1');

    await waitFor(async () => {
      const ul = screen.getByTestId('tasks');
      expect(await getByText(ul, 'task1')).toBeInTheDocument();
    });

    await createTask('task2');

    await waitFor(async () => {
      const ul = screen.getByTestId('tasks');
      expect(await getByText(ul, 'task2')).toBeInTheDocument();
    });
  });

  it('Patching', async () => {
    const initialState = {
      currentListId: 1,
      lists: [{ id: 1, name: 'Initial list', removable: false }],
      tasks: [
        { id: 1, listId: 1, text: 'task1', completed: false },
        { id: 2, listId: 1, text: 'task2', completed: false },
      ],
    };

    await render(initApp(initialState));

    const task1 = await screen.getByLabelText('task1');
    const task2 = await screen.getByLabelText('task2');

    userEvent.click(task1);
    await waitFor(() => {
      expect(task1).toBeChecked();
      expect(task2).not.toBeChecked();
    });

    userEvent.click(task2);
    await waitFor(() => {
      expect(task1).toBeChecked();
      expect(task2).toBeChecked();
    });

    userEvent.click(task1);
    await waitFor(() => {
      expect(task1).not.toBeChecked();
      expect(task2).toBeChecked();
    });
  });

  it('Deleting', async () => {
    const initialState = {
      currentListId: 1,
      lists: [{ id: 1, name: 'Initial list', removable: false }],
      tasks: [
        { id: 1, listId: 1, text: 'task1', completed: false },
        { id: 2, listId: 1, text: 'task2', completed: false },
      ],
    };

    await render(initApp(initialState));

    const buttons = await screen.getAllByRole('button', { name: /remove/i });

    await waitFor(() => {
      expect(buttons).toHaveLength(2);

      const ul = screen.getByTestId('tasks');

      expect(queryByText(ul, 'task1')).toBeInTheDocument();
      expect(queryByText(ul, 'task2')).toBeInTheDocument();
    });

    userEvent.click(buttons[0]);

    await waitFor(() => {
      const ul = screen.getByTestId('tasks');

      expect(queryByText(ul, 'task1')).not.toBeInTheDocument();
      expect(queryByText(ul, 'task2')).toBeInTheDocument();
    });
  });
});

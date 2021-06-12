/* eslint-disable */
import { test, expect } from '@jest/globals';
import initApp from '@hexlet/react-todo-app-with-backend';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runServer } from '../__mocks__';

let server;

beforeAll(() => {
  server = runServer();
  server.listen();
});

beforeEach(() => {});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

const createList = async (name) => {
  const form = screen.getByTestId('list-form');

  userEvent.type(within(form).getByRole('textbox'), name);
  userEvent.click(within(form).getByRole('button'));
};

const createTask = async (name) => {
  const form = await screen.getByTestId('task-form');

  await userEvent.type(within(form).getByRole('textbox'), name);
  await userEvent.click(within(form).getByRole('button'));
};

const initialState = {
  currentListId: 1,
  lists: [
    { id: 1, name: 'Initial list', removable: false },
    { id: 2, name: 'Second list', removable: true },
  ],
  tasks: [
    { id: 1, listId: 1, text: 'task1', completed: false },
    { id: 2, listId: 1, text: 'task2', completed: false },
    { id: 3, listId: 2, text: 'task3', completed: false },
    { id: 4, listId: 2, text: 'task4', completed: false },
    { id: 5, listId: 2, text: 'task5', completed: false },
  ],
};

test('index', () => {
  render(initApp(initialState));
  expect(screen.getByText('Hexlet Todos')).toBeInTheDocument();
});

describe('Tasks', () => {
  it('Creating', async () => {
    await render(initApp({ ...initialState, tasks: [] }));

    await createTask('task1');
    await waitFor(async () => {
      const ul = screen.getByTestId('tasks');
      expect(await within(ul).getByText('task1')).toBeInTheDocument();
    });

    await createTask('task2');
    await waitFor(async () => {
      const ul = screen.getByTestId('tasks');
      expect(await within(ul).getByText('task2')).toBeInTheDocument();
    });

    await createTask('task2');
    await waitFor(async () => {
      const ul = screen.getByTestId('tasks');
      expect(await within(ul).getAllByText('task2')).toHaveLength(1);
    });
  });

  it('Patching', async () => {
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
    await render(initApp(initialState));

    const ul = screen.getByTestId('tasks');
    const buttons = await within(ul).getAllByRole('button', {
      name: 'Remove',
    });

    await waitFor(() => {
      expect(buttons).toHaveLength(2);

      expect(within(ul).queryByText('task1')).toBeInTheDocument();
      expect(within(ul).queryByText('task2')).toBeInTheDocument();
    });

    userEvent.click(buttons[0]);

    await waitFor(() => {
      expect(within(ul).queryByText('task1')).not.toBeInTheDocument();
      expect(within(ul).queryByText('task2')).toBeInTheDocument();
    });
  });
});

describe('Lists', () => {
  it('Creating', async () => {
    await render(
      initApp({
        ...initialState,
        lists: [{ id: 1, name: 'Initial list', removable: false }],
      })
    );

    const lists = await screen.getByTestId('lists');
    const tasks = await screen.getByTestId('tasks');

    await waitFor(async () => {
      expect(
        await within(lists).findByText('Initial list')
      ).toBeInTheDocument();
      expect(await within(lists).getAllByRole('listitem')).toHaveLength(1);
    });

    await createList('list1');
    await waitFor(async () => {
      expect(await within(lists).getAllByRole('listitem')).toHaveLength(2);
      expect(await within(lists).findByText('list1')).toBeInTheDocument();
      expect(await within(tasks).getAllByRole('listitem')).toHaveLength(3);
    });

    await userEvent.click(screen.getByRole('button', { name: 'Initial list' }));

    await waitFor(async () => {
      expect(await within(tasks).getAllByRole('listitem')).toHaveLength(2);
    });

    await createList('list1');
    await createList('list1');
    await createList('list1');
    await waitFor(async () => {
      expect(await within(lists).getAllByRole('listitem')).toHaveLength(2);
    });

    await userEvent.click(screen.getByRole('button', { name: 'list1' }));
    await waitFor(async () => {
      expect(await within(tasks).getAllByRole('listitem')).toHaveLength(3);
    });
  });

  it('Deleting', async () => {
    await render(initApp(initialState));
    const lists = await screen.getByTestId('lists');

    expect(await within(lists).getAllByRole('listitem')).toHaveLength(2);

    await userEvent.click(
      within(lists).getByRole('button', { name: 'Second list' })
    );
    await waitFor(async () => {
      const tasks = await screen.getByTestId('tasks');

      expect(await within(tasks).getAllByRole('listitem')).toHaveLength(3);
    });

    await userEvent.click(
      within(lists).getByRole('button', { name: 'remove list' })
    );

    await waitFor(async () => {
      const tasks = await screen.getByTestId('tasks');

      expect(within(tasks).getAllByRole('listitem')).toHaveLength(2);
      expect(within(lists).getAllByRole('listitem')).toHaveLength(1);
      expect(within(tasks).queryByText('task3')).not.toBeInTheDocument();
    });
  });
});

/* eslint-disable */
import { test, expect } from '@jest/globals';
import initApp from '@hexlet/react-todo-app-with-backend';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runServer } from '../__mocks__';

let server;

beforeEach(() => {
  const initial = runServer();
  server = initial.server;
  server.listen();

  render(initApp(initial.initialState));
});

afterEach(() => {
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

test('index', async () => {
  expect(screen.getByText('Hexlet Todos')).toBeVisible();
});

describe('Tasks', () => {
  it('Creating', async () => {
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
    const task1 = await screen.getByLabelText('First');
    const task2 = await screen.getByLabelText('Second');

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
    const ul = screen.getByTestId('tasks');
    const buttons = await within(ul).getAllByRole('button', {
      name: 'Remove',
    });

    await waitFor(() => {
      expect(buttons).toHaveLength(2);
      expect(within(ul).queryByText('First')).toBeInTheDocument();
      expect(within(ul).queryByText('Second')).toBeInTheDocument();
    });

    userEvent.click(buttons[0]);
    await waitFor(() => {
      expect(within(ul).queryByText('First')).not.toBeInTheDocument();
      expect(within(ul).queryByText('Second')).toBeInTheDocument();
    });
  });
});

describe('Lists', () => {
  it('Creating', async () => {
    await waitFor(async () => {
      const lists = await screen.getByTestId('lists');
      expect(
        await within(lists).findByText('Initial list')
      ).toBeInTheDocument();
      expect(await within(lists).getAllByRole('listitem')).toHaveLength(2);
    });

    await createList('list1');
    await waitFor(async () => {
      const lists = await screen.getByTestId('lists');
      expect(await within(lists).getAllByRole('listitem')).toHaveLength(3);
      expect(await within(lists).findByText('list1')).toBeInTheDocument();
      expect(screen.queryByTestId('tasks')).not.toBeInTheDocument();
      expect(screen.getByText('Tasks list is empty')).toBeVisible();
    });

    await createTask('task1');
    await waitFor(async () => {
      expect(screen.queryByText('task1')).toBeVisible();
    });

    await createTask('task2');
    await waitFor(async () => {
      const tasks = await screen.getByTestId('tasks');
      expect(await within(tasks).getAllByRole('listitem')).toHaveLength(2);
      expect(screen.queryByText('task1')).toBeVisible();
      expect(screen.queryByText('task2')).toBeVisible();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Initial list' }));
    await waitFor(async () => {
      expect(screen.queryByText('task1')).not.toBeInTheDocument();
      expect(screen.queryByText('task2')).not.toBeInTheDocument();
    });

    await createList('list1');
    await waitFor(async () => {
      const lists = await screen.getByTestId('lists');
      expect(await within(lists).getAllByText('list1')).toHaveLength(1);
    });

    await userEvent.click(screen.getByRole('button', { name: 'list1' }));
    await waitFor(async () => {
      const tasks = await screen.getByTestId('tasks');

      expect(await within(tasks).getAllByRole('listitem')).toHaveLength(2);
      expect(screen.queryByText('task1')).toBeVisible();
      expect(screen.queryByText('task2')).toBeVisible();
    });
  });

  it('Deleting', async () => {
    await waitFor(async () => {
      const lists = await screen.getByTestId('lists');
      expect(await within(lists).getAllByRole('listitem')).toHaveLength(2);
    });

    await userEvent.click(screen.getByRole('button', { name: 'Second list' }));
    await waitFor(async () => {
      const tasks = await screen.getByTestId('tasks');
      expect(await within(tasks).getAllByRole('listitem')).toHaveLength(3);
    });

    await userEvent.click(screen.getByRole('button', { name: 'remove list' }));
    await waitFor(async () => {
      const tasks = await screen.getByTestId('tasks');
      const lists = await screen.getByTestId('lists');

      expect(within(tasks).getAllByRole('listitem')).toHaveLength(2);
      expect(within(lists).getAllByRole('listitem')).toHaveLength(1);
      expect(within(tasks).queryByText('task3')).not.toBeInTheDocument();
    });
  });
});

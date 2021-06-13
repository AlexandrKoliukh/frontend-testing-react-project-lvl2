/* eslint-disable */
import { test, expect } from '@jest/globals';
import initApp from '@hexlet/react-todo-app-with-backend';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runServer } from '../__mocks__';

let server;

beforeEach(() => {
  const state = {
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
  server = runServer(state);
  server.listen();

  render(initApp(state));
});

afterEach(() => {
  server.close();
});

const createList = (name) => {
  const form = screen.getByTestId('list-form');

  userEvent.type(within(form).getByRole('textbox'), name);
  userEvent.click(within(form).getByRole('button'));
};

const createTask = (name) => {
  const form = screen.getByTestId('task-form');

  userEvent.type(within(form).getByRole('textbox'), name);
  userEvent.click(within(form).getByRole('button'));
};

test('index', () => {
  expect(screen.getByText('Hexlet Todos')).toBeVisible();
});

describe('Tasks', () => {
  it('Creating', async () => {
    const form = screen.getByTestId('task-form');
    const input = within(form).getByRole('textbox');
    const submit = within(form).getByRole('button');

    userEvent.type(input, 'task1');
    userEvent.click(submit);

    expect(input.hasAttribute('readOnly')).toBe(true);
    expect(submit).toBeDisabled();

    await waitFor(() => {
      const ul = screen.getByTestId('tasks');
      expect(within(ul).getByText('task1')).toBeInTheDocument();
    });

    expect(input.hasAttribute('readOnly')).toBe(false);
    expect(submit).toBeEnabled();

    userEvent.type(input, 'task2');
    userEvent.click(submit);

    await waitFor(() => {
      const ul = screen.getByTestId('tasks');
      expect(within(ul).getByText('task2')).toBeInTheDocument();
    });

    userEvent.type(input, 'task2');
    userEvent.click(submit);

    await waitFor(() => {
      const ul = screen.getByTestId('tasks');
      expect(within(ul).getAllByText('task2')).toHaveLength(1);
    });
    expect(within(form).getByText('task2 already exists')).toBeVisible();
  });

  it('Patching', async () => {
    const task1 = screen.getByLabelText('First');
    const task2 = screen.getByLabelText('Second');

    userEvent.click(task1);
    expect(task1).toBeDisabled();
    expect(task2).toBeEnabled();

    await waitFor(() => {
      expect(task1).toBeChecked();
    });
    expect(task1).toBeEnabled();
    expect(task2).not.toBeChecked();

    const tasks = screen.getByTestId('tasks');
    expect(tasks.querySelectorAll('s')).toHaveLength(1);
    const items = within(tasks).getAllByRole('listitem');
    const lastItem = items[items.length - 1];
    expect(lastItem.querySelector('s')).not.toBeNull();
    expect(within(lastItem).queryByText('First')).toBeVisible();

    userEvent.click(task2);
    await waitFor(() => {
      expect(task2).toBeChecked();
    });
    expect(task1).toBeChecked();

    expect(tasks.querySelectorAll('s')).toHaveLength(2);

    userEvent.click(task1);
    userEvent.click(task2);
    await waitFor(() => {
      expect(task1).not.toBeChecked();
      expect(task2).not.toBeChecked();
    });

    expect(tasks.querySelectorAll('s')).toHaveLength(0);
  });

  it('Deleting', async () => {
    const ul = screen.getByTestId('tasks');
    const buttons = within(ul).getAllByRole('button', {
      name: 'Remove',
    });

    expect(buttons).toHaveLength(2);
    expect(within(ul).queryByText('First')).toBeInTheDocument();
    expect(within(ul).queryByText('Second')).toBeInTheDocument();

    userEvent.click(buttons[0]);
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toBeEnabled();
    expect(within(ul).getByLabelText('First')).toBeDisabled();
    expect(within(ul).getByLabelText('Second')).toBeEnabled();

    await waitFor(() => {
      expect(within(ul).queryByText('First')).not.toBeInTheDocument();
    });
    expect(within(ul).queryByText('Second')).toBeInTheDocument();
  });
});

describe('Lists', () => {
  it('Creating', async () => {
    const lists = screen.getByTestId('lists');
    expect(within(lists).getByText('Initial list')).toBeInTheDocument();
    expect(within(lists).getAllByRole('listitem')).toHaveLength(2);

    const form = screen.getByTestId('list-form');
    const input = within(form).getByRole('textbox');
    const submit = within(form).getByRole('button');

    userEvent.type(input, 'list1');
    userEvent.click(submit);
    expect(input.hasAttribute('readOnly')).toBe(true);
    expect(submit).toBeDisabled();

    await waitFor(() => {
      expect(within(lists).getByText('list1')).toBeInTheDocument();
    });
    expect(within(lists).getAllByRole('listitem')).toHaveLength(3);
    expect(screen.queryByTestId('tasks')).not.toBeInTheDocument();
    expect(screen.getByText('Tasks list is empty')).toBeVisible();

    createTask('task1');
    await waitFor(() => {
      expect(screen.queryByText('task1')).toBeVisible();
    });

    const tasks = screen.getByTestId('tasks');
    createTask('task2');

    await waitFor(() => {
      expect(screen.queryByText('task2')).toBeVisible();
    });
    expect(within(tasks).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.queryByText('task1')).toBeVisible();

    userEvent.click(screen.getByRole('button', { name: 'Initial list' }));
    expect(screen.queryByText('task1')).not.toBeInTheDocument();
    expect(screen.queryByText('task2')).not.toBeInTheDocument();

    createList('list1');
    await waitFor(() => {
      expect(within(lists).getAllByText('list1')).toHaveLength(1);
    });

    userEvent.click(screen.getByRole('button', { name: 'list1' }));

    expect(within(tasks).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.queryByText('task1')).toBeVisible();
    expect(screen.queryByText('task2')).toBeVisible();
  });

  it('Deleting', async () => {
    const lists = screen.getByTestId('lists');
    expect(within(lists).getAllByRole('listitem')).toHaveLength(2);

    userEvent.click(screen.getByRole('button', { name: 'Second list' }));

    expect(
      within(screen.getByTestId('tasks')).getAllByRole('listitem')
    ).toHaveLength(3);

    userEvent.click(screen.getByRole('button', { name: 'remove list' }));
    await waitFor(() => {
      expect(within(lists).queryByText('Second list')).not.toBeInTheDocument();
    });

    expect(within(lists).getAllByRole('listitem')).toHaveLength(1);
    expect(
      within(screen.getByTestId('tasks')).getAllByRole('listitem')
    ).toHaveLength(2);
  });
});

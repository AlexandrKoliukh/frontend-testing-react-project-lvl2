import { test, expect } from '@jest/globals';
import initApp from '@hexlet/react-todo-app-with-backend';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

let vdom;

const initialState = {
  currentListId: 1,
  lists: [{ id: 1, name: 'list', removable: false }],
  tasks: [],
};

beforeEach(() => {
  vdom = initApp(initialState);
});

test('index', () => {
  render(vdom);
  expect(screen.getByText('Hexlet Todos')).toBeInTheDocument();
});

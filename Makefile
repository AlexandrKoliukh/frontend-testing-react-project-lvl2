install: install-deps

start:
	npx @hexlet/react-todo-app-with-backend

install-deps:
	npm ci

test:
	npm test

test-watch:
	npm run test:watch

test-coverage:
	npm test -- --coverage --coverageProvider=v8

lint:
	npx eslint .

publish:
	npm publish

.PHONY: test

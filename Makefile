.PHONY: lint format book

lint:
	npm run lint

format:
	npm run format

book:
	./scripts/build_book.sh

.PHONY: build run

NAME = alias-oracle


default: build

build:
	docker build -t $(NAME) .
run:
	docker run --rm -p 3300:3300 --name $(NAME) $(NAME)
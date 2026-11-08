.PHONY: up down build rebuild logs ps stop restart

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

rebuild:
	docker compose up -d --build

logs:
	docker compose logs -f app

ps:
	docker compose ps

stop:
	docker compose stop

restart:
	docker compose restart
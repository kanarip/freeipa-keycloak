build:
	@docker-compose build

certs:
	@data/ssl/bin/regen

clean:
	@docker rmi $$(docker images -qa --filter=dangling=true)

down:
	@docker-compose down

reset: clean
	@sudo git clean -d -f -x

start:
	@docker-compose start

stop:
	@docker-compose stop

up:
	@docker-compose up

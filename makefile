.PHONY: run_database
run_database:
	docker run -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=${MONGO_USERNAME} -e MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD} -v $(pwd)/data:/data/db -d mongo

.PHONY: build
build:
	yarn run build

.PHONY: start
start:
	yarn run start

.PHONY: stop
stop:
	yarn run stop

.PHONY: logs
logs:
	tail -f /home/spindoladeyvid/.pm2/logs/x2-green-out.log

.PHONY: pull
pull:
	git pull
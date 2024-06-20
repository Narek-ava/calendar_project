#!/usr/bin/make
# Makefile readme (ru): <http://linux.yaroslavl.ru/docs/prog/gnu_make_3-79_russian_manual.html>
# Makefile readme (en): <https://www.gnu.org/software/make/manual/html_node/index.html#SEC_Contents>

ifneq ("$(wildcard .env)","")
	include .env
	export $(shell sed 's/=.*//' .env)
endif

.PHONY : help up down restart update
.DEFAULT_GOAL := help

# This will output the help for each task. thanks to https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
help: ## Show this help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# --- [ Development tasks ] -------------------------------------------------------------------------------------------

---------------: ## ---------------
init: docker-down-clear frontend-clear tva-clear docker-pull docker-build docker-up freescout-init api-init frontend-init frontend-ready tva-init tva-ready minio-init ## Make full application initialization
up: docker-up ## Start all containers
down: docker-down ## Stop all started containers
restart: down up ## Restart all started containers
update: api-composer-update frontend-yarn-upgrade tva-yarn-upgrade restart ## Update dependencies

#Shell
api-cli:
	docker-compose run api-php-cli bash

api-dump-server:
	docker-compose exec api-php-fpm php artisan dump-server
	
api-tinker:
	docker-compose exec api-php-fpm php artisan tinker

# Docker
docker-up:
	docker-compose up -d

docker-pull:
	docker-compose pull

docker-down:
	docker-compose down --remove-orphans

docker-down-clear:
	docker-compose down -v --remove-orphans

docker-build:
	DOCKER_BUILDKIT=1 COMPOSE_DOCKER_CLI_BUILD=1 docker-compose build --build-arg BUILDKIT_INLINE_CACHE=1 --pull

# Inbox only initialization, build and up
inbox-init: docker-down-clear docker-pull-inbox docker-build-inbox docker-up-inbox freescout-init minio-init
inbox-up: docker-up-inbox
inbox-restart: docker-down inbox-up
docker-up-inbox:
	docker-compose -f docker-compose.only-inbox.yml up -d
docker-pull-inbox:
	docker-compose -f docker-compose.only-inbox.yml pull
docker-build-inbox:
	DOCKER_BUILDKIT=1 COMPOSE_DOCKER_CLI_BUILD=1 docker-compose -f docker-compose.only-inbox.yml build --build-arg BUILDKIT_INLINE_CACHE=1 --pull

push-dev-cache:
	docker-compose push

#Minio
minio-init:
	docker run --rm -it --network=calendar-project_default --entrypoint="" minio/mc /bin/sh -c \
'mc config host add minio http://minio:9000 app password; mc mb minio/local; mc policy set public minio/local; exit 0'

# Frontend
frontend-clear:
	docker run --rm -v ${PWD}/frontend:/app -w /app alpine sh -c 'rm -rf .ready build'

frontend-init: frontend-yarn-install

frontend-yarn-install:
	docker-compose run --rm frontend-node-cli yarn install

frontend-yarn-upgrade:
	docker-compose run --rm frontend-node-cli yarn upgrade

frontend-ready:
	docker run --rm -v ${PWD}/frontend:/app -w /app alpine touch .ready

frontend-lint:
	docker run --rm -v ${PWD}/frontend:/app:rw -w /app node:17-alpine yarn eslint
	docker run --rm -v ${PWD}/frontend:/app:rw -w /app node:17-alpine yarn prettier --check ./src

# Twilio Video Application
tva-clear:
	docker run --rm -v ${PWD}/tva:/app -w /app alpine sh -c 'rm -rf .ready build'

tva-init: tva-yarn-install

tva-yarn-install:
	docker-compose run --rm tva-node-cli yarn install

tva-yarn-upgrade:
	docker-compose run --rm tva-node-cli yarn upgrade

tva-ready:
	docker run --rm -v ${PWD}/tva:/app -w /app alpine touch .ready
	
tva-cli:
	docker-compose run tva-node-cli sh
	
# Api
api-init: api-permissions api-composer-install api-wait-db api-migrations api-seed

api-permissions:
	docker run --rm -v ${PWD}/api:/app -w /app alpine chmod 777 -R storage bootstrap

api-composer-install:
	docker-compose run --rm api-php-cli composer install

api-wait-db:
	docker-compose run --rm api-php-cli wait-for-it api-postgres:5432 -t 30

api-migrations:
	docker-compose run --rm api-php-cli php artisan migrate --no-interaction -vvv

api-seed:
	docker-compose run --rm api-php-cli php artisan db:seed --no-interaction -vvv

api-composer-update:
	docker-compose run --rm api-php-cli composer update

# Freescout
freescout-init: freescout-permissions freescout-composer-install freescout-wait-db freescout-install

freescout-permissions:
	docker run --rm -v ${PWD}/freescout:/app -w /app alpine chmod 777 -R storage bootstrap
	docker run --rm -v ${PWD}/freescout:/app -w /app alpine chmod 777 -R public/modules public/js/builds public/css/builds

freescout-composer-install:
	docker-compose run --rm freescout-php-cli composer install

freescout-wait-db:
	docker-compose run --rm freescout-php-cli wait-for-it freescout-postgres:5432 -t 30

freescout-install:
	docker-compose run --rm freescout-php-cli php artisan storage:link
	docker-compose run --rm freescout-php-cli php artisan migrate --force --no-interaction
	#docker-compose run --rm freescout-php-cli php artisan freescout:create-user --role=admin --firstName=FSAdminFN \
#	--lastName=FSAdminLN --email=admin-freescout@admin.com --password=password -q -n

freescout-cli:
	docker-compose run freescout-php-cli bash

# Build/Deploy

build-production: build-frontend-production build-api-production build-freescout-production build-tva-production
build-staging: build-frontend-staging build-api build-freescout build-tva-staging
build-develop: build-frontend-develop build-api build-freescout build-tva-develop
build-e2e: build-api

build-frontend-production:
	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
	--target builder \
	--cache-from ${REGISTRY}/frontend:cache-builder \
	--tag ${REGISTRY}/frontend:cache-builder \
	--file frontend/docker/production/nginx/Dockerfile frontend

	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
    --cache-from ${REGISTRY}/frontend:cache-builder \
	--cache-from ${REGISTRY}/frontend:cache \
	--tag ${REGISTRY}/frontend:cache \
	--tag ${REGISTRY}/frontend:latest \
	--tag ${REGISTRY}/frontend:${IMAGE_TAG} \
	--file frontend/docker/production/nginx/Dockerfile frontend

build-frontend-staging:
	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
	--target builder \
	--cache-from ${REGISTRY}/frontend:cache-builder \
	--tag ${REGISTRY}/frontend:cache-builder \
	--file frontend/docker/staging/nginx/Dockerfile frontend

	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
    --cache-from ${REGISTRY}/frontend:cache-builder \
	--cache-from ${REGISTRY}/frontend:cache \
	--tag ${REGISTRY}/frontend:cache \
	--tag ${REGISTRY}/frontend:${IMAGE_TAG} \
	--file frontend/docker/staging/nginx/Dockerfile frontend

build-frontend-develop:
	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
	--target builder \
	--cache-from ${REGISTRY}/frontend:cache-builder \
	--tag ${REGISTRY}/frontend:cache-builder \
	--file frontend/docker/develop/nginx/Dockerfile frontend

	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
    --cache-from ${REGISTRY}/frontend:cache-builder \
	--cache-from ${REGISTRY}/frontend:cache \
	--tag ${REGISTRY}/frontend:cache \
	--tag ${REGISTRY}/frontend:${IMAGE_TAG} \
	--file frontend/docker/develop/nginx/Dockerfile frontend
	
build-frontend-e2e:
	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
	--target builder \
	--cache-from ${REGISTRY}/frontend-e2e:cache-builder \
	--tag ${REGISTRY}/frontend-e2e:cache-builder \
	--file frontend/docker/e2e/nginx/Dockerfile frontend

	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
    --cache-from ${REGISTRY}/frontend-e2e:cache-builder \
	--cache-from ${REGISTRY}/frontend-e2e:cache \
	--tag ${REGISTRY}/frontend-e2e:cache \
	--tag ${REGISTRY}/frontend-e2e:${IMAGE_TAG} \
	--file frontend/docker/e2e/nginx/Dockerfile frontend

build-api:
	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
	--cache-from ${REGISTRY}/api:cache \
	--tag ${REGISTRY}/api:cache \
	--tag ${REGISTRY}/api:${IMAGE_TAG} \
	--file api/docker/production/nginx/Dockerfile api

	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
	--target builder \
	--cache-from ${REGISTRY}/api-php-fpm:cache-builder \
	--tag ${REGISTRY}/api-php-fpm:cache-builder \
	--file api/docker/production/php-fpm/Dockerfile api

	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
 	--cache-from ${REGISTRY}/api-php-fpm:cache-builder \
 	--cache-from ${REGISTRY}/api-php-fpm:cache \
 	--tag ${REGISTRY}/api-php-fpm:cache \
 	--tag ${REGISTRY}/api-php-fpm:${IMAGE_TAG} \
 	--file api/docker/production/php-fpm/Dockerfile api

	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
	--target builder \
	--cache-from ${REGISTRY}/api-php-cli:cache-builder \
	--tag ${REGISTRY}/api-php-cli:cache-builder \
	--file api/docker/production/php-cli/Dockerfile api

	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
	--cache-from ${REGISTRY}/api-php-cli:cache-builder \
	--cache-from ${REGISTRY}/api-php-cli:cache \
	--tag ${REGISTRY}/api-php-cli:cache \
	--tag ${REGISTRY}/api-php-cli:${IMAGE_TAG} \
	--file api/docker/production/php-cli/Dockerfile api

build-api-production:
	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
	--cache-from ${REGISTRY}/api:cache \
	--tag ${REGISTRY}/api:cache \
	--tag ${REGISTRY}/api:latest \
	--tag ${REGISTRY}/api:${IMAGE_TAG} \
	--file api/docker/production/nginx/Dockerfile api

	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
	--target builder \
	--cache-from ${REGISTRY}/api-php-fpm:cache-builder \
	--tag ${REGISTRY}/api-php-fpm:cache-builder \
	--file api/docker/production/php-fpm/Dockerfile api

	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
 	--cache-from ${REGISTRY}/api-php-fpm:cache-builder \
 	--cache-from ${REGISTRY}/api-php-fpm:cache \
 	--tag ${REGISTRY}/api-php-fpm:cache \
 	--tag ${REGISTRY}/api-php-fpm:latest \
 	--tag ${REGISTRY}/api-php-fpm:${IMAGE_TAG} \
 	--file api/docker/production/php-fpm/Dockerfile api

	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
	--target builder \
	--cache-from ${REGISTRY}/api-php-cli:cache-builder \
	--tag ${REGISTRY}/api-php-cli:cache-builder \
	--file api/docker/production/php-cli/Dockerfile api

	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
	--cache-from ${REGISTRY}/api-php-cli:cache-builder \
	--cache-from ${REGISTRY}/api-php-cli:cache \
	--tag ${REGISTRY}/api-php-cli:cache \
	--tag ${REGISTRY}/api-php-cli:latest \
	--tag ${REGISTRY}/api-php-cli:${IMAGE_TAG} \
	--file api/docker/production/php-cli/Dockerfile api

build-freescout:
	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
	--cache-from ${REGISTRY}/freescout:cache \
	--tag ${REGISTRY}/freescout:cache \
	--tag ${REGISTRY}/freescout:${IMAGE_TAG} \
	--file freescout/docker/production/nginx/Dockerfile freescout

	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
	--target builder \
	--cache-from ${REGISTRY}/freescout-php-fpm:cache-builder \
	--tag ${REGISTRY}/freescout-php-fpm:cache-builder \
	--file freescout/docker/production/php-fpm/Dockerfile freescout

	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
 	--cache-from ${REGISTRY}/freescout-php-fpm:cache-builder \
 	--cache-from ${REGISTRY}/freescout-php-fpm:cache \
 	--tag ${REGISTRY}/freescout-php-fpm:cache \
 	--tag ${REGISTRY}/freescout-php-fpm:${IMAGE_TAG} \
 	--file freescout/docker/production/php-fpm/Dockerfile freescout

	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
	--target builder \
	--cache-from ${REGISTRY}/freescout-php-cli:cache-builder \
	--tag ${REGISTRY}/freescout-php-cli:cache-builder \
	--file freescout/docker/production/php-cli/Dockerfile freescout

	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
	--cache-from ${REGISTRY}/freescout-php-cli:cache-builder \
	--cache-from ${REGISTRY}/freescout-php-cli:cache \
	--tag ${REGISTRY}/freescout-php-cli:cache \
	--tag ${REGISTRY}/freescout-php-cli:${IMAGE_TAG} \
	--file freescout/docker/production/php-cli/Dockerfile freescout

build-freescout-production:
	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
	--cache-from ${REGISTRY}/freescout:cache \
	--tag ${REGISTRY}/freescout:cache \
	--tag ${REGISTRY}/freescout:latest \
	--tag ${REGISTRY}/freescout:${IMAGE_TAG} \
	--file freescout/docker/production/nginx/Dockerfile freescout

	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
	--target builder \
	--cache-from ${REGISTRY}/freescout-php-fpm:cache-builder \
	--tag ${REGISTRY}/freescout-php-fpm:cache-builder \
	--file freescout/docker/production/php-fpm/Dockerfile freescout

	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
 	--cache-from ${REGISTRY}/freescout-php-fpm:cache-builder \
 	--cache-from ${REGISTRY}/freescout-php-fpm:cache \
 	--tag ${REGISTRY}/freescout-php-fpm:cache \
 	--tag ${REGISTRY}/freescout-php-fpm:latest \
 	--tag ${REGISTRY}/freescout-php-fpm:${IMAGE_TAG} \
 	--file freescout/docker/production/php-fpm/Dockerfile freescout

	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
	--target builder \
	--cache-from ${REGISTRY}/freescout-php-cli:cache-builder \
	--tag ${REGISTRY}/freescout-php-cli:cache-builder \
	--file freescout/docker/production/php-cli/Dockerfile freescout

	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
	--cache-from ${REGISTRY}/freescout-php-cli:cache-builder \
	--cache-from ${REGISTRY}/freescout-php-cli:cache \
	--tag ${REGISTRY}/freescout-php-cli:cache \
	--tag ${REGISTRY}/freescout-php-cli:latest \
	--tag ${REGISTRY}/freescout-php-cli:${IMAGE_TAG} \
	--file freescout/docker/production/php-cli/Dockerfile freescout
	
build-tva-develop:
	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
	--target builder \
	--cache-from ${REGISTRY}/tva:cache-builder \
	--tag ${REGISTRY}/tva:cache-builder \
	--file tva/docker/develop/nginx/Dockerfile tva

	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
    --cache-from ${REGISTRY}/tva:cache-builder \
	--cache-from ${REGISTRY}/tva:cache \
	--tag ${REGISTRY}/tva:cache \
	--tag ${REGISTRY}/tva:${IMAGE_TAG} \
	--file tva/docker/develop/nginx/Dockerfile tva
	
build-tva-staging:
	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
	--target builder \
	--cache-from ${REGISTRY}/tva:cache-builder \
	--tag ${REGISTRY}/tva:cache-builder \
	--file tva/docker/staging/nginx/Dockerfile tva

	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
    --cache-from ${REGISTRY}/tva:cache-builder \
	--cache-from ${REGISTRY}/tva:cache \
	--tag ${REGISTRY}/tva:cache \
	--tag ${REGISTRY}/tva:${IMAGE_TAG} \
	--file tva/docker/staging/nginx/Dockerfile tva
	
build-tva-production:
	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
	--target builder \
	--cache-from ${REGISTRY}/tva:cache-builder \
	--tag ${REGISTRY}/tva:cache-builder \
	--file tva/docker/production/nginx/Dockerfile tva

	DOCKER_BUILDKIT=1 docker --log-level=debug build --pull --build-arg BUILDKIT_INLINE_CACHE=1 \
    --cache-from ${REGISTRY}/tva:cache-builder \
	--cache-from ${REGISTRY}/tva:cache \
	--tag ${REGISTRY}/tva:cache \
	--tag ${REGISTRY}/tva:latest \
	--tag ${REGISTRY}/tva:${IMAGE_TAG} \
	--file tva/docker/production/nginx/Dockerfile tva
	
try-build:
	REGISTRY=localhost IMAGE_TAG=0 make build

push-build-cache: push-build-cache-frontend push-build-cache-api push-build-cache-freescout push-build-cache-tva
push-build-cache-e2e: push-build-cache-api

push-build-cache-frontend:
	docker push ${REGISTRY}/frontend:cache-builder
	docker push ${REGISTRY}/frontend:cache

push-build-cache-frontend-e2e:
	docker push ${REGISTRY}/frontend-e2e:cache-builder
	docker push ${REGISTRY}/frontend-e2e:cache

push-build-cache-api:
	docker push ${REGISTRY}/api:cache
	docker push ${REGISTRY}/api-php-fpm:cache-builder
	docker push ${REGISTRY}/api-php-fpm:cache
	docker push ${REGISTRY}/api-php-cli:cache-builder
	docker push ${REGISTRY}/api-php-cli:cache

push-build-cache-freescout:
	docker push ${REGISTRY}/freescout:cache
	docker push ${REGISTRY}/freescout-php-fpm:cache-builder
	docker push ${REGISTRY}/freescout-php-fpm:cache
	docker push ${REGISTRY}/freescout-php-cli:cache-builder
	docker push ${REGISTRY}/freescout-php-cli:cache
	
push-build-cache-tva:
	docker push ${REGISTRY}/tva:cache-builder
	docker push ${REGISTRY}/tva:cache

push: push-frontend push-api push-freescout push-tva
push-e2e: push-api
push-production: push-frontend-production push-api-production push-freescout-production push-tva-production

push-frontend:
	docker push ${REGISTRY}/frontend:${IMAGE_TAG}

push-frontend-e2e:
	docker push ${REGISTRY}/frontend-e2e:${IMAGE_TAG}

push-frontend-production:
	docker push ${REGISTRY}/frontend:${IMAGE_TAG}
	docker push ${REGISTRY}/frontend:latest

push-api:
	docker push ${REGISTRY}/api:${IMAGE_TAG}
	docker push ${REGISTRY}/api-php-fpm:${IMAGE_TAG}
	docker push ${REGISTRY}/api-php-cli:${IMAGE_TAG}

push-api-production:
	docker push ${REGISTRY}/api:${IMAGE_TAG}
	docker push ${REGISTRY}/api:latest
	docker push ${REGISTRY}/api-php-fpm:${IMAGE_TAG}
	docker push ${REGISTRY}/api-php-fpm:latest
	docker push ${REGISTRY}/api-php-cli:${IMAGE_TAG}
	docker push ${REGISTRY}/api-php-cli:latest

push-freescout:
	docker push ${REGISTRY}/freescout:${IMAGE_TAG}
	docker push ${REGISTRY}/freescout-php-fpm:${IMAGE_TAG}
	docker push ${REGISTRY}/freescout-php-cli:${IMAGE_TAG}

push-freescout-production:
	docker push ${REGISTRY}/freescout:${IMAGE_TAG}
	docker push ${REGISTRY}/freescout:latest
	docker push ${REGISTRY}/freescout-php-fpm:${IMAGE_TAG}
	docker push ${REGISTRY}/freescout-php-fpm:latest
	docker push ${REGISTRY}/freescout-php-cli:${IMAGE_TAG}
	docker push ${REGISTRY}/freescout-php-cli:latest
	
push-tva:
	docker push ${REGISTRY}/tva:${IMAGE_TAG}

push-tva-production:
	docker push ${REGISTRY}/tva:${IMAGE_TAG}
	docker push ${REGISTRY}/tva:latest

deploy-develop:
	ssh -o StrictHostKeyChecking=no deploy@${HOST} -p ${PORT} 'rm -rf calendar_${BUILD_NUMBER} && mkdir calendar_${BUILD_NUMBER}'

	envsubst < docker-compose.develop.yml > docker-compose.develop.env.yml
	envsubst < ./api/docker/common/mailhog/release-config.json > smtp.json
	scp -o StrictHostKeyChecking=no -P ${PORT} docker-compose.develop.env.yml deploy@${HOST}:calendar_${BUILD_NUMBER}/docker-compose.yml
	scp -o StrictHostKeyChecking=no -P ${PORT} smtp.json deploy@${HOST}:calendar_${BUILD_NUMBER}/smtp.json
	rm -f docker-compose.develop.env.yml
	rm -f smtp.json

	ssh -o StrictHostKeyChecking=no deploy@${HOST} -p ${PORT} 'cd calendar_${BUILD_NUMBER} && docker stack deploy --compose-file docker-compose.yml calendar --with-registry-auth --prune'
	ssh -o StrictHostKeyChecking=no deploy@${HOST} -p ${PORT} 'rm -f calendar'
	ssh -o StrictHostKeyChecking=no deploy@${HOST} -p ${PORT} 'ln -sr calendar_${BUILD_NUMBER} calendar'

deploy-staging:
	ssh -o StrictHostKeyChecking=no deploy@${HOST} -p ${PORT} 'rm -rf calendar_${BUILD_NUMBER} && mkdir calendar_${BUILD_NUMBER}'

	envsubst < docker-compose.staging.yml > docker-compose.staging.env.yml
	envsubst < ./api/docker/common/mailhog/release-config.json > smtp.json
	scp -o StrictHostKeyChecking=no -P ${PORT} docker-compose.staging.env.yml deploy@${HOST}:calendar_${BUILD_NUMBER}/docker-compose.yml
	scp -o StrictHostKeyChecking=no -P ${PORT} smtp.json deploy@${HOST}:calendar_${BUILD_NUMBER}/smtp.json
	rm -f docker-compose.staging.env.yml
	rm -f smtp.json

	ssh -o StrictHostKeyChecking=no deploy@${HOST} -p ${PORT} 'cd calendar_${BUILD_NUMBER} && docker stack deploy --compose-file docker-compose.yml calendar --with-registry-auth --prune'
	ssh -o StrictHostKeyChecking=no deploy@${HOST} -p ${PORT} 'rm -f calendar'
	ssh -o StrictHostKeyChecking=no deploy@${HOST} -p ${PORT} 'ln -sr calendar_${BUILD_NUMBER} calendar'

deploy-production:
	ssh -o StrictHostKeyChecking=no deploy@${HOST} -p ${PORT} 'rm -rf calendar_${BUILD_NUMBER} && mkdir calendar_${BUILD_NUMBER}'

	envsubst < docker-compose.production.yml > docker-compose.production.env.yml
	scp -o StrictHostKeyChecking=no -P ${PORT} docker-compose.production.env.yml deploy@${HOST}:calendar_${BUILD_NUMBER}/docker-compose.yml
	rm -f docker-compose.production.env.yml

	ssh -o StrictHostKeyChecking=no deploy@${HOST} -p ${PORT} 'cd calendar_${BUILD_NUMBER} && docker stack deploy --compose-file docker-compose.yml calendar --with-registry-auth --prune'
	ssh -o StrictHostKeyChecking=no deploy@${HOST} -p ${PORT} 'rm -f calendar'
	ssh -o StrictHostKeyChecking=no deploy@${HOST} -p ${PORT} 'ln -sr calendar_${BUILD_NUMBER} calendar'

gitlab-e2e-tests:
	@echo "Starting e2e tests for: ${IMAGE_TAG}"
	docker-compose -f docker-compose.e2e.yml build e2e frontend 
	docker-compose -f docker-compose.e2e.yml up -d websocket frontend api api-php-fpm api-php-schedule api-php-queue api-migration redis minio mailhog api-postgres-e2e
	docker-compose -f docker-compose.e2e.yml up --exit-code-from e2e e2e  

deploy-clean:
	rm -f docker-compose.staging-env.yml

rollback:
	ssh -o StrictHostKeyChecking=no deploy@${HOST} -p ${PORT} 'cd calendar_${BUILD_NUMBER} && docker stack deploy --compose-file docker-compose.yml calendar --with-registry-auth --prune'


## Установка 

Развернуть проект

```bash
make init
```

Поднять проект

```bash
make up
```

Остановить проект

```bash
make down
```

Перезапустить проект

```bash
make restart
```

Обновить зависимости

```bash
make update
```

## PHP CLI

```bash
docker-compose run --rm api-php-cli <команда>
```

## Node.js CLI

```bash
docker-compose run --rm frontend-node-cli <команда>
```
## Обновление окружений

* Девелоперское окружение обновляется автоматически как только что-то смержится в ветку develop
* Стейджинг обновится автоматически как только что то будет смерженно в ветку master
* Продакшн обновится автоматически как только на ветке master выставить новый тэг

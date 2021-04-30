# Drugs annotations

## Запуск приложения

1. Из корневой папки проекта запустить команду

`docker-compose -f docker-compose.local.yml up -d --build`

2. Сходить в проект `avicenna-cadnidates-retrieval` и, на ветке candidates-database перейдя в папку `base_dumps/dump_13-02`, выполнить в ней команду

`psql -h localhost -U postgres -W drug-annotations < drug-annotations.dump`

//Это работает, пока дата последнего дампа 13.02. Если есть дампы позднее, то путь будет `base_dumps/dump_#dd-#mm`

3. Приложение будет запущено на `0.0.0.0:8080/drug-annotations`

4. К api бэкенда можно попасть по `0.0.0.0:8080/drug-annotations/api`


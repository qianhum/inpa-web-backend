# 📦 Is New Package Available backend

[![Node.js CI workflow status badge](https://github.com/qianhum/inpa-web-backend/workflows/node.js/badge.svg)](.github/workflows/node.js.yml) [![codecov](https://codecov.io/gh/qianhum/inpa-web-backend/branch/main/graph/badge.svg?token=P9W5UGFPG8)](https://codecov.io/gh/qianhum/inpa-web-backend)

This repository is part of [Is New Package Available](https://github.com/qianhum/inpa) and follows this [API Spec](https://github.com/qianhum/inpa/tree/main/api-spec).

You probably want to use the [frontend](https://github.com/qianhum/inpa-web-frontend), too.

## Getting started

```sh
docker run -dp 20000:20000 qianhum/inpa-web-backend
```

## Configuration

A [.env](https://github.com/motdotla/dotenv) file can be used to provide configuration.

```env
# path to SQLite database file INSIDE container
# default value: ./database.db
DATABASE_PATH=./tmp/database.db

# schedule task to check package update in crontab syntax
# default value: 0 * * * * (check update every hour at 0 minute, like 1:00, 2:00, etc)
CRON=1 * * * *

# default NPM registry URL
# Only used ONCE when starting with empty/non-exist database
# NPM registry URL can be edited after server starts
# default value: https://registry.npm.taobao.org
NPM_REGISTRY=https://registry.npm.taobao.org
```

e.g. If you want your [SQLite](https://sqlite.org) database file saved in your file system (instead of inside docker container):

```sh
mkdir tmp
echo "DATABASE_PATH=./tmp/database.db" > .env
docker run -dp 20000:20000 --mount type=bind,source="$(pwd)"/.env,target=/app/.env \
  --mount type=bind,source="$(pwd)"/tmp,target=/app/tmp qianhum/inpa-web-backend
```

## License

AGPL 3.0 or later

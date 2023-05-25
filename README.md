# VortexQL - SQL Migrations

VortexQL has been designed to be the perfect tool when it comes to SQL migrations.  

[![npm version](https://img.shields.io/npm/v/vortexql.svg)](https://www.npmjs.com/package/vortexql)
[![Downloads](https://img.shields.io/npm/dm/vortexql.svg)](https://www.npmjs.com/package/vortexql)
[![Lint](https://github.com/EdouardCourty/vortexql/actions/workflows/lint.yml/badge.svg)](https://github.com/EdouardCourty/vortexql/actions/workflows/lint.yml)

## Table of contents

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Usage](#usage)
4. [Contributing](#contributing)

### Installation

Prerequisites: Node >= 14.21.3

You can install VortexQL using this command:
```shell
npm install vortexql
```

After that, you can use the Command-Line Interface (CLI) using either
- `vortex`
- `./node_modules/bin/vortex`

Simply use `vortex` or `vortex help` to display the help message, it contains all the available commands.

You can generate a configuration file using the `vortex init` command.

### Configuration

After running `vortex init`, you'll see a new file in your root directory called `vortexconfig.json`.

This file will look like this:
```json
{
    "database": {
        "port": 3306,
        "host": "localhost",
        "user": "root",
        "password": "root",
        "database": "main_dev"
    },
    "migrationsLocation": "./migrations",
    "migrationsHistorySavingStrategy": "database"
}
```

It's pretty straightforward, the `database` key contains all the database connection information.

`migrationsLocation` is the directory that will contain the SQL migrations.  
`migrationsHistorySavingStrategy` can either be set to `database` or `filesystem`.

If you select the `filesystem` mode, VortexQL will create a .vortex folder at the root of your project to store locally the history of the migrations.
Do not delete this folder and its content, or your migration history will be reset and the next time you run the `vortex migrate` command, all your migrations will play, even if they were already played.

In another hand, if you select the `database` mode, VortexQL will create a new table in your database, named `migrations_history`.
This table will store the history of the migrations, do not delete it.

### Usage

5 commands are available with the VortexQL CLI.

- `init` will initialise VortexQL and create a default configuration file.
- `create` will create a new migration.
- `list` will display a list & status (played or not played) of all the existing migrations.
- `migrate` will execute all the non-played migrations.
- `revert <version>` will revert the database to the version passed as the first argument.

The revert command can be used with the `--no-interaction` to automatically reply with the default option when a confirmation is needed.

The `help` command is also available and will display the following message:
```text
Usage: vortex [options] [command]

An SQL migration tool for Node.JS

Options:
  -V, --version               output the version number
  -h, --help                  display help for command

Commands:
  migrate                     Migrates the database to the newest migration.
  create                      Creates a new migration
  revert [options] <version>  Reverts the database to the given migration ID's state
  list                        Shows a list of the migrations (played or not) and their description.
  init                        Creates a default configuration file.
  help [command]              display help for command
```

### Contributing

If you want to contribute to this project, feel free to submit a pull request on the GitHub repository.  
Also, if you need to get in touch with me, email me using the one provided in the `package.json` file.

&copy; Edouard Courty - 2023

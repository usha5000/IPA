module.exports = {
  //Connection to database
    development: {
      client: 'mysql',
      connection: {
        database: 'arbeitsjournal',
        user:     'root',
        password: 'root'
      },
      migrations: {
        tableName: 'knex_migrations'
      }
    },
  };
  
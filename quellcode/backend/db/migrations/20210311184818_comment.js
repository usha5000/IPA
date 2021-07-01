//Create table comment
exports.up = function(knex) {
    return knex.schema.createTable('comment', function(t) {
        t.increments('comment_id').unsigned().primary()
        t.date('date').notNull()
        t.text('comment').notNull()
        t.string('sAMAccountName')
        t.integer('fk_journal').unsigned().references('journal_id').inTable('journal').onDelete('CASCADE')
    })
  }
  
  exports.down = function(knex) {
    return knex.schema.dropTable('comment');
  }
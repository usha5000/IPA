//Create table journal
exports.up = function(knex) {
    return knex.schema.createTable('journal', function(t) {
        t.increments('journal_id').unsigned().primary()
        t.date('date').notNull()
        t.text('text')
        t.string('sAMAccountName')
        t.integer('fk_subject').unsigned().references('subject_id').inTable('subject').onDelete('CASCADE')
    })
  }
  
  exports.down = function(knex) {
    return knex.schema.dropTable('journal');
  }
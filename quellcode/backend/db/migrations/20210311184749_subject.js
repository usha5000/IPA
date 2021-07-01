//Create table subject
exports.up = function(knex) {
    return knex.schema.createTable('subject', function(t) {
        t.increments('subject_id').unsigned().primary()
        t.string('description')
    })
  }
  
  exports.down = function(knex) {
    return knex.schema.dropTable('subject');
  }
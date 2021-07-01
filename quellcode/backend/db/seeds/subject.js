
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('subject').del()
    .then(function () {
      // Inserts seed entries
      return knex('subject').insert([
        {description: 'M100'},
        {description: 'M101'},
        {description: 'M104'},
        {description: 'M105'},
        {description: 'M114'},
        {description: 'M117'},
        {description: 'M121'},
        {description: 'M122'},
        {description: 'M123'},
        {description: 'M127'},
        {description: 'M129'},
        {description: 'M133'},
        {description: 'M141'},
        {description: 'M143'},
        {description: 'M151'},
        {description: 'M158'},
        {description: 'M159'},
        {description: 'M182'},
        {description: 'M213'},
        {description: 'M214'},
        {description: 'M226A'},
        {description: 'M226B'},
        {description: 'M239'},
        {description: 'M300'},
        {description: 'M301'},
        {description: 'M302'},
        {description: 'M304'},
        {description: 'M305'},
        {description: 'M340'},
        {description: 'M403'},
        {description: 'M404'},
        {description: 'M431'},
        {description: 'M437'},
        {description: 'Werkstatt'},

      ]);
    });
};

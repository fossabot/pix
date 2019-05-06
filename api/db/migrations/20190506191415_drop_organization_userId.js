
exports.up = async function(knex) {

  // SQLite does not support dropping columns, and knex's emulation
  // breaks on foreign keys, so we do not try to drop
  // the column if it not there, and we have modified the table
  // creation in the original migration to not create the column.

  const info = await knex('organizations').columnInfo();
  if ('userId' in info) {
    await knex.schema.table('organizations', (table) => {
      table.dropColumn('userId');
    });
  }
};

exports.down = async function(knex) {
  await knex.schema.table('organizations', (table) => {
    table.integer('userId').unsigned().references('users.id').index();
  });
  await knex.raw(`UPDATE organizations SET "userId" =
                   (SELECT id FROM users WHERE "boardOrganizationId" = organizations.id LIMIT 1)
                  WHERE id IN (SELECT DISTINCT "boardOrganizationId" FROM users)`);
};

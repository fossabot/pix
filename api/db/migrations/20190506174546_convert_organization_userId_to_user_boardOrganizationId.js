
exports.up = async function(knex) {
  await knex.schema.table('users', (table) => {
    table.integer('boardOrganizationId').unsigned().references('organizations.id').index();
  });

  // SQLite does not support dropping columns, and knex's emulation
  // breaks on foreign keys, so we do not try to migrate
  // the column if it not there, and we have modified the table
  // creation in the original migration to not create the column.

  const info = await knex('organizations').columnInfo();
  if ('userId' in info) {
    await knex.raw(`UPDATE users SET "boardOrganizationId" =
                     (SELECT id FROM organizations WHERE "userId" = users.id LIMIT 1)
                    WHERE id IN (SELECT DISTINCT "userId" FROM organizations)`);
  }
};

exports.down = async function(knex) {
  await knex.schema.table('users', (table) => {
    table.dropColumn('boardOrganizationId');
  });
};

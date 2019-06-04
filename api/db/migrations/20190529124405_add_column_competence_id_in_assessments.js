const TABLE_NAME = 'assessments';

exports.up = async function(knex) {

  const info = await knex(TABLE_NAME).columnInfo();
  if (!info.competenceId) {
    return knex.schema.table(TABLE_NAME, (t) => t.string('competenceId').index())
      .then(() => knex.raw('update "assessments" ' +
        'set "competenceId" = (select "competenceId" from "competence-evaluations" where "competence-evaluations"."assessmentId" = assessments.id) ' +
        'where type="COMPETENCE_EVALUATION"')
      );
  }

  return knex.schema.table(TABLE_NAME, (t) => {
    t.string('competenceId').index();
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (t) => {
    t.dropColumn('competenceId');
  });
};

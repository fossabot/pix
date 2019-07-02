require('dotenv').config();
const { knex } = require('../lib/db/knex-database-connection');

const _ = require('lodash');
const certificationService = require('../lib/domain/services/certification-service');

async function recomputeCertificationCoursesV2WithoutScore() {
  const certificationCoursesIdToRecompute = await _getCertificationCoursesIdToRecompute();

  _.each(certificationCoursesIdToRecompute, (id) => certificationService.calculateCertificationResultByCertificationCourseId(id));

}

async function _getCertificationCoursesIdToRecompute() {

  return await knex.raw(`SELECT id FROM "certification-courses" WHERE isV2Certification = 1`);
}

recomputeCertificationCoursesV2WithoutScore();

const Assessment = require('../models/Assessment');
const CompetenceEvaluation = require('../models/CompetenceEvaluation');
const { NotFoundError } = require('../../domain/errors');

module.exports = async function startOrResumeCompetenceEvaluation({ competenceId, userId, competenceEvaluationRepository, assessmentRepository, competenceRepository }) {
  await _checkCompetenceExists(competenceId, competenceRepository);

  try {
    return await _resumeCompetenceEvaluation({ userId, competenceId, assessmentRepository, competenceEvaluationRepository });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return await _startCompetenceEvaluation({ userId, competenceId, assessmentRepository, competenceEvaluationRepository });
    } else {
      throw err;
    }
  }
};

function _checkCompetenceExists(competenceId, competenceRepository) {
  return competenceRepository.get(competenceId)
    .catch(() => {
      throw new NotFoundError('La compétence demandée n\'existe pas');
    });
}

async function _resumeCompetenceEvaluation({ userId, competenceId, assessmentRepository, competenceEvaluationRepository }) {
  const competenceEvaluation = await competenceEvaluationRepository.getByCompetenceIdAndUserId({ competenceId, userId });

  if (competenceEvaluation.status === CompetenceEvaluation.statuses.RESET) {
    return _restartCompetenceEvaluation({ userId, competenceEvaluation, assessmentRepository, competenceEvaluationRepository });
  }
  return {
    created: false,
    competenceEvaluation,
  };
}

async function _startCompetenceEvaluation({ userId, competenceId, assessmentRepository, competenceEvaluationRepository }) {
  const assessment = await _createAssessment({ userId, competenceId, assessmentRepository });
  const competenceEvaluation = await _createCompetenceEvaluation(competenceId, assessment.id, userId, competenceEvaluationRepository);
  return {
    created: true,
    competenceEvaluation,
  };
}

function _createAssessment({ userId, competenceId, assessmentRepository }) {
  const assessment = new Assessment({
    userId,
    competenceId,
    state: Assessment.states.STARTED,
    type: Assessment.types.COMPETENCE_EVALUATION,
    courseId: Assessment.courseIdMessage.COMPETENCE_EVALUATION,
  });
  return assessmentRepository.save(assessment);
}

function _createCompetenceEvaluation(competenceId, assessmentId, userId, competenceEvaluationRepository) {
  const competenceEvaluation = new CompetenceEvaluation({
    userId,
    assessmentId,
    competenceId,
    status: CompetenceEvaluation.statuses.STARTED,
  });
  return competenceEvaluationRepository.save(competenceEvaluation);
}

async function _restartCompetenceEvaluation({ userId, competenceEvaluation, assessmentRepository, competenceEvaluationRepository }) {
  const assessment = await _createAssessment({ userId, competenceId: competenceEvaluation.competenceId, assessmentRepository });
  await competenceEvaluationRepository.updateAssessmentId({ currentAssessmentId: competenceEvaluation.assessmentId, newAssessmentId: assessment.id });
  await competenceEvaluationRepository.updateStatusByUserIdAndCompetenceId({ userId, competenceId: competenceEvaluation.competenceId, status: CompetenceEvaluation.statuses.STARTED });
  const updatedCompetenceEvaluation = await competenceEvaluationRepository.getByCompetenceIdAndUserId({ userId, competenceId: competenceEvaluation.competenceId });

  return {
    created: true,
    competenceEvaluation: updatedCompetenceEvaluation,
  };
}

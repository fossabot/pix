const Progression = require('../../../lib/domain/models/Progression');

module.exports = async function getProgression(
  {
    progressionId,
    userId,
    assessmentRepository,
    competenceEvaluationRepository,
    smartPlacementAssessmentRepository,
    knowledgeElementRepository,
    skillRepository
  }) {

  const assessmentId = Progression.getAssessmentIdFromId(progressionId);

  const assessment = await assessmentRepository.getByAssessmentIdAndUserId(assessmentId, userId);
  let progression;

  if (assessment.isSmartPlacement()) {
    const smartPlacementAssessment = await smartPlacementAssessmentRepository.get(assessmentId);
    const knowledgeElementsBeforeSharedDate = await knowledgeElementRepository.findUniqByUserId({ userId, limitDate: smartPlacementAssessment.campaignParticipation.sharedAt });

    progression = new Progression({
      id: progressionId,
      targetedSkills: smartPlacementAssessment.targetProfile.skills,
      knowledgeElements: knowledgeElementsBeforeSharedDate,
      isProfileCompleted: smartPlacementAssessment.isCompleted
    });
  }

  if (assessment.isCompetenceEvaluation()) {
    const competenceEvaluation = await competenceEvaluationRepository.getByAssessmentId(assessmentId);
    const [targetedSkills, knowledgeElements] = await Promise.all([
      skillRepository.findByCompetenceId(competenceEvaluation.competenceId),
      knowledgeElementRepository.findUniqByUserId({ userId })]
    );

    progression = new Progression({
      id: progressionId,
      targetedSkills,
      knowledgeElements,
      isProfileCompleted: assessment.isCompleted()
    });
  }

  return progression;
};

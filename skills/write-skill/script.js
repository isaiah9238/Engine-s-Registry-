/**
 * In-process runtime handler for write-skill
 * Performs structural validation and synthesizes skill manifests.
 */
export async function execute(params) {
  const { skillName, title, mission, targetCapabilities, parametersList, examplesList } = params;

  const errors = [];
  if (!skillName || !/^[a-z0-9-_]+$/.test(skillName)) {
    errors.push('skillName must be valid kebab-case string.');
  }
  if (!title || typeof title !== 'string') {
    errors.push('title is required.');
  }
  if (!mission || typeof mission !== 'string') {
    errors.push('mission is required.');
  }
  if (!Array.isArray(targetCapabilities) || targetCapabilities.length === 0) {
    errors.push('targetCapabilities must be a non-empty array.');
  }
  if (!Array.isArray(parametersList) || parametersList.length === 0) {
    errors.push('parametersList must be a non-empty array.');
  }
  if (!Array.isArray(examplesList) || examplesList.length === 0) {
    errors.push('examplesList must be a non-empty array.');
  }

  if (errors.length > 0) {
    return {
      success: false,
      validationErrors: errors,
      timestamp: new Date().toISOString()
    };
  }

  const manifest = {
    skillId: skillName,
    name: skillName,
    title: title.trim(),
    mission: mission.trim(),
    targetCapabilities,
    parametersDeclared: parametersList.length,
    examplesDeclared: examplesList.length,
    validatedAt: new Date().toISOString(),
    status: 'draft'
  };

  return {
    success: true,
    manifest,
    message: `Skill ${skillName} validated and ready for ingestion pipeline.`
  };
}
import  artifact from '@actions/artifact';

export default async (definitions) => {
  const artifactClient = artifact.create();
  for (const definition of definitions) {
    await artifactClient.uploadArtifact(definition["artifact_name"], [definition["message_file"]], ".")
  }
}

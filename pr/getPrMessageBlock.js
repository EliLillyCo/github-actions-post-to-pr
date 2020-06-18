import fs from 'fs';

import { formatMarkdownBlock, applyMessageModifier } from '../utils/index.js';
import { readArchivedFile } from './index.js';

export default async (octokit, run, definition) => {

    var message = "";

    message += "# " + definition["title"] + "\n";

    for (const branch of definition["compare_branches"]) {
        message += `## Previous ${branch} branch:\n\n`;

        const data = await readArchivedFile(octokit, run, branch,
                                    definition.artifact_name,
                                    definition.message_file,
                                    definition.modifier)

        message += formatMarkdownBlock(
        data,
        definition.collapsible
        );
    }

    message += "\n## This change:\n\n";

    const data = fs.readFileSync(definition["message_file"], 'utf8')

    message += formatMarkdownBlock(
                applyMessageModifier(data, definition["modifier"]),
                definition.collapsible
                );

    return message
}

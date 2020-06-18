import assert from 'assert';

export default (definition) => {

assert(
    "message_file" in definition &&
    "title" in definition,
    "message_file & title must be included in the json definition"
)

if (!("artifact_name" in definition)) {
    definition["artifact_name"] = definition["title"]
    .replace(/[^0-9a-z ]/gi, "")
    .replace(/ /g, "-")
    .toLowerCase();
}

if (!("compare_branches" in definition)) {
    definition["compare_branches"] = ["master"];
}

if (!("modifier" in definition)) {
    definition["modifier"] = null;
}

if (!("collapsible" in definition)) {
  definition["collapsible"] = false;
}

return definition
}

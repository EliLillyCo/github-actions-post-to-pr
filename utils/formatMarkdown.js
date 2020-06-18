export default (text, collapsible) => {
  if (collapsible) {
    return ```
    <details>
    <summary>Expand</summary>
    <br>
    \`\`\`
    ${text}
    \`\`\`
    <br>
    </details>
    ```
  } else {
    return ```
    \`\`\`
    ${text}
    \`\`\`
    ```
  }
}

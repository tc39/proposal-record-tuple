// @ts-check

const IMPORT_HEADER = `import { Record, Tuple } from "@bloomberg/record-tuple-polyfill";

`;
const PLAYGROUND_LINK = "https://rickbutton.github.io/record-tuple-playground/";

/**
 * @param {string} snippet 
 * @returns {string}
 */
function createB64PlaygroundHash(snippet) {
    const fullSource = IMPORT_HEADER + snippet;
    const data = {
        content: fullSource,
        syntax: "hash",
    };
    return btoa(JSON.stringify(data));
}

/**
 * @param {string} openInPlaygroundLabel
 */
export function bootstrapCodeSnippets(openInPlaygroundLabel) {
    for(const preRoot of [...document.getElementsByTagName("pre")]) {
        const codeRoot = preRoot.getElementsByTagName("code")[0];
        const source = codeRoot.innerText;

        const linkToSource = document.createElement("button");
        linkToSource.textContent = openInPlaygroundLabel;
        linkToSource.style.margin = "1em";
        linkToSource.onclick = () => {
            const uri = `${PLAYGROUND_LINK}#${createB64PlaygroundHash(source)}`
            window.open(uri, '_blank');
        };
        preRoot.parentNode.insertBefore(linkToSource, preRoot.nextSibling);
    }
}
import * as Polyfill from "record-and-tuple-polyfill";
import * as Monaco from "monaco-editor";
import { LanguageConfigurationRegistry } from "monaco-editor/esm/vs/editor/common/modes/languageConfigurationRegistry";
import { conf, language } from "./patch-language";

const POLYFILL_DTS = `
interface RecordConstructor {
    /**
     * @param value The value which should be checked.
     * @return A Boolean indicating whether or not the given value is a Record.
     */
    isRecord(value: any): boolean;
}

interface TupleConstructor {
    /**
     * @param value The value which should be checked.
     * @return A Boolean indicating whether or not the given value is a Tuple.
     */
    isTuple(value: any): boolean;
}

/**
 * Provides functionality common to JavaScript records.
 */
export const Record: RecordConstructor;

/**
 * Provides functionality common to JavaScript tuples.
 */
export const Tuple: TupleConstructor;
`;


export function patch() {
    window.MonacoEnvironment = {
        getWorkerUrl: function (moduleId, label) {
            if (label === 'javascript' || label === 'typescript') {
                return './ts.worker.js';
            }
            return './editor.worker.js';
        }
    }

    Monaco.languages.typescript.javascriptDefaults
            .addExtraLib(POLYFILL_DTS, "file:///node_modules/@types/record-and-tuple-polyfill.d.ts");

    // dirty hack to not require bundling of the output of babel
    window.require = function (path) {
        if (path !== "record-and-tuple-polyfill") {
            throw new Error("unexpected");
        }
        return Polyfill;
    }
}

export function patchLanguage() {
    function doPatch() {
        console.log("patching javascript language support");
        Monaco.languages.setLanguageConfiguration("javascript", conf);
        Monaco.languages.setMonarchTokensProvider("javascript", language);
    }

    let patched = false;
    LanguageConfigurationRegistry.onDidChange(() => {
        if (!patched) {
            patched = true;
            doPatch();
        }
    });
}

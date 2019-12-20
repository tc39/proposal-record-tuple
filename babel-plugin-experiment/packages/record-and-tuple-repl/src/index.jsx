import { patch, patchLanguage } from "./patch";
patch();

import * as Babel from "@babel/core";
import RecordAndTuple from "babel-plugin-proposal-record-and-tuple";
import PresetEnv from "@babel/preset-env";

import React from "react";
import { render } from "react-dom";
import { Hook, Console, Decode } from "console-feed";
import MonacoEditor from "react-monaco-editor";

import Normalize from "./normalize.css";
import Skeleton from "./skeleton.css";

function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
        const callNow = immediate && !timeout;
        const later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

const CONSOLE_STYLES = {
    LOG_ICON_WIDTH: "0px",
    LOG_ICON_HEIGHT: "0px",
    BASE_FONT_SIZE: "18px",
    BASE_LINE_HEIGHT: "32px",
    ARROW_FONT_SIZE: "18px",
    TREENODE_FONT_SIZE: "18px",
    TREENODE_LINE_HEIGHT: "32px",
};

const DEFAULT_PREFIX = String.raw`import { Record, Tuple } from "record-and-tuple-polyfill";
const log = console.log;
`;

const DEFAULT_HASH = DEFAULT_PREFIX + String.raw`
const record = #{ prop: 1 };
const tuple = #[1, 2, 3];

log("isRecord", Record.isRecord(record));
log("isRecord", Record.isRecord({ prop: 1 }));

// Simple Equality
log("simple",
    #{ a: 1 } === #{ a:1 },
    #[1] === #[1]);

// Nested Equality
log("nested", #{ a: #{ b: 123 }} === #{ a: #{ b: 123 }});

// Order Independent
log("!order", #{ a: 1, b: 2 } === #{ b: 2, a: 1});

// -0, +0
log("-0 === +0", -0 === +0);
log("#[-0] === #[+0]", #[-0] === #[+0]);

// NaN
log("NaN === NaN", NaN === NaN);
log("#[NaN] === #[NaN]", #[NaN] === #[NaN]);
`;

const DEFAULT_BAR = DEFAULT_PREFIX + String.raw`
const record = {| prop: 1 |};
const tuple = [|1, 2, 3|];

log("isRecord", Record.isRecord(record));
log("isRecord", Record.isRecord({ prop: 1 }));

// Simple Equality
log("simple",
    {| a: 1 |} === {| a:1 |},
    [|1|] === [|1|]);

// Nested Equality
log("nested", {| a: {| b: 123 |}|} === {| a: {| b: 123 |}|});

// Order Independent
log("!order", {| a: 1, b: 2 |} === {| b: 2, a: 1|});

// -0, +0
log("-0 === +0", -0 === +0);
log("[|-0|] === [|+0|]", [|-0|] === [|+0|]);

// NaN
log("NaN === NaN", NaN === NaN);
log("[|NaN|] === [|NaN|]", [|NaN|] === [|NaN|]);
`;

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            output: "",
            syntax: "hash",
            equalityTransform: "strict",
            logs: [],
        };

        this.onEditorMounted = this.onEditorMounted.bind(this);
        this.onChange = debounce(this.onChange.bind(this), 500);
        this.onSyntaxChange = this.onSyntaxChange.bind(this);
        this.onEqualityTransformChange = this.onEqualityTransformChange.bind(this);
        this.update = this.update.bind(this);

        this.value = DEFAULT_HASH;
        this.outputEditor = React.createRef();

        const methods = ["log", "warn", "error", "info", "debug", "command", "result"];
        this.fakeConsole = methods.reduce((obj, m) => {
            obj[m] = () => undefined;
            return obj;
         }, {})

        this.inputModel = monaco.editor.createModel(this.value, "javascript", "file:///index.js");
        this.editorOptions = {
            fontSize: 18,
            theme: "vs-dark",
            automaticLayout: true,
            codeLens: false,
            minimap: {
                enabled: false,
            },
            model: this.inputModel,
            language: "rt",
        };

        this.outputOptions = Object.assign({}, this.editorOptions, {
            model: undefined,
            language: "javascript",
            readOnly: true,
        });
    }

    componentDidMount() {
        Hook(this.fakeConsole, log => {
            this.setState(({ logs }) => ({ logs: [...logs, Decode(log)] }));
        });
    }

    render() {


        return (
            <div className="container">
                <div className="topBar">
                    <div className="left">
                        <span>Syntax Type:</span>
                        <select onChange={this.onSyntaxChange} value={this.state.syntax}>
                            <option value="hash">hash</option>
                            <option value="bar">bar</option>
                        </select>
                        <span>Equality Transform:</span>
                        <select onChange={this.onEqualityTransformChange} value={this.state.equalityTransform}>
                            <option value="strict">Strict</option>
                            <option value="is">SameValue</option>
                        </select>
                    </div>
                    <div className="right">
                        <span>Record and Tuple Playground</span>
                        <span><a href="https://github.com/tc39/proposal-record-tuple">Proposal</a></span>
                        <span><a href="https://github.com/tc39/proposal-record-tuple/blob/rb/babel-experiment/babel-plugin-experiment/packages/record-and-tuple-polyfill/src/index.js">Polyfill</a></span>
                    </div>
                </div>
                <div className="inputWrapper">
                    <MonacoEditor
                        options={this.editorOptions}
                        value={this.value}
                        editorDidMount={this.onEditorMounted}
                        onChange={this.onChange} />
                </div>
                <div className="outputWrapper">
                    <div style={{ float: "right", width: "100%", height: "50%" }}>
                        <MonacoEditor
                            ref={this.outputEditor}
                            options={this.outputOptions}
                            value={this.state.output} />
                    </div>
                    <div style={{ borderTop: "2px solid #303030", float: "right", width: "100%", height: "50%" }}>
                        <Console
                            styles={CONSOLE_STYLES}
                            variant="dark"
                            filter={["log", "info", "error"]} logs={this.state.logs} />
                    </div>
                </div>
            </div>
        );
    }

    onEditorMounted(editor, monaco) {
        this.update();
        patchLanguage();
    }

    onChange(newValue) {
        this.value = newValue;
        this.update();
    }

    onSyntaxChange(event) {
        const syntax = event.target.value;

        this.value = syntax === "hash" ? DEFAULT_HASH : DEFAULT_BAR;
        this.setState({
            syntax,
            output: "",
        }, () => {
            this.update();
        });
    }

    onEqualityTransformChange(event) {
        const equalityTransform = event.target.value;
        this.setState({
            equalityTransform,
            output: "",
        }, () => {
            this.update();
        });
    }

    update() {
        this.transform(this.value, (err, result) => {
            const output = err ? err.toString() : result;
            this.setState({ output, logs: [], }, () => {
                this.outputEditor.current.editor.setSelection({
                    startLineNumber: 1,
                    startColumn: 1,
                    endLineNumber: 1,
                    endColumn: 1,
                });
                if (!err) {
                    this.run();
                }
            });
        });
    }

    transform(code, callback) {
        const pluginOptions = {
            equalityTransform: this.state.equalityTransform,
            syntaxType: this.state.syntax,
        };

        const options = {
            presets: [PresetEnv],
            plugins: [
                [RecordAndTuple, pluginOptions]
            ],
        };
        Babel.transform(code, options, function (err, result) {
            callback(err, result ? result.code : undefined);
        });
    }

    run() {
        try {
            const func = new Function("console", this.state.output);
            func(this.fakeConsole);
        } catch(e) {
            this.fakeConsole.error(e.message);
            this.fakeConsole.error(e);
        }
    }
}

render(
    <App />,
    document.getElementById("root"),
);

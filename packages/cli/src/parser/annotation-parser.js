"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTestFile = parseTestFile;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const parser_1 = require("@babel/parser");
const traverse_1 = __importDefault(require("@babel/traverse"));
const find_project_root_1 = require("../utils/find-project-root");
const normalize_path_1 = require("../utils/normalize-path");
async function parseTestFile(filePath) {
    const source = node_fs_1.default.readFileSync(filePath, "utf-8");
    const root = (0, find_project_root_1.findProjectRoot)();
    const relativeFilePath = (0, normalize_path_1.normalizePath)(node_path_1.default.relative(root, filePath));
    const ast = (0, parser_1.parse)(source, {
        sourceType: "module",
        plugins: ["typescript"],
    });
    const results = [];
    function matchesCurrentTest(args, title) {
        const testName = args[0];
        return testName?.type === "StringLiteral" && testName.value === title;
    }
    function getSuiteName(path) {
        let current = path.parentPath;
        while (current) {
            if (current.isCallExpression()) {
                const callee = current.node.callee;
                if (callee.type === "MemberExpression" &&
                    callee.object.type === "Identifier" &&
                    callee.object.name === "test" &&
                    callee.property.type === "Identifier" &&
                    callee.property.name === "describe") {
                    const arg = current.node.arguments[0];
                    if (arg?.type === "StringLiteral") {
                        return arg.value;
                    }
                }
            }
            current = current.parentPath;
        }
        return undefined;
    }
    (0, traverse_1.default)(ast, {
        CallExpression(path) {
            const callee = path.node.callee;
            if (callee.type !== "Identifier" ||
                (callee.name !== "test" && callee.name !== "it")) {
                return;
            }
            const titleArg = path.node.arguments[0];
            if (!titleArg || titleArg.type !== "StringLiteral") {
                return;
            }
            const title = titleArg.value;
            const suite = getSuiteName(path);
            const testCase = {
                uniqueId: `${relativeFilePath}:${title}`,
                title,
                filePath: relativeFilePath,
                suite,
                tags: [],
                customFields: {},
            };
            path.traverse({
                CallExpression(innerPath) {
                    const inner = innerPath.node.callee;
                    if (inner.type !== "MemberExpression" ||
                        inner.object.type !== "Identifier" ||
                        inner.object.name !== "assertive" ||
                        inner.property.type !== "Identifier") {
                        return;
                    }
                    const method = inner.property.name;
                    const args = innerPath.node.arguments;
                    if (!matchesCurrentTest(args, title)) {
                        return;
                    }
                    if (method === "id") {
                        const arg = args[1];
                        if (arg?.type === "StringLiteral") {
                            testCase.uniqueId = arg.value;
                        }
                    }
                    if (method === "owner") {
                        const arg = args[1];
                        if (arg?.type === "StringLiteral") {
                            testCase.owner = arg.value;
                        }
                    }
                    if (method === "priority") {
                        const arg = args[1];
                        if (arg?.type === "StringLiteral") {
                            testCase.priority = arg.value;
                        }
                    }
                    if (method === "type") {
                        const arg = args[1];
                        if (arg?.type === "StringLiteral") {
                            testCase.testType = arg.value;
                        }
                    }
                    if (method === "tags") {
                        testCase.tags = args
                            .slice(1)
                            .filter((arg) => arg.type === "StringLiteral")
                            .map((arg) => arg.value);
                    }
                    if (method === "field") {
                        const key = args[1];
                        const value = args[2];
                        if (key?.type === "StringLiteral" &&
                            value?.type === "StringLiteral") {
                            testCase.customFields[key.value] = value.value;
                        }
                    }
                },
            });
            if (testCase.uniqueId !== `${relativeFilePath}:${title}`) {
                results.push(testCase);
            }
        },
    });
    return results;
}

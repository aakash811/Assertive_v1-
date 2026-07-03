import fs from "node:fs";
import path from "node:path";
import { parse } from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
import type {
  ArgumentPlaceholder,
  CallExpression,
  Expression,
  Node,
  SpreadElement,
} from "@babel/types";
import { SyncTestCase } from "@assertive/shared";
import { findProjectRoot } from "../utils/find-project-root";
import { normalizePath } from "../utils/normalize-path";

export async function parseTestFile(filePath: string): Promise<SyncTestCase[]> {
  const source = fs.readFileSync(filePath, "utf-8");

  const root = findProjectRoot();

  const relativeFilePath = normalizePath(path.relative(root, filePath));

  const ast = parse(source, {
    sourceType: "module",

    plugins: ["typescript"],
  });

  const results: SyncTestCase[] = [];

  function matchesCurrentTest(
    args: readonly (Expression | SpreadElement | ArgumentPlaceholder)[],
    title: string,
  ): boolean {
    const testName = args[0];
    return testName?.type === "StringLiteral" && testName.value === title;
  }

  function getSuiteName(path: NodePath<CallExpression>): string | undefined {
    let current: NodePath<Node> | null = path.parentPath;

    while (current) {
      if (current.isCallExpression()) {
        const callee = current.node.callee;

        if (
          callee.type === "MemberExpression" &&
          callee.object.type === "Identifier" &&
          callee.object.name === "test" &&
          callee.property.type === "Identifier" &&
          callee.property.name === "describe"
        ) {
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

  traverse(ast, {
    CallExpression(path) {
      const callee = path.node.callee;

      if (
        callee.type !== "Identifier" ||
        (callee.name !== "test" && callee.name !== "it")
      ) {
        return;
      }

      const titleArg = path.node.arguments[0];

      if (!titleArg || titleArg.type !== "StringLiteral") {
        return;
      }

      const title = titleArg.value;

      const suite = getSuiteName(path);

      let externalId: string | undefined;

      const testCase: Omit<SyncTestCase, "externalId"> = {
        title,
        filePath: relativeFilePath,
        suite,
        tags: [],
        customFields: {},
      };

      path.traverse({
        CallExpression(innerPath) {
          const inner = innerPath.node.callee;

          if (
            inner.type !== "MemberExpression" ||
            inner.object.type !== "Identifier" ||
            inner.object.name !== "assertive" ||
            inner.property.type !== "Identifier"
          ) {
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
              externalId = arg.value;
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

            if (
              key?.type === "StringLiteral" &&
              value?.type === "StringLiteral"
            ) {
              testCase.customFields[key.value] = value.value;
            }
          }
        },
      });

      if (!externalId) {
        throw new Error(
          `Missing assertive.id() for test "${title}" in ${relativeFilePath}`,
        );
      }

      results.push({
        externalId,
        ...testCase,
      });
    },
  });

  return results;
}

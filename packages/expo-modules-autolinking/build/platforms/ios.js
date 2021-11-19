"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePackageListAsync = exports.resolveModuleAsync = void 0;
const fast_glob_1 = __importDefault(require("fast-glob"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
/**
 * Resolves module search result with additional details required for iOS platform.
 */
async function resolveModuleAsync(packageName, revision, options) {
    var _a, _b, _c, _d;
    const podspecFiles = await (0, fast_glob_1.default)('*/*.podspec', {
        cwd: revision.path,
        ignore: ['**/node_modules/**'],
    });
    if (!podspecFiles.length) {
        return null;
    }
    const pods = podspecFiles.map((podspecFile) => ({
        podName: path_1.default.basename(podspecFile, path_1.default.extname(podspecFile)),
        podspecDir: path_1.default.dirname(path_1.default.join(revision.path, podspecFile)),
    }));
    return {
        pods,
        flags: options.flags,
        modulesClassNames: (_b = (_a = revision.config) === null || _a === void 0 ? void 0 : _a.iosModulesClassNames()) !== null && _b !== void 0 ? _b : [],
        appDelegateSubscribers: (_d = (_c = revision.config) === null || _c === void 0 ? void 0 : _c.iosAppDelegateSubscribers()) !== null && _d !== void 0 ? _d : [],
    };
}
exports.resolveModuleAsync = resolveModuleAsync;
/**
 * Generates Swift file that contains all autolinked Swift packages.
 */
async function generatePackageListAsync(modules, targetPath) {
    const className = path_1.default.basename(targetPath, path_1.default.extname(targetPath));
    const generatedFileContent = await generatePackageListFileContentAsync(modules, className);
    await fs_extra_1.default.outputFile(targetPath, generatedFileContent);
}
exports.generatePackageListAsync = generatePackageListAsync;
/**
 * Generates the string to put into the generated package list.
 */
async function generatePackageListFileContentAsync(modules, className) {
    const modulesToImport = modules.filter((module) => module.modulesClassNames.length + module.appDelegateSubscribers.length > 0);
    const pods = modulesToImport.map((module) => module.pods.map((pod) => pod.podName));
    const modulesClassNames = [].concat(...modulesToImport.map((module) => module.modulesClassNames));
    const appDelegateSubscribers = [].concat(...modulesToImport.map((module) => module.appDelegateSubscribers));
    return `/**
 * Automatically generated by expo-modules-autolinking.
 *
 * This autogenerated class provides a list of classes of native Expo modules,
 * but only these that are written in Swift and use the new API for creating Expo modules.
 */

import ExpoModulesCore
${pods.map((podName) => `import ${podName}\n`).join('')}
@objc(${className})
public class ${className}: ModulesProvider {
  public override func getModuleClasses() -> [AnyModule.Type] {
    return ${formatArrayOfClassNames(modulesClassNames)}
  }

  public override func getAppDelegateSubscribers() -> [ExpoAppDelegateSubscriber.Type] {
    return ${formatArrayOfClassNames(appDelegateSubscribers)}
  }
}
`;
}
/**
 * Formats an array of class names to Swift's array containing these classes.
 */
function formatArrayOfClassNames(classNames) {
    const indent = '  ';
    return `[${classNames.map((className) => `\n${indent.repeat(3)}${className}.self`).join(',')}
${indent.repeat(2)}]`;
}
//# sourceMappingURL=ios.js.map
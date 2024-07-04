#! /usr/bin/env node
import { spawn } from "node:child_process";
const inquirer = require("inquirer");

const BottomBar = require("inquirer/lib/ui/bottom-bar.js");
const colors = require("colors");
const fse = require("fs-extra");

let b64 =
  "ICAgICAgICAgICAgICAgICAgICAgXyAgICAgX19fX18gX19fX19fX19fX18gICAgICAgICAgXyAgICAgICAgICAgXyAgIA0KICAgICAgICAgICAgICAgICAgICB8IHwgICB8XyAgIF8vICBfX198IF9fXyBcICAgICAgICAoXykgICAgICAgICB8IHwgIA0KICBfX18gXyBfXyBfX18gIF9fIF98IHxfIF9fX3wgfCBcIGAtLS58IHxfLyAvIF9fIF9fXyAgXyAgX19fICBfX198IHxfIA0KIC8gX198ICdfXy8gXyBcLyBfYCB8IF9fLyBfIFwgfCAgYC0tLiBcICBfXy8gJ19fLyBfIFx8IHwvIF8gXC8gX198IF9ffA0KfCAoX198IHwgfCAgX18vIChffCB8IHx8ICBfXy8gfCAvXF9fLyAvIHwgIHwgfCB8IChfKSB8IHwgIF9fLyAoX198IHxfIA0KIFxfX198X3wgIFxfX198XF9fLF98XF9fXF9fX1xfLyBcX19fXy9cX3wgIHxffCAgXF9fXy98IHxcX19ffFxfX198XF9ffA0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8vIHwgICAgICAgICAgICAgIA0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfF9fLyAgICAgICAgICAgICAgIA==";

console.log(colors.cyan(Buffer.from(b64, "base64").toString("ascii")));
console.log("\t\t\t\t\t\t\tv1.0.3");
console.log("\n A CLI tool to create a NodeJS project with TypeScript\n\n");

inquirer
  .prompt([
    {
      type: "input",
      name: "projectName",
      message: "🚀 Project name: ",
      waitUserInput: true,
      validate: function (value) {
        if (value.length) {
          return true;
        } else {
          return "Please enter a project name";
        }
      },
    },
    {
      type: "input",
      name: "projectAuthor",
      message: "👤 Author: ",
      waitUserInput: true,
      validate: function (value) {
        if (value.length) {
          return true;
        } else {
          return "Please enter a your name";
        }
      },
    },
    {
      type: "input",
      name: "projectDescription",
      message: "📝 Description: ",
      waitUserInput: true,
      optional: true,
    },
    {
      type: "list",
      name: "projectLicense",
      message: "📜 License: ",
      choices: ["MIT", "ISC", "Apache-2.0", "BSD-3-Clause", "BSD-2-Clause"],
      default: "MIT",
      validate: function (value) {
        if (value.length) {
          return true;
        } else {
          return "Please enter a license";
        }
      },
    },

    {
      type: "list",
      name: "entryPoint",
      message: "📄 Entry point: ",
      choices: ["index.ts", "main.ts"],
      default: "index.ts",
    },
    {
      type: "list",
      name: "distFolder",
      message: "📁 Dist folder: ",
      choices: ["dist", "build"],
      default: "dist",
    },
    {
      type: "confirm",
      name: "git",
      message: "📦 Initialize a git repository?",
      default: true,
    },
    {
      type: "checkbox",
      name: "Aditional",
      message: "📦 Aditional dependencies: ",
      choices: [
        {
          name: "Express",
          value: "express",
        },
        {
          name: "Mongoose",
          value: "mongoose",
        },
        {
          name: "Dotenv",
          value: "dotenv",
        },
        {
          name: "Lodash",
          value: "lodash",
        },
      ],
    },
    {
      type: "confirm",
      name: "expressTemplate",
      message: "🗃️ Create Express template ?",
      default: false,
      when: function (answers) {
        return answers.Aditional.includes("express");
      },
    },
  ])
  .then(async (answers) => {
    function createTSConfig() {
      return {
        compilerOptions: {
          target: "es2016",
          module: "commonjs",
          isolatedModules: false,
          forceConsistentCasingInFileNames: true,
          outDir: `./${distFolder}`,
          strict: false,
          skipLibCheck: true,
        },
      };
    }

    let { projectName, projectAuthor, projectDescription, projectLicense, distFolder, entryPoint, Aditional } = answers;

    //parse projectname to nodejs project name
    projectName = projectName.toLowerCase().replace(/ /g, "-");

    await fse.mkdirp(`./${projectName}/${distFolder}`);
    await fse.writeJson(`./${projectName}/tsconfig.json`, createTSConfig(), {
      spaces: "\t",
    });
    await fse.mkdirp(`./${projectName}/src`);
    await fse.writeFile(`./${projectName}/src/${entryPoint}`, "");
    await fse.appendFile(`./${projectName}/src/${entryPoint}`, `console.log("Hello, world!");`);

    if (answers.expressTemplate) {
      await fse.mkdirp(`./${projectName}/src/routes`);
      await fse.mkdirp(`./${projectName}/src/controllers`);
      await fse.mkdirp(`./${projectName}/src/models`);
      await fse.mkdirp(`./${projectName}/src/views`);
      console.log(colors.yellow("  \n📁 Folder structure created"));
    }

    function createPackageJson() {
      let dependencies = Aditional;
      let devDependencies = ["@types/node", "ts-node-dev", "typescript"];

      return {
        name: projectName,
        version: "1.0.0",
        author: projectAuthor,
        description: projectDescription,
        main: `./${distFolder}/${entryPoint}.js`,
        keywords: [],
        licence: projectLicense,
        scripts: {
          start: `ts-node ${entryPoint}`,
          build: `tsc --build`,
          dev: `ts-node-dev --clear --respawn --exit-child --watch --transpile-only src/${entryPoint}`,
        },
        dependencies: (() => {
          let obj = {};
          dependencies.forEach((dep) => {
            obj[dep] = "";
          });
          return obj;
        })(),
        devDependencies: (() => {
          let obj = {};
          devDependencies.forEach((dep) => {
            obj[dep] = "";
          });

          dependencies.forEach((dep) => {
            obj["@types/" + dep] = "";
          });
          return obj;
        })(),
      };
    }
    fse.writeJson(`./${projectName}/package.json`, createPackageJson(), {
      spaces: "\t",
    });

    let msg = "Creating TypeScript project...";

    let loader = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"].map((e) => e + " " + msg);
    let i = loader.length;
    const ui = new BottomBar({ bottomBar: loader[i % loader.length] });

    let interval = setInterval(() => {
      ui.updateBottomBar(loader[i++ % loader.length]);
    }, 60);

    var cmdify = require("cmdify");

    let spawASYNC = (command: string, args: Array<string>, options?: any) =>
      new Promise<void>((resolve, reject) => {
        spawn(command, args, { stdio: "pipe", ...options, shell: true }).on("close", (code) => {
          if (code === 0) {
            clearInterval(interval);
            resolve();
          } else {
            clearInterval(interval);
            reject();
          }
        });
      });

    process.chdir(projectName);

    await spawASYNC(cmdify("npm"), ["update", "--save"], {})
      .then(async () => {
        if (answers.git) {
          await spawASYNC("git", ["init"], { stdio: "pipe" })
            .then(() => {
              ui.updateBottomBar("");
              console.log(colors.green("📦 Git repository initialized"));
            })
            .catch(() => {
              console.log(colors.red("  \n\t📦 Git repository not initialized"));
            });
        }

        ui.updateBottomBar(colors.green("\n\t✨ Project created!"));
        ui.close();
      })
      .catch(() => {
        ui.updateBottomBar(colors.red("😒 Error creating project"));
        ui.close();
        process.exit(0);
      });

    console.log("\n\nUse the following commands to start your project:");
    console.log(colors.cyan(`\n\tcd ${projectName}`));
    console.log(colors.green(`\tnpm run dev\n\n`));
    process.exit(0);
  });

#!/usr/bin/env node

const doT = require('dot');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const minimist = require('minimist');
const process = require('process');

function generateComponent(args) {
  const {componentName, basePath, componentsFolder, requirePath, boilerPlate} = args;

  const settings = {
    componentName,
    requirePath,
  };

  function processTemplate(template, args) {
    const {componentName, basePath, componentsFolder, requirePath, boilerPlate} = args;
    const sourceName = path.join(boilerPlate, template);
    const targetName = path.join(
      basePath,
      componentsFolder,
      componentName,
      template.replace('$COMPONENT_NAME$', componentName).replace('.dot', '')
    );

    const source = fs.readFileSync(sourceName, 'UTF8');
    const compiled = doT.template(source);
    const processed = compiled(settings);

    fs.writeFileSync(targetName, processed);
  }

  function processTemplates(err, templates, args) {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    const componentFolderPath = path.join(basePath, componentsFolder, componentName);
    mkdirp(componentFolderPath, function (err) {
      if (err) {
        console.err(err);
        process.exit(1);
      }

      for (var i = 0; i < templates.length; i++) {
        processTemplate(templates[i], args);
      }
    });
  }

  fs.readdir(boilerPlate, function(err, templates) {
    processTemplates(err, templates, args);
  });
}

function parseArgs(args) {
  const parsed = minimist(args);
  return parsed;
}

function main(args) {
  const options = parseArgs(args);

  const COMPONENT_NAME = process.env.COMPONENT_NAME;
  const BASE_PATH = process.env.BASE_PATH;
  const COMPONENTS_FOLDER = process.env.COMPONENTS_FOLDER;
  const REQUIRE_PATH = process.env.REQUIRE_PATH;
  const BOILERPLATE = process.env.BOILERPLATE;

  const componentName = options.c || options.componentName || COMPONENT_NAME;
  const basePath = options.p || options.basePath || BASE_PATH;
  const componentsFolder = options.f || options.componentsFolder || COMPONENTS_FOLDER;
  const requirePath = options.r || options.requirePath || REQUIRE_PATH;
  const boilerPlate = options.b || options.boilerPlate || BOILERPLATE;

  if (!componentName || !basePath || !componentsFolder || !requirePath || !boilerPlate) {
    console.log('Missing arguments');
    if (!componentName) console.log('- componentName');
    if (!basePath) console.log('- basePath');
    if (!componentsFolder) console.log('- componentsFolder');
    if (!requirePath) console.log('- requirePath');
    if (!boilerPlate) console.log('- boilerPlate');
    process.exit(1);
  }

  const merged = {
    componentName,
    basePath,
    componentsFolder,
    requirePath,
    boilerPlate,
  };

  doT.templateSettings.strip = false;
  generateComponent(merged);
}

main(process.argv.slice(2));

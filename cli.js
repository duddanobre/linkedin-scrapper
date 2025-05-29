#!/usr/bin/env node
import inquirer from 'inquirer';
import chalk from 'chalk';
import { saveToJson, scrapeJobs } from './index.js';

const questions = [
  {
    type: 'input',
    name: 'keywords',
    message: '🔍 Keywords da vaga: \n\nExample: Software engineer Senior',
    default: 'UX UI designer junior'
  },
  {
    type: 'input',
    name: 'location',
    message: '🌎 Localização (ou "Remote"): \n\nExample: Brasil',
    default: 'Brazil'
  },
  {
    type: 'number',
    name: 'pages',
    message: '📄 Quantas páginas de resultados (1 pág = 25 vagas)?',
    default: 3,
    validate: n => (n > 0 ? true : 'Digite um número maior que 0')
  },
  {
    type: 'input',
    name: 'outputDir',
    message: '📂 Pasta onde salvar o arquivo: \n\nExample: /Users/user/Desktop',
    default: './results'
  }
];

(async () => {
  const answers = await inquirer.prompt(questions);

  console.log(chalk.cyan('\n⏳ Buscando vagas...'));
  const jobs = await scrapeJobs(
    answers.keywords,
    answers.location,
    answers.pages
  );

  if (jobs.length) {
    saveToJson(
      jobs,
      answers.keywords,
      answers.location,
      answers.outputDir
    );
  } else {
    console.log(chalk.yellow('⚠️  Nenhuma vaga encontrada.'));
  }
})();

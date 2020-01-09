#!/usr/bin/env node
const clear = require('clear');
const open = require('open');
const exec = require('child_process').exec;
const fs = require('fs');
const clui = require('clui');
const app = require('./srcFiles/app');
const spec = require('./srcFiles/app.spec');
const env = require('./srcFiles/env');
const ignore = require('./srcFiles/gitignore');
const proc = require('./srcFiles/Procfile');
const md = require('./srcFiles/README');
const server = require('./srcFiles/server');
const setup = require('./srcFiles/setup');
const name = process.argv[2];
const git = {
  url: ''
};
const fetch = require('node-fetch');
const readline = require('readline');
const Progress = clui.Progress;
let progressBar = new Progress(20);
const pack = `{\n  "name": "${name}",\n  "version": "1.0.0",\n  "description": "",\n  "main": "index.js",\n  "scripts": {\n    "test": "mocha --require test/setup.js",\n    "scripti": "npm i",\n    "commit": "git commit -m",\n    "precommit": "git add .",\n    "dev": "nodemon src/server.js",\n    "start": "node src/server.js",\n    "predeploy": "npm audit",\n    "deploy": "git push heroku master"\n  },\n  "keywords": [],\n  "author": "",\n  "license": "ISC",\n  "dependencies": {\n    "cors": "^2.8.5",\n    "dotenv": "^8.2.0",\n    "express": "^4.17.1",\n    "helmet": "^3.21.2",\n    "morgan": "^1.9.1"\n  },\n  "devDependencies": {\n    "chai": "^4.2.0",\n    "mocha": "^6.2.2",\n    "nodemon": "^2.0.2",\n    "supertest": "^4.0.2"\n  }\n}\n`;

const writeFile = (path, content) => {
    fs.writeFile(path, content, function (err) {
        if (err) throw err;
    }); 
}

const createDir = (dir) => {
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
}

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}


const runBashCommand = async (cmd) =>{
  cmd = `cd ${name} && ${cmd}`
  return new Promise((resolve, reject) => {
    exec(`${cmd}`, function(err,stdout, stderr){
      if(cmd.includes('curl')){
        const response = JSON.parse(stdout);
        console.log(response.url)
        git.url = response.url
        console.log(git.url)
      }
      const number = 1/stdout.split('\n').length
      stdout.split('\n').forEach((line, i) => {
        console.log(progressBar.update(number * (i + 1)) + line);
        sleep(333)
        clear()
      })
      if (!!err) {
        console.log('exec error: ' + err);
      }
      resolve()
    });
    
  });
}

const createApp = async (gitRepo) => {
  return new Promise((res, rej) => {
    createDir(name);
    createDir(`${name}/src`);
    createDir(`${name}/test`);
    writeFile(`./${name}/src/app.js`, app);
    writeFile(`./${name}/src/server.js`, server);
    writeFile(`./${name}/test/app.spec.js`, spec);
    writeFile(`./${name}/test/setup.js`, setup);
    writeFile(`./${name}/.env`, env);
    writeFile(`./${name}/.gitignore`, ignore);
    writeFile(`./${name}/package.json`, pack);
    writeFile(`./${name}/Procfile`, proc);
    writeFile(`./${name}/README.md`, md);
    const cmd =[`npm i`, `git init`, `npm run commit -- "initial commit"`]
    if(gitRepo){
      runBashCommand(cmd[0])
      .then(() => {
        runBashCommand(cmd[1])
      })
      .then(() => {
        runBashCommand(cmd[2])
      })
      .then(() => {
        runBashCommand('curl https://create-repo.herokuapp.com/backup')
        .then(() => {
          cmd.push(`git remote add origin ${git.url}`);
          cmd.push('git push -u origin master');
          runBashCommand(cmd[3]);
        }).then(() => runBashCommand(cmd[4]))
        .then(() => res())
      })
    } else {
      runBashCommand(cmd[0])
      .then(() => {
        runBashCommand(cmd[1])
      })
      .then(() => {
        runBashCommand(cmd[2])
      }).then(() => res())
    }
  })
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const credentials = [];

const question1 = () => {
  return new Promise((resolve, reject) => {
    rl.question('Do you want to create a GitHub repo and link it to the local repo?: ', (answer) => {
      credentials.push(answer);
      resolve();
    });
  });
}

const createGitRepo = () => {
    return new Promise((resolve, reject) => {
      open(`https://create-repo.herokuapp.com/?appName=${name}`);
      sleep(1000);
      fetch('https://create-repo.herokuapp.com/get-git-url').then(() => resolve())
    });
}

const main = async () => {
  await question1();
  if(credentials[0].includes('y')){
    await createGitRepo();
    rl.close();
    clear();
    createApp(true);
  } else {
    rl.close();
    clear()
    createApp(false);
  }  
}

if(!!name){
  main()
}else{
    console.log('Please provide a name for the app.\nUsage: npx josh-create-node-app YOUR-APP-NAME-HERE')
    process.exit(0);
}











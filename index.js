#!/usr/bin/env node

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
const gitUrl = [];
const readline = require('readline');
const Progress = clui.Progress;
const Spinner = clui.Spinner;
let progressBar = new Progress(20)
let countdown = new Spinner(progressBar.update(0.0), ['◜','◠','◝','◞','◡','◟']);
const pack = `{\n  "name": "${name}",\n  "version": "1.0.0",\n  "description": "",\n  "main": "index.js",\n  "scripts": {\n    "test": "mocha --require test/setup.js",\n    "dev": "nodemon src/server.js",\n    "start": "node src/server.js",\n    "predeploy": "npm audit",\n    "deploy": "git push heroku master"\n  },\n  "keywords": [],\n  "author": "",\n  "license": "ISC",\n  "dependencies": {\n    "cors": "^2.8.5",\n    "dotenv": "^8.2.0",\n    "express": "^4.17.1",\n    "helmet": "^3.21.2",\n    "morgan": "^1.9.1"\n  },\n  "devDependencies": {\n    "chai": "^4.2.0",\n    "mocha": "^6.2.2",\n    "nodemon": "^2.0.2",\n    "supertest": "^4.0.2"\n  }\n}\n`;

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


const runBashCommand = async (cmd) =>{
  cmd = `cd ${name} && ${cmd}`
  return new Promise((resolve, reject) => {
    exec(`${cmd}`, function(err,stdout, stderr){
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (!!err) {
        console.log('exec error: ' + err);
      }
      resolve()
    });
  });
}

const createApp = async (gitRepo) => { 
        countdown.start();
        createDir(name);
        countdown.message(progressBar.update(0.083))
        createDir(`${name}/src`);
        countdown.message(progressBar.update(0.166))
        createDir(`${name}/test`);
        countdown.message(progressBar.update(0.25))
        writeFile(`./${name}/src/app.js`, app);
        countdown.message(progressBar.update(0.333))
        writeFile(`./${name}/src/server.js`, server);
        countdown.message(progressBar.update(0.416))
        writeFile(`./${name}/test/app.spec.js`, spec);
        countdown.message(progressBar.update(0.50))
        writeFile(`./${name}/test/setup.js`, setup);
        countdown.message(progressBar.update(0.583))
        writeFile(`./${name}/.env`, env);
        countdown.message(progressBar.update(0.666))
        writeFile(`./${name}/.gitignore`, ignore);
        countdown.message(progressBar.update(0.75))
        writeFile(`./${name}/package.json`, pack);
        countdown.message(progressBar.update(0.833))
        writeFile(`./${name}/Procfile`, proc);
        countdown.message(progressBar.update(0.916))
        writeFile(`./${name}/README.md`, md);
        countdown.message(progressBar.update(0.100))
        countdown.message('All files and folders created initializing repostories and installing dependancies')
        const cmd =[`npm i`, `git init`, `git add .`, `git commit -m "initial commit"`]
        runBashCommand(cmd[0])
        if(gitRepo){
          cmd.push(`git remote add origin ${gitUrl[0]}`);
          cmd.push('git push -u origin master')
          runBashCommand(cmd[1])
          .then(() => runBashCommand(cmd[2]))
          .then(() => runBashCommand(cmd[3]))
          .then(() => runBashCommand(cmd[4]))
          .then(() => runBashCommand(cmd[5]))
        } else {
          runBashCommand(cmd[1])
          .then(() => runBashCommand(cmd[2]))
          .then(() => runBashCommand(cmd[3]))
        }
        
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl._writeToOutput = (stringToWrite) => {
    if (rl.stdoutMuted && !stringToWrite.includes('What is your GitHub'))
      rl.output.write("*");
    else
      rl.output.write(stringToWrite);
};

const credentials = [];

const question1 = () => {
  return new Promise((resolve, reject) => {
    rl.question('Do you have a GitHub personal access token: ', (answer) => {
      credentials.push(answer);
      resolve();
    });
  });
}


const question2 = () => {
  return new Promise((resolve, reject) => {
    rl.question('What is your GitHub access token?: ', (answer) => {
      credentials.push(answer);
      resolve();
    });
  });
}

const question3 = () => {
  credentials.push("");
  return new Promise((resolve, reject) => {
    rl.question('To initialize a Github repository you will need a personal access token. Do you wish to proceed without initializing a GitHub repository?: ', (answer) => {
      credentials.push(answer);
      resolve();
    });
  });
}

const createGitRepo = () => {
    return new Promise((res, rej) => {
        exec(`curl -H "Authorization: token ${credentials[1]}" --data '{"name":"${name}"}' https://api.github.com/user/repos`, (err, stdout, stderr) => {
            if (err) {
                //some err occurred
                console.error(err);
            } else {
                // the *entire* stdout and stderr (buffered)
                const response = JSON.parse(stdout);
                gitUrl.push(response.clone_url);
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);

            }
            res();
        });
    })
}

const main = async () => {
  await question1();
  if(credentials[0].includes('y')){
    rl.stdoutMuted =true;
    await question2();
    await createGitRepo();
    createApp(true);
    countdown.stop();
  } else {
    await question3();
    if(credentials[2].includes('y')){
        createApp(false);
        countdown.stop();
    }else{
        console.log('Please try again with a personal access token.')
    }
  }
  rl.close()
}
if(!!name){
    main()
}else{
    console.log('Please provide a name for the app.\n Usage: npx josh-create-node-app YOUR-APP-NAME-HERE')
}












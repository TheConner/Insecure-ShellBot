const { resolve } = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec)
const execOpts = {
    timeout: 30000
}

// The most important part: the MEMES
const rejectionGifs = [
    "https://tenor.com/view/nooo-no-nope-no-way-screaming-gif-15477187", // M. Scott no
    "https://tenor.com/view/stop-it-get-some-help-gif-15058124", // Stop get some help
    "https://tenor.com/view/lord-help-me-judge-judy-facepalm-gif-12371798", // judge judy
    "https://tenor.com/view/kermit-muppets-slow-turn-shaking-my-head-shakes-head-gif-13105902", // kermit
    "https://tenor.com/view/rick-roll-deal-with-it-rick-astley-never-gonna-give-you-up-gif-13662080", // rick
    "https://tenor.com/view/touch-canttouchthis-ucanttouchthis-mchammer-musicvideo-gif-4723913", // can't touch this
    "https://tenor.com/view/steveharvey-scared-nope-gif-4834817" // steve harvey
]

function randElem(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

module.exports.startDocker = function (containerName) {
    return new Promise((resolve, reject) => {
        // Vulnerability we are going to showcase: the volume mount to docker
        const runDockerContainer = `docker run -t -v /var/run/docker.sock:/var/lol/docker.sock -d "${containerName}"`
        exec(runDockerContainer, (err,stdout, stderr) => {
            console.log("INIT: Docker run command completed with output: " + stdout)
            stdout = stdout.replace(/(\r\n|\n|\r)/gm, "");
            resolve(stdout)
        })
        .catch((err) => reject(err))
    });
}

module.exports.runShellPromise = function (containerID, cmd) {

    // Make sure the command isn't nasty 
    // TODO: make blacklist?
    if ((cmd.includes('rm') && (cmd.includes('--no-preserve-root')))) {
        return new Promise((resolve,reject) => {
            reject({
                "text": randElem(rejectionGifs)
            })
        })
    }

    // Make the CMD base64
    cmd = Buffer.from(cmd).toString('base64')

    // We can build the payload around the encoded CMD
    cmd = `echo ${cmd} | base64 -d | bash`
    console.log(cmd)

    return new Promise((resolve,reject) => {
        if (cmd.length === 0) {
            reject()
        } else {
            const dockerCommand = `docker exec -t ${containerID} sh -c "${cmd}"`
            console.log("Running " + dockerCommand)
            const startTime = Date.now()
            exec(dockerCommand, execOpts)
            .then((result) => {
                console.log(result)
                resolve(result.stdout)
            })
            .catch((err) => {
                console.log("ERROR THROWN! " + err)
                const endTime = Date.now()

                if (execOpts.timeout <= endTime - startTime) {
                    // Timeout rejection
                    reject({
                        "reaction": "⏰"
                    })
                } else reject()
            })
        }
    })
}

module.exports.registerExitHandlers = function(containerID) {
    // Register exit handlers 
    function exitHandler(options, exitCode) {
        console.log("Exit handler: clean up docker container...")
        const dockerCleanContainer = `docker stop ${containerID}`
        console.log("Running " + dockerCleanContainer)
        exec(dockerCleanContainer)
        .then((err, stdout,stderr) => {
            process.exit()
        })
    }

    //do something when app is closing
    process.on('exit', exitHandler.bind(null,{cleanup:true}));

    //catches ctrl+c event
    process.on('SIGINT', exitHandler.bind(null, {exit:true}));

    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
    process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

    //catches uncaught exceptions
    process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
}
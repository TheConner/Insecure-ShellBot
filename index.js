require('dotenv').config();
const Discord = require('discord.js');
const MessageFactory = require('./MessageFactory')

const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;

// Our shell connector
const runner = require('./ShellConnector')

runner.startDocker('discordshellbot:latest')
.then((containerID) => {
    runner.registerExitHandlers(containerID)
    bot.login(TOKEN);
    bot.on('ready', () => {
        console.info(`Logged in as ${bot.user.tag}!`);
    });
    
    bot.on('message', msg => {
        if (msg.author.bot) return;

        runner.runShellPromise(containerID, msg.content)
        .then((data) => {
            if (data == null || data.length === 0) {
                // If the length is zero, and we no error was thrown, react with a check mark
                msg.react("✅")
            } else {
                const generatedMessage = MessageFactory.WriteNormalMessage(data)
                if (Array.isArray(generatedMessage)) {
                    for (let m of generatedMessage) msg.reply(m)
                } else {
                    msg.reply(generatedMessage)
                }
            }
        }).catch((err) => {
            if (typeof err === 'string') {
                msg.reply(err)
            } else if (typeof err === 'object') {
                if ('reaction' in err)
                    msg.react(err['reaction'])
                if ('text' in err)
                    msg.reply(err['text'])
            } else {
                msg.react("❌")
            }
        })
    });
});
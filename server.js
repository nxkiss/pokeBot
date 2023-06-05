// const rlp = require("roblox-long-polling")
const { Client, GatewayIntentBits, ActivityType, escapeMarkdown, Partials, EmbedBuilder, Events, AttachmentBuilder } = require('discord.js');
const converter = require('./modules/converter')
const fire = require('./modules/firebase')
const buffer = require('./modules/bitbuffer')
const path = require('path')
const fs = require('fs')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [
    Partials.Reaction,
    Partials.Message,
    Partials.Channel
  ]
});

client.on("ready", () => {
  client.user.setPresence({
    activities: [{ name: `pokemon stuff`, type: ActivityType.Playing }],
    status: 'dnd',
  });
  console.log(`Logged in as ${client.user.username}`)
})

// const poll = new rlp({
//   port: 5000,
// });

async function callbacksend(uid, chid, gid, lol, er, res) {
  console.log('sending callback')
  const guild = await client.guilds.fetch(gid)
  const channel = await guild.channels.fetch(chid)


  if(lol === 1){
    return channel.send({
      files: [res]
  });
  }
  if (!channel) {
    console.log('channel not found')
  }
 if(!er){
  channel.send(`<@${uid}> Callback from Game [${lol.toString()}] -> 0x00 ! Added data successfully`)
 }else{
  channel.send(`<@${uid}> [${lol.toString()}] || Error adding data.`)
 }
}

// poll.on('connection', (connection) => {
//   console.log('New connection with id: ', connection.id);

//   connection.on('callback', async (data) => {
//     console.log("callback: ", data)
//     const call = JSON.parse(data)

//     if (call.status == 1) {
//       callbacksend(call.id, call.chid, call.gid, call.gameID, false)
//     }else{
//       callbacksend(call.id, call.chid, call.gid, call.gameID, true)
//     }
  
//   })
//   connection.on('returnData', async (data) => {
//     const call = JSON.parse(data)
//     const c = call.call
//     const url = await converter.pop(call)
//     callbacksend(c.id, c.chid, c.gid, 1, true, url)
//     console.log(call)
//   })

//   connection.on('disconnect', () => { 
//     console.log('Disconnection ', connection.id)
//   })

// })


client.on('messageCreate', async message => {
  if (message.content.startsWith('.spawn')) {
    if (message.author.id !== '612950031842017291' && !message.author.bot) {
      return message.reply('You are not authorized to execute this command.');
    }

    const args = message.content.slice(7).split(' ');
    if (args.length < 5) {
      return message.reply('Invalid command usage. Please provide all required arguments: .spawn <PlayerName> <pokemonName> <ShinyState[1=shiny, none]> <level> <ivs[array]>');
    }

    const playerName = args[0];
    const pokemonName = args[1];
    const shinyState = args[2] === '1' ? true : false;
    const level = parseInt(args[3]);
    const ivs = args.slice(4).map(iv => {
      const parsedIv = parseInt(iv);
      if (isNaN(parsedIv) || parsedIv < 1 || parsedIv > 31) {
        return
      }
      return parsedIv;
    });

    if (ivs.length !== 6) {
      return message.reply('Invalid IVs array length. Please provide 6 IV values.');
    }

    console.log(playerName, pokemonName, shinyState, level, ivs)
    poll.broadcast('data', {playerName: playerName, pokemonName: pokemonName, shinyState: shinyState,level: level, ivs: ivs})
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Spawn Command Executed')
      .addFields(
        { name: 'Player Name', value: playerName },
        { name: 'Pokemon Name', value: pokemonName },
        { name: 'Shiny State', value: shinyState.toString() },
        { name: 'Level', value: level.toString() },
        { name: 'IVs', value: ivs.join(', ') },
      )
      .setTimestamp();
  }else if (message.content.startsWith('.data')) {
    if (message.author.id !== '612950031842017291' && !message.author.bot) {
      return message.reply('You are not authorized to execute this command.');
    }
    const args = message.content.slice('.data'.length).trim().split(/ +/g);
    const id = args[0];
    var v = args[1];
    if(!v){
      v = 0
    }
    console.log(id, v)
    
    fire.getdata(id, v).then(async (d) => {
      const b = await buffer.deserialize(d)
      const a = await converter.pop(b)
      const saveTo = path.join('.', a)
      message.channel.send({
        files: [saveTo]
      });
      setTimeout(() => {
        fs.unlink(saveTo, (err) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log(`${saveTo} has been deleted`);
        });
      }, 4000);
  }).catch((e) => {
      console.log(e)
  })
  }else if (message.content.startsWith('.test')) {
    if (message.author.id !== '612950031842017291' && !message.author.bot) {
      return message.reply('You are not authorized to execute this command.');
    }
    const paths = './result_1682099329762.png'
    message.channel.send({
      files: ['./result_1682099329762.png']
  });
  }
});




client.login('OTA2OTc0MTIxNzEwMjIzNDIy.GV6juJ.3PgaZ65DXi30ssgORAoHvrxM-G_Rr4ZJS4tDsc')

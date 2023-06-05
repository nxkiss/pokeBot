const fire = require('./firebase')
const buffer = require('./bitbuffer')

async function a (){
    fire.getdata(4034108725).then(async (d) => {
        console.log(d)
        const b = await buffer.deserialize(d)
        console.log(b)
    }).catch((e) => {
        console.log(e)
    })
}
a()
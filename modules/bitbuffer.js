const NumberToBase64 = {};
const Base64ToNumber = {};
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

for (let i = 0; i < chars.length; i++) {
  const ch = chars.charAt(i);
  NumberToBase64[i] = ch;
  Base64ToNumber[ch] = i;
}
const PowerOfTwo = [];
for (let i = 0; i <= 64; i++) {
    PowerOfTwo[i] = 2 ** i;
}

function BitBuffer() {
    let mBitPtr = 0;
    let mBitBuffer = [];

    function resetPtr() {
        mBitPtr = 0;
    }

    function reset() {
        mBitBuffer = [];
        mBitPtr = 0;
    }

    function eof() {
        return mBitPtr >= mBitBuffer.length;
    }

    let mDebug = false;

    function setDebug(state) {
        mDebug = state;
    }

    function fromBase64(str) {
        reset();
        for (let i = 0; i < str.length; i++) {
            let ch = Base64ToNumber[str.charAt(i)];
            if (ch === undefined)
                throw new Error("Bad character: 0x" + str.charCodeAt(i).toString(16));
                for (let i = 1; i <= 6; i++) {
                  mBitPtr++;
                  mBitBuffer[mBitPtr] = ch % 2;
                  ch = Math.floor(ch / 2);
                }
            if (ch !== 0)
                throw new Error(
                    "Character value 0x" +
                    Base64ToNumber[str.charAt(i)].toString(16) +
                    " too large"
                );
        }
        resetPtr();
    }

    function readBit() {
        mBitPtr++;
        return mBitBuffer[mBitPtr];
    }

    function readUnsigned(w, printoff) {
        let value = 0;
        for (let i = 0; i < w; i++) {
            const r = readBit();
            value += r * PowerOfTwo[i];
        }
        if (mDebug && !printoff) {
            console.log("ReadUnsigned[" + w + "]:", value);
        }
        return value;
    }

    function readBool() {
        const v = readUnsigned(1, true) === 1;
        if (mDebug) {
            console.log("ReadBool[1]:", v ? "1" : "0");
        }
        return v;
    }

    return {
        resetPtr,
        reset,
        eof,
        setDebug,
        fromBase64,
        readUnsigned,
        readBool,
    };
}



exports.deserialize = async (str) => {
    let res = [];
    let playerData = {}; // replace with actual player data object
    PlayerData = { pc: playerData };
    let pokemonArray;
    const buffer = BitBuffer();
  
    let meta, pokemonArrayStr;
    [meta, pokemonArrayStr] = str.split(";");

  
    buffer.fromBase64(meta);
    const version = buffer.readUnsigned(6);
    console.log(version)
  
    if (version >= 2) {
      if (buffer.readBool()) {
        playerData.maxBoxes = 50;
      }
    }
    playerData.currentBox = buffer.readUnsigned(version >= 3 ? 6 : 5);
    if (version >= 6) {
      if (buffer.readBool()) {
        for (let i = 1; i <= buffer.readUnsigned(6); i++) {
          if (buffer.readBool()) {
            playerData.boxNames[i] = buffer.readString();
          }
        }
      }
      if (buffer.readBool()) {
        for (let i = 1; i <= buffer.readUnsigned(6); i++) {
          if (buffer.readBool()) {
            playerData.boxWallpapers[i] = buffer.readUnsigned(5);
          }
        }
      }
    }
    let bitCount = 10;
    if (version >= 1) {
      bitCount = 11;
    }
    const nStoredPokemon = buffer.readUnsigned(bitCount);
    for (let i = 1; i <= nStoredPokemon; i++) {
      let icon = 1;
      if (version >= 7) {
        icon = buffer.readUnsigned(12);
      } else {
        icon = buffer.readUnsigned(bitCount);
      }
      if (version < 5 && icon > 1000) {
        icon = icon + 450;
      }
      const shiny = buffer.readBool();
      const boxNum = buffer.readUnsigned(6);
      const position = buffer.readUnsigned(5);
      console.log(pokemonArrayStr)
      [pokemonArray, pokemonArrayStr] = pokemonArrayStr.split(/,(.+)/);
      if (!pokemonArray) {
        const nMissing = nStoredPokemon - i + 1;
        if (version >= 4 || nMissing > 1) {
          throw new Error(
            "error (pc::ds): instance count mismatch; missing " + nMissing
          );
        }
        break;
      }
      res.push({ icon: icon, shiny: shiny, s: pokemonArray });
    }
    return res;
}


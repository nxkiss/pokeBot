const { createCanvas, loadImage, Image } = require("canvas");
const sharp = require('sharp');
const fs = require('fs')
const path = require('path')
const data = {
    pt: [
        {
            shiny: false,
            icon: 912,
            s: 'KbZCEOEAw48qcQQjEBADAFgOAQAmAsFYIga6cO4BA'
        },
        {   shiny: false,
            icon: 6,
            s: 'KbZCEOEAw48qcQQjEBADAFgOAQAmAsFYIga6cO4BA'
        },
        {
            shiny: true,
            icon: 1054,
            s: 'KzABEQ9jlhdzTzEj453DgHAPAe+9A0tpcRFjcC105cwDA'
        },
        {
            shiny: false,
            icon: 1054,
            s: 'KzeAEASoXt2+LzES95nBwPAWAf+/EMLohRehLIK1gMAAA'
        },
        {
            shiny: true,
            icon: 30,
            s: 'KzABEASonFdx1rEj85/DwHgPAf+/AsKocRFjcC105cwDA'
        }
    ],
    dt: ''
};

function getSheetAndCoords(icon, shiny, gen8) {
    let sheets = {
        gen8Style: [
            7992781492,
            7992783128,
            7992784871,
            7992785821,
            7992787015,
            7992788799,
            7992790519,
            7992792128,
            8815287546,
        ],
        gen7Style: [6282101983, 6282106057, 6416093221, 6282109375],
        egg: [5778910603],
        custom: {
            sheet: [7992848505],
            isShiny: [4, 5, 6, 32],
            isNormal: [1, 2, 3, 7, 33],
            doSparkle: [10, 32, 33],
            rainbowTex: [7243677434],
        },
        ogSheets: [281525968, 281526001, 5806699909, 5806706697],
    };

    let iconsX = 14;
    let iconsY = 18;
    let nIconsX = 7;
    let iconsPerSheet = nIconsX * iconsY;
    let eggThreshold = 1450;
    let customThreshold = 2000;
    let rbxasset = 6000000000;

    let isGen8Style = gen8;
    let uptoIcon = iconsPerSheet * sheets.gen8Style.length;

    if (icon == 9999) {
        icon = 7277432560;
    }

    if (icon == 6942) {
        icon = 7277432560;
    }

    let customSheet = false;
    let doSparkle = false;

    if (icon >= customThreshold && icon < rbxasset) {
        customSheet = true;
        icon -= 2000;
    }

    let sheetNumber =
        icon < uptoIcon ? Math.floor(icon / iconsPerSheet) + 1 : 1;
    let iconIdOnSheet = icon - (sheetNumber - 1) * iconsPerSheet;

    let row = Math.floor(iconIdOnSheet / nIconsX);
    let col = iconIdOnSheet % nIconsX;

    if (col == 0 && row == Math.floor((iconIdOnSheet - 1) / nIconsX)) {
        console.warn(
            `Skipped Icon|${icon}|${iconIdOnSheet}|${col}|${row}|${Math.floor(
                (iconIdOnSheet + 1) / nIconsX
            )}`
        );
        col = 7;
    }

    let sheetId;
    if (customSheet) {
        sheetId = sheets.custom.sheet[0];
    } else if (shiny && isGen8Style) {
        sheetId = sheets.gen8Style[sheetNumber - 1];
    } else if (!shiny && isGen8Style) {
        sheetId = sheets.gen8Style[sheetNumber - 1];
    } else if (!shiny && !isGen8Style) {
        sheetId = sheets.gen7Style[sheetNumber - 1];
    } else {
        sheetId = sheets.egg[0];
    }

    return {
        row: row,
        col: col,
        sheetId: sheetId,
    };
}


const saved = []
async function edit(col, row, sheetId, shiny, i) {

    const spriteWidth = 68;
    const spriteHeight = 56;
    const spriteX = (spriteWidth * 2) * col + (shiny ? spriteWidth : 0);
    const spriteY = spriteHeight * row;
    const spriteSize = { width: spriteWidth, height: spriteHeight };

    const sheetsFolderPath = path.join(process.cwd(), 'modules', 'sheets');
    const inputPath = path.join(sheetsFolderPath, `${sheetId}.png`);
    const inputImage = await loadImage(inputPath);

    const canvas = createCanvas(spriteWidth, spriteHeight);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(inputImage, spriteX, spriteY, spriteWidth, spriteHeight, 0, 0, spriteWidth, spriteHeight);

    const path2 = path.join(process.cwd(), 'modules', 'out');
    const outputPath = path.join(path2, `${sheetId}_${i}_col_row_${Date.now()}.png`);
    sharp(canvas.toBuffer())
        .png()
        .toFile(outputPath);
    saved.push(outputPath)
}

async function list(saved) {
    const sheetsFolderPath = path.join(process.cwd(), 'modules', 'sheets');
    const inputPath = path.join(sheetsFolderPath, `7430809942.png`);
    const BG_IMAGE_PATH = inputPath;
    const ICON_WIDTH = 32;
    const ICON_HEIGHT = 32;
    const ICON_SPACING = 2;
    const ICON_SCALE = 3;
  
    const bgImage = await loadImage(BG_IMAGE_PATH);
    const canvas = createCanvas(bgImage.width, bgImage.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    let x = ICON_SPACING;
    let y = ICON_SPACING;
    for (const filename of saved) {
      if (fs.existsSync(filename)) { // check if file exists
        const iconImage = await loadImage(filename);
  
        ctx.drawImage(
          iconImage,
          0,
          0,
          iconImage.width,
          iconImage.height,
          x,
          y,
          ICON_WIDTH * ICON_SCALE,
          ICON_HEIGHT * ICON_SCALE
        );
  
        x += ICON_WIDTH * ICON_SCALE + ICON_SPACING;
        if (x + ICON_WIDTH * ICON_SCALE + ICON_SPACING > canvas.width) {
          x = ICON_SPACING;
          y += ICON_HEIGHT * ICON_SCALE + ICON_SPACING;
        }
      }
    }
    const ss = path.join(process.cwd(), 'modules', 'out');
    const saveTo = path.join(ss, `result_${Date.now()}.png`);
    const result = canvas.toBuffer('image/png');
    fs.writeFileSync(saveTo, result);
    await Promise.all(
      saved.map((filePath) => {
        return fs.promises
          .unlink(filePath)
          .catch((error) => {
            console.error(`Error deleting file: ${filePath}`, error);
          });
      })
    );
    return saveTo;
  }


exports.pop = async (data) => {
    for (const item of data) {
        const icon = item.icon;
        const shiny = item.shiny || false;
        const { row, col, sheetId } = getSheetAndCoords(icon, shiny, true)
        await edit(col, row, sheetId, shiny, icon)
    }
    const a = await list(saved)
    console.log(saved, a)
    return a
}
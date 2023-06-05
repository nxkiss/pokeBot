var admin = require("firebase-admin");
const path = require('path');

var serviceAccount = require(path.join(__dirname, 'rorian-new-firebase-adminsdk-5tbfb-bde443a5fa.json'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://rorian-new-default-rtdb.firebaseio.com"
});

const reforgedRef = admin.database().ref('Reforged');


exports.getdata = async (id, v) => {
  const childRef = reforgedRef.child(`${id}_${v}`);

  const snapshot = await new Promise((resolve, reject) => {
    childRef.once('value', resolve, reject);
  });

  const pdObject = snapshot.child('pc').val();

  if (pdObject === null) {
    return Promise.reject('Could not find data in database.');
  }

  return pdObject;
};
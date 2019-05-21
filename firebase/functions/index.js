const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { PubSub } = require('@google-cloud/pubsub');
const ytdl = require('ytdl-core');
const request = require('request');
const path = require('path');

admin.initializeApp();
const firestore = admin.firestore();
const messaging = admin.messaging();
const storage = admin.storage();
const settings = functions.config().self;
const pubsub = new PubSub();

exports.onUserSignup = functions.auth
  .user()
  .onCreate(async (user) => {
    const { displayName, email, uid } = user;
    const userRef = firestore.doc(`users/${uid}`);

    const batch = firestore.batch();
    batch.set(userRef, { displayName, email, joined: new Date() });
    return batch.commit();
  });

exports.onCreateVideo = functions.firestore
  .document('videos/{vid}')
  .onCreate(async (snapshot, { params: { vid } }) => {
    const { yid, group: { id: gid } } = snapshot.data();
    const { formats, title, length_seconds } = await ytdl.getInfo(yid);
    const durationInSec = parseInt(length_seconds, 10);
    const filter = format => format.container === 'mp4'
      && format.resolution === '1080p';
    const format = ytdl.chooseFormat(formats, { filter });
    const url = format && format.url;
    const error = url === undefined || url === null;
    const promises = [];

    if (!error) {
      const data = JSON.stringify({ url, gid, vid });
      const dataBuffer = Buffer.from(data);
      promises.push(pubsub.topic(settings.topic).publish(dataBuffer));
    }

    promises.push(snapshot.ref.update({ title, durationInSec, error }));

    return Promise.all(promises);
  });

exports.onPubSub = functions
  .runWith({ timeoutSeconds: 540, memory: '2GB' })
  .pubsub.topic(settings.topic)
  .onPublish(({ json: { url, gid, vid } }) => {
    return new Promise((resolve, reject) => {
      const req = request.get(url);
      req.pause();
      req.on('response', response => {
        const { statusCode } = response;
        if (statusCode !== 200) {
          return reject(new Error(statusCode));
        }

        const filename = [vid, 'mp4'].join('.');

        const stream = storage
          .bucket(settings.bucket)
          .file(path.join(gid, filename))
          .createWriteStream({
            public: true,
            contentType: 'video/mp4'
          });

        req
          .pipe(stream)
          .on('finish', resolve)
          .on('error', error => {
            stream.close();
            reject(error);
          });

        req.resume();
      });

      req.on('error', error => {
        reject(error);
      });
    });
  });

exports.onStorage = functions.storage
  .bucket(settings.bucket)
  .object()
  .onFinalize(async ({ bucket, contentType, name }) => {
    if (!contentType.startsWith('video/')) {
      return;
    }

    const { name: vid, dir: gid } = path.parse(name);

    const url = require('url')
      .resolve(['https', bucket].join('://'), name);

    const videoRef = firestore.doc(`videos/${vid}`);

    const p1 = videoRef.update({ ready: true, url });

    const p2 = firestore
      .collection('v1')
      .where('video', '==', videoRef)
      .get()
      .then(docs => {
        const batch = firestore.batch();
        docs.forEach(doc =>
          batch.set(doc.ref, { enabled: true }, { merge: true }));
        return batch.commit();
      });

    const topic = ['', 'topics', gid].join('/');

    const p3 = messaging.sendToTopic(topic, { data: { url } }, { priority: 'high' });

    return [p1, p2, p3].reduce((p, fn) => p.then(fn), Promise.resolve());
  });

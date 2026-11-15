// GitHub Actions scheduled sender, using standard Web Push (iOS Home Screen compatible).
const admin = require('firebase-admin');
const webPush = require('web-push');
const required = ['FIREBASE_SERVICE_ACCOUNT','WEB_PUSH_PRIVATE_KEY','WEB_PUSH_PUBLIC_KEY','TARGET_UID'];
for (const k of required) if (!process.env[k]) throw new Error('Missing GitHub Actions secret: '+k);
const key = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
if (key.project_id !== 'konee-english') throw new Error('Wrong Firebase project in service account');
admin.initializeApp({credential:admin.credential.cert(key)});
webPush.setVapidDetails('https://dream-page.github.io/KoneeEnglish/', process.env.WEB_PUSH_PUBLIC_KEY, process.env.WEB_PUSH_PRIVATE_KEY);
(async () => {
  const ref = admin.firestore().collection('push_subscriptions').doc(process.env.TARGET_UID);
  const snap = await ref.get();
  if (!snap.exists || !snap.data().enabled || !snap.data().subscription) {
    console.log('No enabled subscription for target UID; nothing sent.');return;
  }
  const message = JSON.stringify({title:"Konee's English",body:'코니의 영어 공부 시간! 오늘도 영어 표현 10분 연습해 볼까요? 📚'});
  try {
    await webPush.sendNotification(snap.data().subscription, message, {TTL:3600, urgency:'normal'});
    console.log('Push accepted by push service');
  } catch (e) {
    console.error('Push failed:', e.statusCode, e.message);
    if (e.statusCode === 404 || e.statusCode === 410) {await ref.delete();console.log('Expired subscription removed');}
    process.exitCode=1;
  }
})().catch(e=>{console.error(e);process.exitCode=1});

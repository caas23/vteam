import 'dotenv/config';

export default {
  expo: {
    name: 'vteam',
    slug: 'vteam',
    scheme: 'exp',
    platforms: ["ios", "android", "web"],
    "deepLinking": {
      "enabled": true
    },
    newArchEnabled: true,
    extra: {
      GITHUB_ID: process.env.GITHUB_ID
    },
    plugins: [
        "expo-secure-store"
    ]
  },
};

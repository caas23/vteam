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
      API_KEY: process.env.API_KEY,
      GITHUB_ID: process.env.GITHUB_ID,
      BACKEND_URL: process.env.BACKEND_URL
    },
    plugins: [
        "expo-secure-store"
    ]
  },
};

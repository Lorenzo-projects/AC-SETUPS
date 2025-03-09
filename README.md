# AC Setup Share

## Configuration Setup

1. Copy `js/config.template.js` to `js/config.js`
2. Edit `js/config.js` with your actual configuration values:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-auth-domain",
     // ...other Firebase config values
   };

   const githubConfig = {
     token: 'your-github-token',
     owner: 'your-github-username',
     repo: 'your-github-repo'
   };
   ```
3. Never commit `config.js` to version control

## Security Notes

- The `config.js` file contains sensitive credentials and is ignored by git
- Always use `config.template.js` as a reference for the required configuration structure
- Keep your credentials secure and never share them publicly

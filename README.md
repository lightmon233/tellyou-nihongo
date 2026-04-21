# Tellyou-Nihongo

This is a Markdown-based Japanese learning blog system built on [Doks](https://github.com/thuliteio/doks), featuring real-time TTS support inspired by the techniques used in [ReadAloud](https://github.com/guozhigq/ReadAloud).

> **⚠️ Warning:** This project is currently in a "just works" state and requires ongoing maintenance and updates. Contributions to improve stability and functionality are welcome.

## Deploy Locally

### 1. Configuration
Update the remote repository settings in `/config/_default/params.toml`. Specifically, ensure you configure the following parameters:
- `schemaAuthorGithub`
- `schemaGithub`
- `docsRepo`

You may also adjust other parameters to customize the site for your production environment.

### 2. Installation & Execution
Run the following commands in your project root directory:

```bash
npm install
npm run start
```

You might run into `Error building site: "/opt/build/repo/layouts/_default/_markup/render-image.html:11:20": execute of template failed: template: _default/_markup/render-image.html:11:20: executing "_default/_markup/render-image.html" at <$image.Resize>: error calling Resize: error calling resources.GetRemote: Get "https://tellyouwhat-static-1251995834.cos.ap-chongqing.myqcloud.com/images/image-20220819225604835.png": context deadline exceeded (Client.Timeout exceeded while awaiting headers)`, this is usually a network issue, try again and it should fix.

### 3. Access

Once the server is running, you can view the site at `http://localhost:1313`.

## Deploy Using Netlify(Recommended)

Just import your github repository to Netlify to deploy, after the deployment, you are good to go.

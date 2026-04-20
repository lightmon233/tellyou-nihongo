# Tellyou-Nihongo

This is a Markdown-based Japanese learning blog system built on [Doks](https://github.com/thuliteio/doks), featuring real-time TTS support inspired by the techniques used in [ReadAloud](https://github.com/guozhigq/ReadAloud).

> **⚠️ Warning:** This project is currently in a "just works" state and requires ongoing maintenance and updates. Contributions to improve stability and functionality are welcome.

## Deployment

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

### 3. Access

Once the server is running, you can view the site at `http://localhost:1313`.

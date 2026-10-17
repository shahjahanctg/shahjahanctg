const fs = require('fs');

const user = process.env.GH_USER || 'shahjahanctg';
const token = process.env.GITHUB_TOKEN;

if (!token) {
  console.error('GITHUB_TOKEN is required.');
  process.exit(1);
}

async function githubApi(url) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      Accept: 'application/vnd.github+json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API request failed (${res.status}): ${text.slice(0, 200)}`);
  }

  return res.json();
}

function buildReadme(repos, prs) {
  const featuredRepos = repos
    .filter((repo) => !repo.fork && repo.name !== user)
    .slice(0, 5)
    .map((repo) => {
      const description = repo.description ? ` — ${repo.description}` : '';
      const language = repo.language ? ` (${repo.language})` : '';
      return `- [${repo.name}](${repo.html_url})${description}${language}`;
    })
    .join('\n');

  const recentPRs = prs
    .slice(0, 6)
    .map((pr) => `- [${pr.title}](${pr.html_url})`)
    .join('\n');

  return `# ${user}

Security tooling and DevOps automation — TypeScript • Python

## 📊 GitHub Activity

![stats](https://github-readme-stats.vercel.app/api?username=${user}&show_icons=true&theme=tokyonight)

![top-langs](https://github-readme-stats.vercel.app/api/top-langs/?username=${user}&layout=compact&theme=tokyonight)

![streak](https://streak-stats.demolab.com?user=${user}&theme=tokyonight)

## 🔥 What I'm Building

${featuredRepos}

## 🧠 Expertise (proven in code)

- DevOps & platform generation
  - [devops-generator](https://github.com/${user}/devops-generator) — Docker, Kubernetes, Helm, Terraform/OpenTofu, Ansible, GitHub Actions, GitLab CI.
- Security automation
  - [cybersecurity-toolkit-suite](https://github.com/${user}/cybersecurity-toolkit-suite) — Python tooling for cyber workflows.
  - [aegis-soc-platform](https://github.com/${user}/aegis-soc-platform) — SOC-oriented platform code.
- Security workflows & analysis UIs
  - [ai-security-compliance](https://github.com/${user}/ai-security-compliance) — security compliance and governance web app.
  - [phishing-email-analyzer-web](https://github.com/${user}/phishing-email-analyzer-web) — phishing analysis and triage interface.
- Validation & release engineering
  - [devops-generator](https://github.com/${user}/devops-generator) — Playwright validation, deployment fixes, backups, health checks, and release work.

## 🛠 Tech Stack

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) ![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)

![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white) ![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?logo=kubernetes&logoColor=white)

![Terraform](https://img.shields.io/badge/Terraform-7B42BC?logo=terraform&logoColor=white) ![Ansible](https://img.shields.io/badge/Ansible-EE0000?logo=ansible&logoColor=white)

![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?logo=githubactions&logoColor=white) ![Playwright](https://img.shields.io/badge/Playwright-45BA4B?logo=playwright&logoColor=white)

## 🌱 Open Source

- Recent merged PRs for ${user}:
${recentPRs || '- No merged PRs found in the last search result.'}

## 📈 Contribution Graph

![activity graph](https://github-readme-activity-graph.vercel.app/graph?username=${user}&theme=tokyonight)

## Quick Links

- [Profile repo](https://github.com/${user}/${user})
- [devops-generator](https://github.com/${user}/devops-generator)
- [ai-security-compliance](https://github.com/${user}/ai-security-compliance)
- [aegis-soc-platform](https://github.com/${user}/aegis-soc-platform)
- [cybersecurity-toolkit-suite](https://github.com/${user}/cybersecurity-toolkit-suite)
- [phishing-email-analyzer-web](https://github.com/${user}/phishing-email-analyzer-web)
`;
}

async function main() {
  const repos = await githubApi(`https://api.github.com/users/${user}/repos?sort=pushed&direction=desc&per_page=100`);
  const repoList = Array.isArray(repos) ? repos : [];
  const mergedPrs = await githubApi(
    `https://api.github.com/search/issues?q=${encodeURIComponent(`author:${user} is:pr is:merged sort:updated-desc`)}&per_page=10`
  );

  const prs = Array.isArray(mergedPrs.items) ? mergedPrs.items : [];
  const readme = buildReadme(repoList, prs);
  fs.writeFileSync('README.md', readme);
  console.log(`README updated for ${user} using ${repoList.length} repos and ${prs.length} merged PRs.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

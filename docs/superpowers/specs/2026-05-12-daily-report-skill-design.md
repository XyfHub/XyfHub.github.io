# Daily Report Skill — Design Spec

## Purpose

A Claude Code skill that generates a detailed daily report from all Claude Code conversations across the day, then publishes it to the user's GitHub Pages blog after review.

## Components

### 1. `scripts/extract_sessions.py`

A zero-dependency Python script (stdlib only: `json`, `os`, `glob`, `datetime`, `argparse`, `collections`).

**Input:**
- `--date YYYY-MM-DD` (single day) OR `--from YYYY-MM-DD --to YYYY-MM-DD` (range)

**Processing:**
- Walk all subdirectories of `~/.claude/projects/`
- Read every `.jsonl` file, filtering entries by `timestamp` field for the target date(s)
- Group entries by `sessionId` and `cwd` (project directory)
- For each session, extract:
  - Start time, end time, duration
  - Project name (derived from `cwd`)
  - User prompts (all messages with `userType: "user"` or similar)
  - Key actions (file edits, git commits, tool calls with significant output)
  - Topic tags (inferred from conversation keywords)

**Output (stdout):** JSON with structure:
```json
{
  "date": "2026-05-12",
  "sessions": [
    {
      "sessionId": "uuid",
      "project": "XyfHub.github.io",
      "startTime": "2026-05-12T09:15:00Z",
      "endTime": "2026-05-12T11:30:00Z",
      "durationMinutes": 135,
      "prompts": [
        {"timestamp": "...", "text": "用户说的内容..."}
      ],
      "actions": [
        {"type": "file_edit", "file": "path/to/file", "summary": "修改了..."},
        {"type": "git_commit", "message": "commit message"}
      ],
      "topics": ["Jekyll", "CSS", "布局调整"]
    }
  ]
}
```

**Error handling:** Exit 0 on success, exit 1 with message on failure (no sessions found for date is NOT a failure — outputs empty session list).

### 2. `SKILL.md`

The skill body guiding Claude through the full workflow.

**Key rules:**
- Always run the script first, don't try to read JSONL files directly
- Craft the blog post from the script's structured output
- Show the full post to the user before touching any files
- Wait for explicit user approval before publishing
- If user says they made manual edits to the file, only do git operations

### 3. Blog post template

Matches existing post conventions (see `_posts/2026-05-10-mcp-integration.md`).

```markdown
---
layout: post
title: "学习笔记：Claude 工作日报 — YYYY年M月D日"
date: YYYY-MM-DD HH:MM:SS +0800
categories: [学习笔记]
tags: [Claude, 日报, 自动推断的主题标签]
---

## 一、今日概览
（2-3 句话概括今天主要做了什么）

## 二、项目 1：<项目名>
### 做了什么
### 关键要点

## 三、项目 2：<项目名>
...

## 四、今日收获
（今天学到的新东西、解决的问题）

## 五、敏感信息检查清单
- [ ] 无 API key / token / 密码
- [ ] 无公司内部路径或配置
- [ ] 无个人身份信息
```

### 4. Publishing (git operations)

Claude performs in the GitHub Pages repo (`~/XyfHub.github.io/`):
1. Write generated markdown to `_posts/YYYY-MM-DD-claude-daily-report.md`
2. `git add _posts/YYYY-MM-DD-claude-daily-report.md`
3. `git commit -m "feat: add daily report for YYYY-MM-DD"`
4. `git push origin master`

## Data Flow

```
User triggers skill (e.g., "生成今天的日报")
  → Claude runs: python scripts/extract_sessions.py --date YYYY-MM-DD
  → Claude reads JSON output
  → Claude generates blog post in conversation
  → User reviews (may edit file manually)
  → User says "发布"
  → Claude: write file → git add → git commit → git push
```

## Error Handling

- **No sessions found:** Claude tells user "今天没有找到 Claude 使用记录"
- **Script error:** Claude reports the error and does not proceed to generation
- **Git push fails:** Claude reports error, suggests manual push
- **Post already exists:** Claude asks user whether to overwrite

## Edge Cases

- **Multi-window same project:** Script groups by sessionId, multiple sessions for same project appear as separate entries
- **Cross-midnight session:** Filter by start time; a session started at 23:00 and ended at 01:00 belongs to the start date
- **Empty session (opened and closed without interaction):** Script includes it but Claude can skip it in the report
- **Subagent sessions:** Script can include or exclude subagent `.jsonl` files based on a flag

## What this skill does NOT do

- Does NOT automate review — human must approve before publishing
- Does NOT run on a schedule — always manually triggered
- Does NOT filter sensitive info automatically — it provides a checklist for human review
- Does NOT support platforms other than GitHub Pages (Jekyll format)

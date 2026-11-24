#!/bin/bash
# 每 24 小时跑一次 linux.do 抓取并提交推送。
# 启动：nohup scripts/linuxdo-loop.sh >/dev/null 2>&1 &
# 停止：kill -INT -$(cat .cache/linuxdo-loop.pgid)
# 不要做成 launchd：launchd 拉起的进程无权访问 ~/Downloads（系统隐私保护），会以 78 退出。
set -m
cd "$(dirname "$0")/.." || exit 1
mkdir -p .cache
ps -o pgid= $$ | tr -d ' ' > .cache/linuxdo-loop.pgid
trap 'echo "$(date "+%F %T") 停止" >> .cache/linuxdo-loop.log; exit 0' INT TERM
while true; do
  echo "$(date "+%F %T") 开始" >> .cache/linuxdo-loop.log
  /opt/homebrew/bin/node scripts/fetch-linuxdo.mjs --commit >> .cache/linuxdo-loop.log 2>&1
  echo "$(date "+%F %T") 结束 EXIT=$?" >> .cache/linuxdo-loop.log
  sleep 86400 &
  wait $!
done

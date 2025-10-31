#!/bin/bash

# 清除Next.js缓存脚本
# 在宝塔面板部署新版本后运行此脚本

echo "正在清除Next.js缓存..."

# 删除.next缓存目录
if [ -d ".next" ]; then
  echo "删除 .next 目录..."
  rm -rf .next
fi

# 删除node_modules/.cache
if [ -d "node_modules/.cache" ]; then
  echo "删除 node_modules/.cache 目录..."
  rm -rf node_modules/.cache
fi

# 重新构建
echo "重新构建项目..."
npm run build

echo "缓存清除完成！"
echo "现在请在宝塔面板重启PM2进程："
echo "1. 进入宝塔面板 -> PM2管理器"
echo "2. 找到你的Next.js应用"
echo "3. 点击 '重启' 按钮"
echo ""
echo "或者在SSH中运行: pm2 restart all"


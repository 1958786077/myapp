#!/bin/bash

# ==========================================
# 强制重新部署脚本（彻底清理版）
# 当普通部署不生效时使用此脚本
# ==========================================

set -e

echo "=========================================="
echo "  🔥 强制重新部署（彻底清理）"
echo "=========================================="
echo ""

# 检查目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 找不到 package.json"
    exit 1
fi

PROJECT_DIR=$(pwd)
echo "📍 项目目录: $PROJECT_DIR"
echo ""

# ==========================================
# 步骤 1: 强制停止所有 Node 和 PM2 进程
# ==========================================
echo "🛑 步骤 1: 强制停止所有进程..."
echo ""

# 停止所有 PM2 进程
if command -v pm2 &> /dev/null; then
    echo "  停止所有 PM2 进程..."
    pm2 stop all 2>/dev/null || true
    pm2 delete all 2>/dev/null || true
    pm2 kill 2>/dev/null || true
    echo "  ✅ PM2 已完全停止"
fi

# 杀死所有 Node 进程（谨慎使用！）
echo "  查找运行中的 Node 进程..."
NODE_PIDS=$(ps aux | grep node | grep -v grep | awk '{print $2}' || true)
if [ -n "$NODE_PIDS" ]; then
    echo "  发现 Node 进程，正在停止..."
    echo "$NODE_PIDS" | xargs kill -9 2>/dev/null || true
    echo "  ✅ Node 进程已停止"
else
    echo "  ℹ️  未发现运行中的 Node 进程"
fi

sleep 2
echo ""

# ==========================================
# 步骤 2: 彻底清理所有构建产物和缓存
# ==========================================
echo "🧹 步骤 2: 彻底清理所有缓存..."
echo ""

# 删除 .next
if [ -d ".next" ]; then
    echo "  删除 .next..."
    rm -rf .next
    echo "  ✅ .next 已删除"
fi

# 删除 node_modules
if [ -d "node_modules" ]; then
    echo "  删除 node_modules..."
    rm -rf node_modules
    echo "  ✅ node_modules 已删除"
fi

# 删除所有锁文件
rm -f package-lock.json 2>/dev/null || true
rm -f yarn.lock 2>/dev/null || true
rm -f pnpm-lock.yaml 2>/dev/null || true
echo "  ✅ 锁文件已删除"

# 清理 npm 缓存
echo "  清理 npm 缓存..."
npm cache clean --force 2>/dev/null || true
echo "  ✅ npm 缓存已清理"

# 清理临时文件
rm -rf /tmp/next-* 2>/dev/null || true
echo "  ✅ 临时文件已清理"

echo ""
echo "✅ 清理完成！"
echo ""

# ==========================================
# 步骤 3: 验证文件是否为最新
# ==========================================
echo "🔍 步骤 3: 验证关键文件..."
echo ""

CHANGED_FILES=0

if [ -f "app/components/Gallery.tsx" ]; then
    echo "  Gallery.tsx 修改时间:"
    ls -lh app/components/Gallery.tsx | awk '{print "    " $6, $7, $8}'
    CHANGED_FILES=$((CHANGED_FILES + 1))
fi

if [ -f "app/page.tsx" ]; then
    echo "  page.tsx 修改时间:"
    ls -lh app/page.tsx | awk '{print "    " $6, $7, $8}'
    CHANGED_FILES=$((CHANGED_FILES + 1))
fi

if [ -f "app/globals.css" ]; then
    echo "  globals.css 修改时间:"
    ls -lh app/globals.css | awk '{print "    " $6, $7, $8}'
    CHANGED_FILES=$((CHANGED_FILES + 1))
fi

echo ""
if [ $CHANGED_FILES -eq 0 ]; then
    echo "⚠️  警告: 未找到关键文件！请确认文件已上传！"
    echo ""
else
    echo "✅ 找到 $CHANGED_FILES 个关键文件"
    echo ""
fi

# ==========================================
# 步骤 4: 重新安装依赖
# ==========================================
echo "📦 步骤 4: 重新安装依赖..."
echo ""

npm install --force
echo ""
echo "✅ 依赖安装完成！"
echo ""

# ==========================================
# 步骤 5: 构建项目
# ==========================================
echo "🔨 步骤 5: 构建项目..."
echo ""

npm run build
echo ""
echo "✅ 构建完成！"
echo ""

# ==========================================
# 步骤 6: 验证构建结果
# ==========================================
echo "🔍 步骤 6: 验证构建结果..."
echo ""

if [ ! -d ".next" ]; then
    echo "❌ 错误: .next 文件夹未生成！"
    exit 1
fi

echo "  .next 文件夹信息:"
du -sh .next 2>/dev/null || ls -ld .next
echo "  ✅ .next 已生成"
echo ""

# ==========================================
# 步骤 7: 启动新的 PM2 进程
# ==========================================
echo "🚀 步骤 7: 启动新进程..."
echo ""

PM2_APP_NAME=$(basename "$PROJECT_DIR")

if command -v pm2 &> /dev/null; then
    # 确保完全删除旧进程
    pm2 delete "$PM2_APP_NAME" 2>/dev/null || true
    sleep 1
    
    # 启动新进程
    echo "  启动 PM2 进程: $PM2_APP_NAME"
    pm2 start npm --name "$PM2_APP_NAME" -- start
    
    # 保存配置
    pm2 save
    
    sleep 2
    
    echo ""
    echo "  📊 PM2 状态："
    pm2 list
    echo ""
    echo "  📝 最近的日志："
    pm2 logs "$PM2_APP_NAME" --lines 20 --nostream
    echo ""
else
    echo "⚠️  未安装 PM2，请手动启动："
    echo "    npm start"
    echo ""
fi

# ==========================================
# 完成
# ==========================================
echo "=========================================="
echo "  ✅ 强制部署完成！"
echo "=========================================="
echo ""
echo "🔧 后续检查："
echo ""
echo "1. 检查 PM2 日志（实时）:"
echo "   pm2 logs $PM2_APP_NAME"
echo ""
echo "2. 检查端口占用:"
echo "   netstat -tlnp | grep :3000"
echo "   或"
echo "   lsof -i :3000"
echo ""
echo "3. 测试本地服务器:"
echo "   curl http://localhost:3000"
echo ""
echo "4. 重载 Nginx（如果使用）:"
echo "   nginx -s reload"
echo "   或宝塔面板：网站 → 重载配置"
echo ""
echo "5. 清除浏览器缓存:"
echo "   - 按 Ctrl+Shift+Delete"
echo "   - 使用无痕模式访问"
echo "   - 手机: 清除浏览器数据"
echo ""
echo "6. 如果还是不行，检查 Nginx 配置:"
echo "   cat /www/server/panel/vhost/nginx/你的域名.conf"
echo ""


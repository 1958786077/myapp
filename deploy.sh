#!/bin/bash

# ==========================================
# Next.js 服务器一键部署脚本
# 使用方法: chmod +x deploy.sh && ./deploy.sh
# ==========================================

set -e  # 遇到错误立即退出

echo "=========================================="
echo "  Next.js 服务器一键部署脚本"
echo "=========================================="
echo ""

# 获取当前目录
PROJECT_DIR=$(pwd)
echo "📍 项目目录: $PROJECT_DIR"
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 当前目录没有 package.json 文件"
    echo "请进入项目根目录（包含 package.json 的目录）"
    exit 1
fi

# 检查 Node.js
echo "🔍 检查环境..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js (v18+)"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js 版本: $NODE_VERSION"
echo ""

# 检查 PM2（可选）
PM2_AVAILABLE=false
if command -v pm2 &> /dev/null; then
    PM2_AVAILABLE=true
    PM2_VERSION=$(pm2 -v)
    echo "✅ PM2 版本: $PM2_VERSION"
else
    echo "⚠️  未安装 PM2（可选，用于进程管理）"
fi
echo ""

# ==========================================
# 步骤 1: 清理旧的构建文件和缓存
# ==========================================
echo "🧹 步骤 1: 清理旧文件和缓存..."
echo ""

# 停止 PM2 进程（如果存在）
if [ "$PM2_AVAILABLE" = true ]; then
    PM2_APP_NAME=$(basename "$PROJECT_DIR")
    if pm2 list | grep -q "$PM2_APP_NAME"; then
        echo "  停止 PM2 进程: $PM2_APP_NAME"
        pm2 stop "$PM2_APP_NAME" || true
        echo "  ✅ PM2 进程已停止"
    fi
fi

if [ -d ".next" ]; then
    echo "  删除 .next 文件夹（构建缓存）..."
    rm -rf .next
    echo "  ✅ .next 已删除"
else
    echo "  ℹ️  .next 文件夹不存在，跳过"
fi

# 清理 Next.js 缓存目录
if [ -d ".next/cache" ]; then
    echo "  删除 .next/cache 缓存..."
    rm -rf .next/cache
    echo "  ✅ Next.js 缓存已删除"
fi

if [ -d "node_modules" ]; then
    echo "  删除 node_modules 文件夹..."
    rm -rf node_modules
    echo "  ✅ node_modules 已删除"
else
    echo "  ℹ️  node_modules 文件夹不存在，跳过"
fi

if [ -f "package-lock.json" ]; then
    echo "  删除 package-lock.json..."
    rm -f package-lock.json
    echo "  ✅ package-lock.json 已删除"
fi

# 清理 npm 缓存（可选，但能确保干净）
echo "  清理 npm 缓存..."
npm cache clean --force 2>/dev/null || true
echo "  ✅ npm 缓存已清理"

echo ""
echo "✅ 清理完成！"
echo ""

# ==========================================
# 步骤 2: 安装依赖
# ==========================================
echo "📦 步骤 2: 安装依赖..."
echo ""

npm install
echo ""
echo "✅ 依赖安装完成！"
echo ""

# ==========================================
# 步骤 3: 构建项目
# ==========================================
echo "🔨 步骤 3: 构建项目..."
echo ""

npm run build
echo ""
echo "✅ 构建完成！"
echo ""

# ==========================================
# 步骤 4: 验证构建结果
# ==========================================
echo "🔍 步骤 4: 验证构建结果..."
echo ""

if [ ! -d ".next" ]; then
    echo "❌ 错误: .next 文件夹未生成，构建可能失败"
    exit 1
fi

echo "  ✅ .next 文件夹已生成"
echo "  ✅ 构建产物验证通过"
echo ""

# ==========================================
# 步骤 5: 重启应用（如果使用 PM2）
# ==========================================
PM2_APP_NAME=$(basename "$PROJECT_DIR")

if [ "$PM2_AVAILABLE" = true ]; then
    echo "🔄 步骤 5: 重启 PM2 进程..."
    echo ""
    
    if pm2 list | grep -q "$PM2_APP_NAME"; then
        echo "  删除现有 PM2 应用（确保完全重启）..."
        pm2 delete "$PM2_APP_NAME" 2>/dev/null || true
        echo "  ✅ 旧进程已删除"
    fi
    
    echo "  启动新的 PM2 应用..."
    pm2 start npm --name "$PM2_APP_NAME" -- start
    echo "  ✅ PM2 应用已启动"
    
    # 保存 PM2 配置
    pm2 save 2>/dev/null || true
    
    echo ""
    echo "  📊 PM2 状态："
    pm2 list | grep "$PM2_APP_NAME" || echo "    (未找到进程)"
    echo ""
else
    echo "⚠️  步骤 5: 跳过 PM2 管理（未安装 PM2）"
    echo "  如需启动应用，请运行: npm start"
    echo ""
fi

# ==========================================
# 部署完成
# ==========================================
echo "=========================================="
echo "  ✅ 部署完成！"
echo "=========================================="
echo ""
echo "📋 后续操作："
echo ""
echo "1. 如果使用 PM2:"
echo "   pm2 status                    # 查看进程状态"
echo "   pm2 logs $PM2_APP_NAME         # 查看日志"
echo ""
echo "2. 如果未使用 PM2:"
echo "   npm start                     # 启动生产服务器"
echo ""
echo "3. 清除 Nginx 缓存（如果使用 Nginx）:"
echo "   systemctl reload nginx        # 重新加载 Nginx"
echo "   或在宝塔面板：网站 → 设置 → 重载配置"
echo ""
echo "4. 清除浏览器缓存："
echo "   - Chrome/Edge: Ctrl+Shift+Delete → 清除缓存"
echo "   - 或按 F12 → 右键刷新按钮 → '清空缓存并硬性重新加载'"
echo "   - 手机浏览器: 清除缓存或使用无痕模式"
echo ""
echo "5. 验证部署："
echo "   访问你的网站 URL，按 Ctrl+F5 强制刷新"
echo ""


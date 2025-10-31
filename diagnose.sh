#!/bin/bash

# ==========================================
# 问题诊断脚本
# 用于诊断为什么更新不生效
# ==========================================

echo "=========================================="
echo "  🔍 问题诊断工具"
echo "=========================================="
echo ""

PROJECT_DIR=$(pwd)
echo "📍 当前目录: $PROJECT_DIR"
echo ""

# ==========================================
# 1. 检查文件修改时间
# ==========================================
echo "=========================================="
echo "1️⃣  检查关键文件修改时间"
echo "=========================================="
echo ""

if [ -f "app/components/Gallery.tsx" ]; then
    echo "📄 Gallery.tsx:"
    ls -lh app/components/Gallery.tsx
    echo ""
else
    echo "❌ 找不到 Gallery.tsx"
    echo ""
fi

if [ -f "app/page.tsx" ]; then
    echo "📄 page.tsx:"
    ls -lh app/page.tsx
    echo ""
else
    echo "❌ 找不到 page.tsx"
    echo ""
fi

if [ -f "app/globals.css" ]; then
    echo "📄 globals.css:"
    ls -lh app/globals.css
    echo ""
else
    echo "❌ 找不到 globals.css"
    echo ""
fi

# ==========================================
# 2. 检查构建产物
# ==========================================
echo "=========================================="
echo "2️⃣  检查 .next 构建产物"
echo "=========================================="
echo ""

if [ -d ".next" ]; then
    echo "📦 .next 文件夹信息:"
    ls -lhd .next
    echo ""
    echo "大小:"
    du -sh .next
    echo ""
    echo "最近修改的文件:"
    find .next -type f -mmin -60 | head -10
    echo ""
else
    echo "❌ .next 文件夹不存在！需要运行 npm run build"
    echo ""
fi

# ==========================================
# 3. 检查 Node 进程
# ==========================================
echo "=========================================="
echo "3️⃣  检查运行中的 Node 进程"
echo "=========================================="
echo ""

NODE_PROCESSES=$(ps aux | grep node | grep -v grep || true)
if [ -n "$NODE_PROCESSES" ]; then
    echo "🟢 找到运行中的 Node 进程:"
    echo "$NODE_PROCESSES"
    echo ""
else
    echo "⚠️  未找到运行中的 Node 进程"
    echo ""
fi

# ==========================================
# 4. 检查 PM2 状态
# ==========================================
echo "=========================================="
echo "4️⃣  检查 PM2 状态"
echo "=========================================="
echo ""

if command -v pm2 &> /dev/null; then
    echo "PM2 进程列表:"
    pm2 list
    echo ""
    
    PM2_APP_NAME=$(basename "$PROJECT_DIR")
    if pm2 list | grep -q "$PM2_APP_NAME"; then
        echo "📝 $PM2_APP_NAME 最近日志:"
        pm2 logs "$PM2_APP_NAME" --lines 30 --nostream
        echo ""
    else
        echo "⚠️  未找到名为 $PM2_APP_NAME 的 PM2 应用"
        echo ""
    fi
else
    echo "⚠️  PM2 未安装"
    echo ""
fi

# ==========================================
# 5. 检查端口占用
# ==========================================
echo "=========================================="
echo "5️⃣  检查端口 3000 占用情况"
echo "=========================================="
echo ""

PORT_CHECK=$(netstat -tlnp 2>/dev/null | grep :3000 || lsof -i :3000 2>/dev/null || true)
if [ -n "$PORT_CHECK" ]; then
    echo "🟢 端口 3000 被占用:"
    echo "$PORT_CHECK"
    echo ""
else
    echo "❌ 端口 3000 未被占用（应用可能未运行）"
    echo ""
fi

# ==========================================
# 6. 测试本地服务
# ==========================================
echo "=========================================="
echo "6️⃣  测试本地服务"
echo "=========================================="
echo ""

if command -v curl &> /dev/null; then
    echo "测试 http://localhost:3000"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ 服务正常响应 (HTTP $HTTP_CODE)"
        echo ""
        echo "获取首页内容（前 500 字符）:"
        curl -s http://localhost:3000 2>/dev/null | head -c 500
        echo ""
        echo "..."
    elif [ "$HTTP_CODE" = "000" ]; then
        echo "❌ 无法连接到服务"
    else
        echo "⚠️  服务响应异常 (HTTP $HTTP_CODE)"
    fi
    echo ""
else
    echo "⚠️  curl 未安装，跳过本地测试"
    echo ""
fi

# ==========================================
# 7. 检查 Nginx 配置
# ==========================================
echo "=========================================="
echo "7️⃣  检查 Nginx 配置"
echo "=========================================="
echo ""

# 查找可能的 Nginx 配置文件
NGINX_CONF_DIRS=(
    "/www/server/panel/vhost/nginx"
    "/etc/nginx/sites-enabled"
    "/etc/nginx/conf.d"
)

FOUND_CONF=false
for dir in "${NGINX_CONF_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "📂 检查目录: $dir"
        CONF_FILES=$(ls "$dir"/*.conf 2>/dev/null || true)
        if [ -n "$CONF_FILES" ]; then
            echo "$CONF_FILES"
            FOUND_CONF=true
        fi
        echo ""
    fi
done

if [ "$FOUND_CONF" = false ]; then
    echo "ℹ️  未找到 Nginx 配置文件（可能未使用 Nginx）"
    echo ""
fi

# ==========================================
# 总结
# ==========================================
echo "=========================================="
echo "  📋 诊断总结"
echo "=========================================="
echo ""
echo "请检查以上输出，特别注意："
echo ""
echo "1. 文件修改时间是否为最近？"
echo "2. .next 文件夹是否存在且最近更新？"
echo "3. PM2 进程是否正在运行？"
echo "4. 端口 3000 是否被占用？"
echo "5. 本地服务是否能正常访问？"
echo "6. Nginx 配置是否正确？"
echo ""
echo "如果以上都正常但网站还是旧的，可能是："
echo "- 浏览器缓存（清除缓存或用无痕模式）"
echo "- CDN 缓存（如果使用了 CDN）"
echo "- Nginx 缓存（重载 Nginx 配置）"
echo ""


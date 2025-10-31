# 宝塔面板部署指南

## 问题解决方案总结

### 1. 手机端作品集图片重叠问题 ✅ 已修复
- 优化了移动端网格布局配置
- 调整了间距和缩放比例，防止图片重叠
- 禁用了移动端的复杂动画以提升性能

### 2. Controls控制区域尺寸 ✅ 已调整
- 增大了控制按钮的尺寸（字体、内边距、间距）
- 优化了移动端的缩放比例

### 3. 黑色方块问题 ✅ 已修复
- 将作品集图片背后的可见性覆盖层设置为完全透明
- 不影响原有功能，只是视觉上不可见

### 4. 宝塔面板缓存问题 ✅ 已配置

## 宝塔面板缓存问题解决方案

### 方案一：使用配置文件（推荐）
已在 `next.config.js` 中添加了禁用缓存的配置：
- 设置了HTTP缓存头禁用浏览器缓存
- 使用时间戳作为build ID，确保每次构建都是唯一的

**部署步骤：**
1. 上传新代码到服务器
2. SSH连接到服务器
3. 进入项目目录：`cd /www/wwwroot/你的项目路径`
4. 重新安装依赖（如有必要）：`npm install`
5. 构建项目：`npm run build`
6. 重启PM2：`pm2 restart all` 或 `pm2 restart 你的应用名称`
7. **清除浏览器缓存**：按 `Ctrl+Shift+Delete`（或 `Cmd+Shift+Delete`）

### 方案二：使用清除缓存脚本
已创建 `clear-cache.sh` 脚本，包含完整的清除缓存流程。

**使用方法：**
```bash
cd /www/wwwroot/你的项目路径/New_site
chmod +x clear-cache.sh
./clear-cache.sh
```

### 方案三：手动清除缓存
如果上述方法仍有问题，可以手动执行：

```bash
# 1. 进入项目目录
cd /www/wwwroot/你的项目路径/New_site

# 2. 停止PM2进程
pm2 stop all

# 3. 删除缓存文件
rm -rf .next
rm -rf node_modules/.cache

# 4. 重新构建
npm run build

# 5. 启动PM2进程
pm2 start all

# 6. 保存PM2配置
pm2 save
```

### 方案四：在宝塔面板中设置
1. 登录宝塔面板
2. 进入 **网站** -> 选择你的站点 -> **设置**
3. 找到 **静态文件缓存** 或 **Nginx配置**
4. 添加以下配置到 location 块中：

```nginx
location / {
    proxy_pass http://localhost:你的端口号;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    
    # 禁用缓存
    proxy_no_cache 1;
    proxy_cache_bypass 1;
    add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
    add_header Pragma "no-cache";
    add_header Expires "0";
}
```

5. 保存并重启Nginx

### 浏览器缓存清除
部署新版本后，用户端也需要清除浏览器缓存：
- **Chrome/Edge**: `Ctrl+Shift+Delete` (Windows) 或 `Cmd+Shift+Delete` (Mac)
- **硬刷新**: `Ctrl+F5` (Windows) 或 `Cmd+Shift+R` (Mac)

## 常见问题

### Q: 为什么修改后还是看到旧版本？
**A:** 可能有以下几个缓存层：
1. Next.js构建缓存 - 使用 `rm -rf .next` 清除
2. Node.js模块缓存 - 使用 `rm -rf node_modules/.cache` 清除
3. Nginx缓存 - 重启Nginx或添加禁用缓存配置
4. 浏览器缓存 - 按 `Ctrl+Shift+Delete` 清除
5. CDN缓存（如果使用）- 在CDN控制台清除

### Q: 如何验证是否是最新版本？
**A:** 
1. 打开浏览器开发者工具（F12）
2. 进入 Network 标签
3. 勾选 "Disable cache"
4. 刷新页面
5. 检查文件的加载时间和内容

### Q: PM2重启后还是旧版本怎么办？
**A:** 
1. 确认构建目录 `.next` 已删除并重新构建
2. 检查PM2是否指向正确的目录：`pm2 list`
3. 完全删除PM2进程并重新添加：
   ```bash
   pm2 delete all
   pm2 start npm --name "your-app" -- start
   pm2 save
   ```

## 性能优化建议

### 移动端优化
- ✅ 已禁用移动端复杂的可见性动画
- ✅ 已优化网格布局，减少重叠
- ✅ 已调整缩放比例，适配小屏幕

### 生产环境建议
如果您的网站是正式生产环境，**不建议完全禁用缓存**，因为会影响性能。
建议使用**版本控制**的方式：

1. 恢复 `next.config.js` 中的缓存配置（移除 no-cache 设置）
2. 每次更新时修改静态资源的版本号
3. 使用构建ID来标识版本：已在配置中使用时间戳

## 联系支持
如果问题仍然存在，请提供：
1. 宝塔面板版本
2. Node.js版本（`node -v`）
3. PM2版本（`pm2 -v`）
4. 错误日志（`pm2 logs`）


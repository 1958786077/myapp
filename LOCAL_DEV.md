# 本地开发服务器启动指南

## ✅ 已修复的问题

1. **配置文件优化** - 修复了 `next.config.js` 的语法问题
2. **开发环境优化** - 缓存配置仅在生产环境启用，开发环境不受影响

## 🚀 启动方法

### 方法一：使用npm命令（推荐）

```bash
# 进入项目目录
cd c:\baidunetdiskdownload\WeFriends\New_site

# 启动开发服务器
npm run dev
```

### 方法二：如果端口3000被占用

```bash
# 使用其他端口启动
npm run dev -- -p 3001
```

## 📍 访问地址

启动成功后，访问以下地址：

- **首页**: http://localhost:3000
- **后台登录**: http://localhost:3000/admin/login
- **后台管理**: http://localhost:3000/admin

## 🔧 常见问题解决

### 问题1：端口3000已被占用

**解决方案：**
```bash
# 查看占用端口的进程
netstat -ano | findstr :3000

# 或者使用其他端口
npm run dev -- -p 3001
```

### 问题2：依赖未安装

**解决方案：**
```bash
npm install
npm run dev
```

### 问题3：编译错误

**解决方案：**
1. 删除 `.next` 文件夹
2. 重新安装依赖
3. 重新启动

```bash
rmdir /s /q .next
npm install
npm run dev
```

### 问题4：服务器无法启动

**检查步骤：**

1. **检查Node.js版本**
   ```bash
   node -v
   ```
   需要 Node.js 18 或更高版本

2. **检查依赖**
   ```bash
   npm list
   ```

3. **清除缓存后重新安装**
   ```bash
   rmdir /s /q node_modules
   rmdir /s /q .next
   npm install
   npm run dev
   ```

## 📝 开发命令

- `npm run dev` - 启动开发服务器（热重载）
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器（需要先build）

## 🎯 开发提示

1. **热重载**：修改代码后，页面会自动刷新
2. **控制台输出**：查看终端输出的错误信息
3. **浏览器控制台**：按 F12 打开开发者工具查看前端错误

## ⚠️ 注意事项

- 开发服务器仅在开发时使用
- 生产环境请使用 `npm run build` 和 `npm run start`
- 修改配置文件（如 `next.config.js`）后需要重启服务器

## 🆘 如果还是无法启动

请提供以下信息以便诊断：

1. Node.js 版本：`node -v`
2. npm 版本：`npm -v`
3. 错误信息：终端中显示的完整错误信息


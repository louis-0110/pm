# SVN 功能快速测试指南

## 测试环境
- **测试仓库路径**: `D:\Projects\pm\temp\svn-working-copy`
- **SVN 版本**: 1.14.2
- **当前修订版**: r1

## 快速开始

### 1. 启动应用（开发模式）
```bash
cd D:\Projects\pm
npm run tauri dev
```

### 2. 添加测试 SVN 仓库

#### 方法 A: 通过 UI 添加
1. 打开应用
2. 选择一个项目（或创建新项目）
3. 点击"添加仓库"按钮
4. 浏览到: `D:\Projects\pm\temp\svn-working-copy`
5. 系统会自动识别为 SVN 仓库
6. 输入仓库名称: "测试 SVN 仓库"
7. 点击"确定"

#### 方法 B: 通过数据库添加
```sql
INSERT INTO repositories (name, path, project_id, vcs)
VALUES ('测试 SVN 仓库', 'D:\Projects\pm\temp\svn-working-copy', 1, 'svn');
```

### 3. 测试状态显示
打开项目详情页，你应该看到：
- 仓库卡片上显示 "SVN" 标签
- 状态徽章显示版本号: `r1`
- 状态显示: "干净"

### 4. 测试修改检测
修改一个文件：
```bash
echo "// 测试修改" >> D:\Projects\pm\temp\svn-working-copy\test.js
```

刷新应用，你应该看到：
- 状态变为: "1 个文件已修改"
- 文件列表中显示 `test.js`

### 5. 测试 SVN 操作

#### 5.1 查看 Diff
1. 点击"查看 Diff"按钮
2. 应该显示 test.js 的变更

#### 5.2 提交更改
1. 点击"提交"按钮
2. 输入提交消息: "测试提交"
3. 点击"确认"
4. 应该显示成功消息
5. 状态变为 "干净"

#### 5.3 更新操作
1. 在另一个终端修改仓库并提交
2. 在应用中点击"更新"按钮
3. 应该显示更新成功

#### 5.4 打开终端
1. 点击"终端"按钮
2. 应该打开命令提示符到仓库路径

### 6. 测试错误处理

#### 6.1 SVN 未安装
1. 卸载 SVN（仅测试）
2. 尝试添加 SVN 仓库
3. 应该显示安装提示

#### 6.2 不是工作副本
1. 选择一个普通文件夹
2. 尝试添加为 SVN 仓库
3. 应该显示错误提示

### 7. 验证 SVN 命令
在终端中验证：
```bash
# 查看状态
cd D:\Projects\pm\temp\svn-working-copy
svn status

# 查看信息
svn info

# 查看日志
svn log

# 查看差异
svn diff
```

## 测试清单

- [ ] 应用正常启动
- [ ] SVN 仓库正确识别
- [ ] 状态信息正确显示
- [ ] 版本号显示正确
- [ ] 修改检测正常
- [ ] Diff 显示正确
- [ ] 提交功能正常
- [ ] 更新功能正常
- [ ] 终端打开正常
- [ ] 错误提示友好

## 已知测试文件

### README.md
```markdown
# SVN 测试仓库
...
```

### test.js
```javascript
// SVN 测试脚本
console.log('SVN 测试');

function test() {
    return 'Hello SVN!';
}
```

## 故障排除

### 问题: SVN 命令无法执行
**解决方案**:
1. 确认 SVN 已安装: `svn --version`
2. 检查 SVN 在 PATH 中
3. 重启应用

### 问题: 状态不更新
**解决方案**:
1. 刷新页面
2. 重新进入仓库详情
3. 检查浏览器控制台错误

### 问题: 提交失败
**解决方案**:
1. 检查文件权限
2. 确认有网络连接（如果是远程仓库）
3. 查看详细错误信息

## 清理测试环境

测试完成后，可以删除测试目录：
```bash
rm -rf D:\Projects\pm\temp
```

或在数据库中删除测试记录：
```sql
DELETE FROM repositories WHERE path LIKE '%svn-working-copy%';
```

---

**祝测试顺利！** 🚀

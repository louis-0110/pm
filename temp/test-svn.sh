#!/bin/bash
# SVN 功能测试脚本

echo "=== SVN 功能测试 ==="
echo ""

# 测试路径
TEST_PATH="D:\\Projects\\pm\\temp\\svn-working-copy"

echo "1. 测试路径: $TEST_PATH"
echo ""

# 1. 测试 SVN info
echo "2. 执行 svn info:"
svn info "$TEST_PATH"
echo ""

# 3. 测试 SVN status
echo "3. 执行 svn status:"
svn status "$TEST_PATH"
echo ""

# 4. 测试 SVN diff (修改文件后)
echo "4. 修改测试文件..."
echo "// 修改测试" >> "$TEST_PATH/test.js"

echo "5. 执行 svn diff:"
svn diff "$TEST_PATH"
echo ""

# 6. 恢复文件
echo "6. 恢复文件..."
svn revert "$TEST_PATH/test.js"

echo "=== 测试完成 ==="

#!/bin/bash

export NODE_ENV=production
# 后续这个地址需要变成服务的地址
export DATA_PATH=../data

# 为 nginx 目录设置适当的权限
chmod -R 777 .

# 创建必要的目录
mkdir -p "${DATA_PATH}/nginx/conf"

# 检查 nginx.conf 文件是否存在
if [ -f ./config/nginx.conf ]; then
  # 复制文件到目标位置
  cp ./config/nginx.conf "${DATA_PATH}/nginx/conf"

  # 输出文件内容（可调试用）
  echo "复制前的文件内容："
  cat ./config/nginx.conf

  echo "复制后的文件内容："
  cat "${DATA_PATH}/nginx/conf/nginx.conf"

else
  echo "nginx.conf 文件不存在，无法复制。"
  exit 1
fi

# 构建并启动生产环境
docker compose -f docker-compose-prod.yml up -d

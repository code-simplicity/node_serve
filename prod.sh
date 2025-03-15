#!/bin/bash

export NODE_ENV=production
# 后续这个地址需要变成服务的地址
export DATA_PATH=./data

# 为整个文件夹添加操作权限
chmod -R 755 .

# 创建必要的目录
mkdir -p "${DATA_PATH}/nginx/conf"

# 复制 nginx.conf 到目标目录
cp ./config/nginx.conf "${DATA_PATH}/nginx/conf"

# 构建并启动开发环境
docker compose -f docker-compose-prod.yml up -d